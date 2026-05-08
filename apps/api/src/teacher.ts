import { Elysia, t } from "elysia";
import { db } from "./db/index.js";
import { teachers, students, games, studentGameAccess } from "./db/schema.js";
import { eq } from "drizzle-orm";

type GameRow = {
  id: number;
  teacherId: number;
  title: string;
  description: string | null;
  content: unknown;
  isPublished: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

type StudentRow = {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
  teacherId: number;
  totalScore: number | null;
  createdAt: Date;
};

export const teacherRoutes = new Elysia({ prefix: "/teacher" })

  .get("/students/:teacherId", async ({ params, set }) => {
    const teacherId = Number(params.teacherId);

    const teacherExists = await db
      .select()
      .from(teachers)
      .where(eq(teachers.id, teacherId))
      .limit(1);

    if (teacherExists.length === 0) {
      set.status = 404;
      return { success: false, message: "Teacher not found" };
    }

    const studentList = await db
      .select()
      .from(students)
      .where(eq(students.teacherId, teacherId)) as StudentRow[];

    return {
      success: true,
      students: studentList.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        totalScore: s.totalScore ?? 0,
        createdAt: s.createdAt,
      })),
    };
  })

  .post(
    "/games",
    async ({ body, set }) => {
      const { title, description, content, teacherId } = body;
      const tId = Number(teacherId);

      const teacherExists = await db
        .select()
        .from(teachers)
        .where(eq(teachers.id, tId))
        .limit(1);

      if (teacherExists.length === 0) {
        set.status = 404;
        return { success: false, message: "Teacher not found" };
      }

      const result = await db
        .insert(games)
        .values({
          teacherId: tId,
          title,
          description,
          content: typeof content === "string" ? JSON.parse(content) : content,
        })
        .returning() as GameRow[];

      const newGame = result[0] as GameRow;

      return {
        success: true,
        game: {
          id: newGame.id,
          title: newGame.title,
          description: newGame.description,
          createdAt: newGame.createdAt,
        },
      };
    },
    {
      body: t.Object({
        teacherId: t.Number(),
        title: t.String(),
        description: t.String(),
        content: t.Any(),
      }),
    }
  )

  .get("/games/:teacherId", async ({ params, set }) => {
    const teacherId = Number(params.teacherId);

    const teacherExists = await db
      .select()
      .from(teachers)
      .where(eq(teachers.id, teacherId))
      .limit(1);

    if (teacherExists.length === 0) {
      set.status = 404;
      return { success: false, message: "Teacher not found" };
    }

    const gameList = await db
      .select()
      .from(games)
      .where(eq(games.teacherId, teacherId)) as GameRow[];

    const accessList = await db.select().from(studentGameAccess);

    return {
      success: true,
      games: gameList.map((g) => ({
        id: g.id,
        title: g.title,
        description: g.description,
        studentCount: accessList.filter((a) => a.gameId === g.id).length,
        createdAt: g.createdAt,
      })),
    };
  })

  .post(
    "/games/:gameId/assign",
    async ({ body, params, set }) => {
      const gameId = Number(params.gameId);
      const { studentIds } = body;

      const gameExists = await db
        .select()
        .from(games)
        .where(eq(games.id, gameId))
        .limit(1);

      if (gameExists.length === 0) {
        set.status = 404;
        return { success: false, message: "Game not found" };
      }

      for (const studentId of studentIds) {
        await db.insert(studentGameAccess).values({ studentId, gameId });
      }

      return { success: true, message: `Game assigned to ${studentIds.length} students` };
    },
    {
      body: t.Object({
        studentIds: t.Array(t.Number()),
      }),
    }
  )

  .put(
    "/games/:gameId",
    async ({ body, params, set }) => {
      const gameId = Number(params.gameId);
      const { title, description, content } = body;

      const gameExists = await db
        .select()
        .from(games)
        .where(eq(games.id, gameId))
        .limit(1) as GameRow[];

      if (gameExists.length === 0) {
        set.status = 404;
        return { success: false, message: "Game not found" };
      }

      const currentGame = gameExists[0] as GameRow;

      const result = await db
        .update(games)
        .set({
          title: title || currentGame.title,
          description: description || currentGame.description,
          content: content
            ? typeof content === "string" ? JSON.parse(content) : content
            : currentGame.content,
          updatedAt: new Date(),
        })
        .where(eq(games.id, gameId))
        .returning() as GameRow[];

      return { success: true, game: result[0] as GameRow };
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
        content: t.Optional(t.Any()),
      }),
    }
  )

  .delete("/games/:gameId", async ({ params, set }) => {
    const gameId = Number(params.gameId);

    const gameExists = await db
      .select()
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1);

    if (gameExists.length === 0) {
      set.status = 404;
      return { success: false, message: "Game not found" };
    }

    await db.delete(games).where(eq(games.id, gameId));
    return { success: true, message: "Game deleted" };
  });