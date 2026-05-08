import "dotenv/config";
import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { cors } from "@elysiajs/cors";
import { authRoutes, adminRoutes } from "./auth.js";
import { teacherRoutes } from "./teacher.js";
import { sessionRoutes } from "./sessions.js";

const PORT = Number(process.env.PORT ?? 3001);
const startedAt = Date.now();

const app = new Elysia({ adapter: node() })
  .use(cors({ origin: "http://localhost:5173", credentials: true }))
  .onRequest(({ request }) => {
    const url = new URL(request.url);
    console.log(`→ ${request.method} ${url.pathname}`);
  })
  .get("/health", () => ({
    ok: true,
    service: "zcode-api",
    uptime: Math.floor((Date.now() - startedAt) / 1000),
  }))
  .group("/api", (api) =>
    api
      .get("/health", () => ({
        ok: true,
        service: "zcode-api",
        uptime: Math.floor((Date.now() - startedAt) / 1000),
      }))
      .use(authRoutes)
      .use(adminRoutes)
      .use(teacherRoutes)
      .use(sessionRoutes)
  )
  .listen(PORT, ({ hostname, port }) => {
    console.log(`🦊 zcode-api listening on http://${hostname}:${port}`);
  });

export type App = typeof app;