import { Elysia, t } from "elysia";
import { db } from "./db/index.js";
import { sessions, students } from "./db/schema.js";
import { eq } from "drizzle-orm";
import { getUserFromHeaders } from "./auth.js";
import { buildMentorMessages, buildSummaryMessages, type MentorContext } from "./mentor.js";
import { chat, OpenRouterError } from "./openrouter.js";

type SessionRow = {
  id: number;
  studentId: number;
  gameId: string;
  gameTitle: string;
  startedAt: Date;
  completedAt: Date | null;
  finalScore: number | null;
  status: string;
  events: any[];
  summary: string | null;
};

export const sessionRoutes = new Elysia({ prefix: "/sessions" })

  .post(
    "/start",
    async ({ headers, body, set }) => {
      const user = await getUserFromHeaders(headers as any);
      if (!user || user.role !== "student") {
        set.status = 403;
        return { success: false, message: "Only students can start sessions" };
      }

      const result = await db
        .insert(sessions)
        .values({
          studentId: user.id,
          gameId: body.gameId,
          gameTitle: body.gameTitle,
          status: "active",
          events: [],
        })
        .returning() as SessionRow[];

      return { success: true, sessionId: result[0].id };
    },
    { body: t.Object({ gameId: t.String(), gameTitle: t.String() }) }
  )

  .post(
    "/:id/attempt",
    async ({ headers, params, body, set }) => {
      const user = await getUserFromHeaders(headers as any);
      const sessionResult = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, Number(params.id)))
        .limit(1) as SessionRow[];

      const session = sessionResult[0];
      if (!user || !session || session.studentId !== user.id) {
        set.status = 403;
        return { success: false, message: "Not your session" };
      }

      const newEvents = [
        ...(session.events as any[]),
        {
          type: "attempt",
          at: new Date().toISOString(),
          payload: { code: body.code, answer: body.answer, passed: body.passed, error: body.error },
        },
      ];

      await db
        .update(sessions)
        .set({ events: newEvents })
        .where(eq(sessions.id, session.id));

      return { success: true };
    },
    {
      body: t.Object({
        passed: t.Boolean(),
        code: t.Optional(t.String()),
        answer: t.Optional(t.String()),
        error: t.Optional(t.String()),
      }),
    }
  )

  .post(
    "/:id/hint",
    async ({ headers, params, body, set }) => {
      const user = await getUserFromHeaders(headers as any);
      const sessionResult = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, Number(params.id)))
        .limit(1) as SessionRow[];

      const session = sessionResult[0];
      if (!user || !session || session.studentId !== user.id) {
        set.status = 403;
        return { success: false, message: "Not your session" };
      }

      const events = session.events as any[];
      const hintsGivenSoFar = events.filter((e: any) => e.type === "hint_given").length;

      if (hintsGivenSoFar >= 5) {
        return {
          success: true,
          hint: "You've used all your hints for this session — try working through it with what you have, or ask your teacher!",
          hintsRemaining: 0,
        };
      }

      const requestEvent = {
        type: "hint_request",
        at: new Date().toISOString(),
        payload: { studentMessage: body.studentMessage },
      };

      const ctx: MentorContext = {
        gameTitle: session.gameTitle,
        problemStatement: body.problemStatement,
        studentAttempt: body.studentAttempt,
        expectedBehavior: body.expectedBehavior,
        lastError: body.lastError,
        hintsGivenSoFar,
        studentMessage: body.studentMessage,
      };

      try {
        const hint = await chat(buildMentorMessages(ctx), { temperature: 0.6, maxTokens: 250 });
        const hintEvent = {
          type: "hint_given",
          at: new Date().toISOString(),
          payload: { hint },
        };

        await db
          .update(sessions)
          .set({ events: [...events, requestEvent, hintEvent] })
          .where(eq(sessions.id, session.id));

        return { success: true, hint, hintsRemaining: 4 - hintsGivenSoFar };
      } catch (err) {
        const e = err as OpenRouterError;
        console.error("Mentor error:", e.message);
        set.status = 502;
        return { success: false, message: "Mentor is unavailable right now." };
      }
    },
    {
      body: t.Object({
        problemStatement: t.String(),
        studentAttempt: t.Optional(t.String()),
        expectedBehavior: t.Optional(t.String()),
        lastError: t.Optional(t.String()),
        studentMessage: t.Optional(t.String()),
      }),
    }
  )

  .post(
    "/:id/complete",
    async ({ headers, params, body, set }) => {
      const user = await getUserFromHeaders(headers as any);
      const sessionResult = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, Number(params.id)))
        .limit(1) as SessionRow[];

      const session = sessionResult[0];
      if (!user || !session || session.studentId !== user.id) {
        set.status = 403;
        return { success: false, message: "Not your session" };
      }

      if (session.status !== "active") {
        return { success: true, sessionId: session.id, summary: session.summary };
      }

      let summary: string | null = null;
      try {
        const sessionForSummary = {
          ...session,
          startedAt: session.startedAt.toISOString(),
          completedAt: new Date().toISOString(),
          finalScore: body.score,
          status: "completed" as const,
          events: session.events as any[],
          summary: null,
        };
        summary = await chat(
          buildSummaryMessages(sessionForSummary, user.name),
          { temperature: 0.3, maxTokens: 250 }
        );
      } catch (err) {
        console.error("Summary error:", (err as Error).message);
      }

      const completedEvent = {
        type: "completed",
        at: new Date().toISOString(),
        payload: { score: body.score },
      };

      await db
        .update(sessions)
        .set({
          status: "completed",
          completedAt: new Date(),
          finalScore: body.score,
          summary,
          events: [...(session.events as any[]), completedEvent],
        })
        .where(eq(sessions.id, session.id));

      await db
        .update(students)
        .set({ totalScore: (user.totalScore ?? 0) + body.score })
        .where(eq(students.id, user.id));

      return { success: true, sessionId: session.id, summary };
    },
    { body: t.Object({ score: t.Number() }) }
  )

  .get("/mine", async ({ headers, set }) => {
    const user = await getUserFromHeaders(headers as any);
    if (!user) {
      set.status = 401;
      return { success: false, message: "Auth required" };
    }

    const result = await db
      .select()
      .from(sessions)
      .where(eq(sessions.studentId, user.id)) as SessionRow[];

    return {
      success: true,
      sessions: result.sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      ),
    };
  })

  .get("/student/:studentId", async ({ headers, params, set }) => {
    const user = await getUserFromHeaders(headers as any);
  if (!user || user.role !== "teacher") {      
      set.status = 403;
      return { success: false, message: "Teacher or admin only" };
    }

    const result = await db
      .select()
      .from(sessions)
      .where(eq(sessions.studentId, Number(params.studentId))) as SessionRow[];

    return { success: true, sessions: result };
  });