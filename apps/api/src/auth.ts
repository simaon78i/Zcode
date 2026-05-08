import { Elysia, t } from "elysia";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "./db/index.js";
import { teachers, students } from "./db/schema.js";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET ?? "your-secret-key-change-this";
const SALT_ROUNDS = 10;

export type Role = "student" | "teacher";

export interface UserRow {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
  totalScore?: number | null;
  teacherId?: number | null;
  createdAt: Date;
}

function createJWT(userId: number, role: Role) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJWT(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; role: Role };
  } catch {
    return null;
  }
}

export async function getUserFromHeaders(
  headers: Record<string, string | undefined>
): Promise<(UserRow & { role: Role }) | null> {
  const token = headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  const decoded = verifyJWT(token);
  if (!decoded) return null;

  if (decoded.role === "teacher") {
    const result = await db
      .select()
      .from(teachers)
      .where(eq(teachers.id, decoded.userId))
      .limit(1) as UserRow[];
    return result[0] ? { ...result[0], role: "teacher" } : null;
  } else {
    const result = await db
      .select()
      .from(students)
      .where(eq(students.id, decoded.userId))
      .limit(1) as UserRow[];
    return result[0] ? { ...result[0], role: "student" } : null;
  }
}

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post(
    "/login",
    async ({ body, set }) => {
      const { email, password } = body;

      // Try teacher
      const teacherResult = await db
        .select()
        .from(teachers)
        .where(eq(teachers.email, email))
        .limit(1) as UserRow[];

      if (teacherResult.length > 0) {
        const teacher = teacherResult[0] as UserRow;
        const isValid = await bcrypt.compare(password, teacher.passwordHash);
        if (isValid) {
          const token = createJWT(teacher.id, "teacher");
          return {
            success: true,
            token,
            user: { id: teacher.id, email: teacher.email, name: teacher.name, role: "teacher", totalScore: null },
          };
        }
      }

      // Try student
      const studentResult = await db
        .select()
        .from(students)
        .where(eq(students.email, email))
        .limit(1) as UserRow[];

      if (studentResult.length > 0) {
        const student = studentResult[0] as UserRow;
        const isValid = await bcrypt.compare(password, student.passwordHash);
        if (isValid) {
          const token = createJWT(student.id, "student");
          return {
            success: true,
            token,
            user: { id: student.id, email: student.email, name: student.name, role: "student", totalScore: student.totalScore ?? 0 },
          };
        }
      }

      set.status = 401;
      return { success: false, message: "Invalid email or password" };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )

  .post(
    "/signup",
    async ({ body, set }) => {
      const { email, password, name, role, teacherId } = body;

      if (role === "teacher") {
        const existing = await db
          .select()
          .from(teachers)
          .where(eq(teachers.email, email))
          .limit(1);

        if (existing.length > 0) {
          set.status = 409;
          return { success: false, message: "Email already in use" };
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const result = await db
          .insert(teachers)
          .values({ email, name, passwordHash })
          .returning() as UserRow[];

        const newTeacher = result[0] as UserRow;
        const token = createJWT(newTeacher.id, "teacher");

        return {
          success: true,
          token,
          user: { id: newTeacher.id, email: newTeacher.email, name: newTeacher.name, role: "teacher", totalScore: null },
        };
      } else {
        if (!teacherId || teacherId <= 0) {
          set.status = 400;
          return { success: false, message: "Teacher ID is required for students" };
        }

        const existing = await db
          .select()
          .from(students)
          .where(eq(students.email, email))
          .limit(1);

        if (existing.length > 0) {
          set.status = 409;
          return { success: false, message: "Email already in use" };
        }

        const teacherExists = await db
          .select()
          .from(teachers)
          .where(eq(teachers.id, teacherId))
          .limit(1);

        if (teacherExists.length === 0) {
          set.status = 404;
          return { success: false, message: "Teacher not found" };
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const result = await db
          .insert(students)
          .values({ email, name, passwordHash, teacherId })
          .returning() as UserRow[];

        const newStudent = result[0] as UserRow;
        const token = createJWT(newStudent.id, "student");

        return {
          success: true,
          token,
          user: { id: newStudent.id, email: newStudent.email, name: newStudent.name, role: "student", totalScore: 0 },
        };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
        name: t.String(),
        role: t.String(),
        teacherId: t.Optional(t.Number()),
      }),
    }
  )

  .post("/logout", () => ({ success: true, message: "Logged out" }))

  .get("/me", async ({ headers, set }) => {
    const user = await getUserFromHeaders(headers as any);
    if (!user) {
      set.status = 401;
      return { success: false, message: "Not authenticated" };
    }
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        totalScore: user.totalScore ?? 0,
      },
    };
  });

export const adminRoutes = new Elysia({ prefix: "/admin" });