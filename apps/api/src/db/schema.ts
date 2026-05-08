import { integer, text, boolean, timestamp, pgTable, serial, varchar, json } from "drizzle-orm/pg-core";

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  teacherId: integer("teacher_id").notNull().references(() => teachers.id),
  totalScore: integer("total_score").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull().references(() => teachers.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: json("content").notNull(),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const studentGameAccess = pgTable("student_game_access", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  gameId: integer("game_id").notNull().references(() => games.id),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  gameId: varchar("game_id", { length: 255 }).notNull(),
  gameTitle: varchar("game_title", { length: 255 }).notNull(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  finalScore: integer("final_score"),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  events: json("events").notNull().default([]),
  summary: text("summary"),
});