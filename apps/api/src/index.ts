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
.use(cors({ 
  origin: "https://zcode-web-769365992309.me-west1.run.app", 
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
  }))    
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
  .listen({ port: PORT, hostname: '0.0.0.0' }, ({ hostname, port }) => {
  console.log(`🦊 zcode-api listening on http://${hostname}:${port}`);
  });

export type App = typeof app;