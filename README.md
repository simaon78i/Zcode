# 🎮 ZCode — Learn Through Games

> Built at **Hack The Gap Hackathon 2026**

ZCode is a full-stack educational gaming platform for high school students. Teachers create and assign coding challenges; students play through them with the help of an AI mentor. Every session is tracked, scored, and summarized for the teacher in real time.

## 🚀 What We Built

A production-ready monorepo with 2 fully playable games (CodeBreaker: Diamond Heist, CodeRunner), an AI Mentor powered by OpenRouter that gives Socratic hints without ever revealing the answer, a Teacher Dashboard with real-time student progress and AI-generated session summaries, JWT authentication with separate teacher/student roles, PostgreSQL via Neon, and full Docker support.

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Elysia.js, Node.js, TypeScript |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Drizzle ORM |
| Auth | JWT + bcrypt |
| AI | OpenRouter API (Claude / GPT-4o) |
| Monorepo | pnpm workspaces |
| Containerization | Docker + Docker Compose |
| 3D / Physics | Three.js, @react-three/fiber, @react-three/rapier |
| Code Editor | Monaco Editor |
| State | Zustand |

## 🎮 Games

**💎 CodeBreaker: Diamond Heist** — A 5-level heist game where students fix broken JavaScript to crack vault locks. Each level targets a different CS concept (loops, arrays, functions, recursion, conditionals).

**🏎️ CodeRunner** — A 3D car racing game where students write jump logic in JavaScript to control a vehicle across tracks, built with Three.js and react-three/fiber.

**🔁 Fix The Loop** — A beginner-friendly challenge where students debug a broken for loop to make a mechanism work.

## 🤖 AI Mentor

Powered by OpenRouter. Never gives the full answer — only Socratic nudges. Ramps up hint specificity across up to 5 hints per session. On session completion, automatically generates a factual 100-word summary for the teacher.

## 👨‍🏫 Teacher Flow

Teachers sign up and receive a unique Teacher ID. They create games with custom JSON content, assign them to students, and monitor a real-time dashboard showing scores, session history, and AI-generated summaries per student.

## 👨‍🎓 Student Flow

Students sign up using their Teacher ID to link automatically. They browse a Netflix-style game library, play assigned games with AI mentor support, and build a score history visible on their profile.

## 🐳 Running with Docker

```bash
git clone https://github.com/simaon78i/Zcode.git
cd Zcode
cp apps/api/.env.example apps/api/.env
# Fill in DATABASE_URL, JWT_SECRET, OPENROUTER_API_KEY
docker-compose up --build
```

Frontend: http://localhost:5173 — Backend: http://localhost:3001

## 🛠️ Running Locally

```bash
pnpm install
pnpm dev
```

## ⚙️ Environment Variables

```env
DATABASE_URL=postgresql://...@...neon.tech/zcode?sslmode=require
JWT_SECRET=your-long-random-secret
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openrouter/auto
PORT=3001
APP_URL=http://localhost:5173
```

## 🏆 Built At

**Hack The Gap Hackathon 2026** — ZCode was designed, built, and shipped in a single hackathon sprint. The goal: build something that actually helps real teachers in real classrooms, not just a demo.

## 📄 License

MIT
