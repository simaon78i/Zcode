# Initial issues — paste into GitHub

This is the starter backlog for the platform-skeleton milestone (M1) plus the first reference game (M2). Every issue below is meant to be a real GitHub issue — copy the title, body, and labels.

The order is deliberate: things on top unblock things below. The four "track A/B/C/D" tags mark issues that can run in parallel once the foundation issues (#1–#4) are merged.

---

## Setup labels first

Before opening issues, create these labels in the repo (Settings → Labels). Pick any colors:

- `area:web`, `area:api`, `area:sdk`, `area:devops`, `area:design`
- `type:feature`, `type:bug`, `type:chore`, `type:docs`, `type:refactor`
- `priority:p0`, `priority:p1`, `priority:p2`
- `good-first-issue`
- `track:foundation`, `track:lobby`, `track:auth`, `track:mentor`, `track:teacher`, `track:games`

---

## #1 — Bootstrap monorepo and toolchain

**Labels:** `area:devops` `type:chore` `priority:p0` `track:foundation`

### Summary
Get `pnpm install && pnpm dev` running cleanly with the skeleton already in the repo. Web app boots, API responds on `/health`.

### Acceptance criteria
- [ ] `pnpm install` succeeds from a clean clone
- [ ] `pnpm dev` runs both web and api in parallel (web: 5173, api: 3001)
- [ ] `pnpm typecheck` passes across all packages
- [ ] `pnpm lint` passes (config minimal, can be tightened later)
- [ ] CI workflow runs on PR and passes
- [ ] Web app shows a "hello" page; API exposes `GET /health` returning `{ ok: true }`

### Notes
This is the unblock-everything issue. Do this first, alone, then everyone else can fan out.

---

## #2 — Database schema v1 (users, classes, progress, attempts)

**Labels:** `area:api` `type:feature` `priority:p0` `track:foundation`

### Summary
Set up Drizzle + Postgres. Define schema for users, classes, game progress, and level attempts. Migrations runnable.

### Acceptance criteria
- [ ] Drizzle config wired up, talks to local Postgres
- [ ] Tables: `users`, `classrooms`, `class_memberships`, `game_progress`, `level_attempts`, `mentor_messages`
- [ ] `pnpm --filter @codequest/api db:migrate` creates all tables
- [ ] Seed script that creates one teacher, one class, three students
- [ ] Schema documented in `docs/db-schema.md` with a short rationale per table

### Notes
Keep `gameId` as a `text` column, not an enum — the games SDK lets us add games without DB migrations, and the DB shouldn't care which games exist. Same for `level` — just an `int`.

---

## #3 — Auth: student and teacher login (JWT)

**Labels:** `area:api` `area:web` `type:feature` `priority:p0` `track:auth`

### Summary
Email + password login for both roles. JWT in an httpOnly cookie. Student signup happens via class join code; teachers are seeded by an admin (for now, manually).

### Acceptance criteria
- [ ] `POST /auth/login` accepts email + password, returns JWT cookie
- [ ] `POST /auth/student/join` accepts a class join code + name + password
- [ ] `GET /auth/me` returns the current user
- [ ] `POST /auth/logout` clears the cookie
- [ ] Web: login page, role-aware redirect (student → lobby, teacher → dashboard)
- [ ] Web: `useUser()` hook + protected route wrapper

### Notes
Skip OAuth for v1. Schools will want SSO eventually but it's not in the critical path.

---

## #4 — Games SDK: lock the contract

**Labels:** `area:sdk` `type:feature` `priority:p0` `track:foundation`

### Summary
Review and finalize `packages/games-sdk/src/index.ts`. Document the lifecycle. Write a tiny example "HelloGame" that implements the interface so we can test integration end-to-end before any real game exists.

### Acceptance criteria
- [ ] `GameDefinition` and `GameProps` reviewed by the team — anything missing?
- [ ] `docs/games-sdk.md` explains the lifecycle (mount → play → onLevelComplete → exit) with diagrams
- [ ] An `examples/hello-game` exists — a 30-line component that just shows "press the button" and calls `onLevelComplete`. Used by the lobby to validate plumbing.

### Notes
Once this lands, the lobby work (#5–#7) and the first real game (#13) can both proceed without blocking each other.

---

## #5 — Lobby UI: layout + game cards (no real games yet)

**Labels:** `area:web` `type:feature` `priority:p0` `track:lobby`

### Summary
Build the student lobby per the design mock. Reads from the games registry; renders cards even when the registry has only `HelloGame`.

### Acceptance criteria
- [ ] Header with streak, XP, avatar, class name
- [ ] "Continue where you left off" banner when there's recent progress
- [ ] Grid of game cards (state: locked / new / in-progress / complete) rendered from `games/registry.ts`
- [ ] Mentor tip card (placeholder content for now — wired up in #11)
- [ ] Class leaderboard card (placeholder)
- [ ] Routes: `/` → lobby, `/play/:gameId` → game runtime
- [ ] Tailwind config matches the design tokens (colors, radius, type scale)

### Notes
Pull copy and visual style from the agreed mock. Don't reinvent the layout.

---

## #6 — Lobby: game runtime wrapper

**Labels:** `area:web` `type:feature` `priority:p1` `track:lobby`

### Summary
The wrapper that mounts a game from the registry, passes it `GameProps`, and renders the mentor sidebar alongside it.

### Acceptance criteria
- [ ] `/play/:gameId` route loads the game from the registry; 404 if not found
- [ ] Game component receives real `onLevelComplete`, `onMentorRequest`, `onExit` callbacks
- [ ] `onLevelComplete` POSTs to `/api/attempts` and updates progress
- [ ] `onMentorRequest` opens the mentor sidebar with the provided context
- [ ] `onExit` returns the student to the lobby
- [ ] Compatibility check: if a game requires WebSerial and the browser lacks it, show a friendly "this won't work in your browser" page instead of crashing

---

## #7 — Progress + XP backend

**Labels:** `area:api` `type:feature` `priority:p1` `track:lobby`

### Summary
Endpoints the lobby and game runtime call to read/write progress.

### Acceptance criteria
- [ ] `POST /api/attempts` records a `LevelAttempt` and updates `game_progress`
- [ ] `GET /api/me/progress` returns all `GameProgress` rows for the current user
- [ ] XP rule: first-time level pass = 100 XP, lower for retries; document the formula in `docs/xp-rules.md`
- [ ] Streak: incremented if the student attempts at least one level on a new day
- [ ] All endpoints require auth

---

## #8 — Mentor service: backend (proxy + history)

**Labels:** `area:api` `type:feature` `priority:p0` `track:mentor`

### Summary
Backend endpoint the frontend talks to for mentor messages. Proxies to OpenRouter / Anthropic API; never exposes keys to the browser. Persists conversation history per `(user, game, level)`.

### Acceptance criteria
- [ ] `POST /api/mentor/message` accepts `{ gameId, level, context, message }`, streams back the mentor reply (SSE)
- [ ] System prompt enforces the Socratic pattern: ask before answering, smallest hint first, no full solutions
- [ ] System prompt documented in `apps/api/src/mentor/prompt.ts` with comments explaining each section
- [ ] Conversation history per `(user, game, level)` saved to `mentor_messages`
- [ ] `GET /api/mentor/history?gameId=...&level=...` returns prior messages

### Notes
The Socratic prompt is the heart of the educational value. Spend time on it; iterate. Document the rules and rationale clearly so reviewers can push back.

---

## #9 — Mentor service: frontend sidebar

**Labels:** `area:web` `type:feature` `priority:p1` `track:mentor`

### Summary
The mentor UI: a side panel that opens when a game calls `onMentorRequest`, streams the reply token-by-token, and lets the student keep chatting.

### Acceptance criteria
- [ ] Side panel slides in from the right; doesn't cover the game's primary work area on desktop
- [ ] Streaming response with a typing indicator
- [ ] Student can send follow-ups; conversation is scoped to current `(game, level)`
- [ ] On revisit, prior messages for this `(game, level)` load from `/api/mentor/history`
- [ ] On mobile, the panel becomes a bottom sheet

---

## #10 — Teacher dashboard: shell + student list

**Labels:** `area:web` `area:api` `type:feature` `priority:p1` `track:teacher`

### Summary
First version of the teacher view: list students in the teacher's class with progress per game and total XP.

### Acceptance criteria
- [ ] `/teacher` route, role-gated
- [ ] Table: student name, total XP, streak, per-game progress, last active
- [ ] Sort by any column
- [ ] Backend: `GET /api/teacher/class/:id/students` returns `StudentSummary[]`
- [ ] Empty state when the class has no students yet

---

## #11 — Teacher dashboard: AI student summary

**Labels:** `area:web` `area:api` `type:feature` `priority:p2` `track:teacher`

### Summary
Per-student AI-generated summary: what they're good at, where they're stuck, engagement level. Shown as a row expansion in the table.

### Acceptance criteria
- [ ] `POST /api/teacher/student/:id/summary` triggers (or returns cached) summary
- [ ] Summary regenerates max once per 24h per student to control cost
- [ ] Summary is grounded in actual data: attempts, hints used, time per level — not vibes
- [ ] Document in `docs/teacher-ai-summary.md` what data feeds the summary and why

### Notes
Be very careful with the prompt here. Teacher-facing AI summaries about students have real consequences — kids get judged based on them. Bias toward concrete observations ("solved 5 maze levels, struggled with recursion") over personality claims ("seems unmotivated"). This deserves its own design review.

---

## #12 — Class join flow

**Labels:** `area:web` `area:api` `type:feature` `priority:p1` `track:auth`

### Summary
Teacher creates a class, gets a join code; student enters the code on signup.

### Acceptance criteria
- [ ] `POST /api/teacher/class` creates a class, returns a 6-character join code
- [ ] `GET /api/teacher/class/:id` returns class info + members
- [ ] Student signup with join code creates a `class_membership` row
- [ ] Teacher can rotate the join code
- [ ] Teacher can remove a student from the class

---

## #13 — Reference game: Maze Runner (M2 starter)

**Labels:** `area:web` `area:sdk` `type:feature` `priority:p1` `track:games`

### Summary
First real game implementing the SDK contract. Student writes JS to navigate a grid maze; visualizer shows their algorithm step by step.

### Acceptance criteria
- [ ] Implements `GameDefinition`, registered in `games/registry.ts`
- [ ] Levels 1–3: BFS, DFS, Dijkstra (or similar progression — document the pedagogy)
- [ ] Monaco editor on one side, animated grid visualizer on the other
- [ ] Student code runs in a Web Worker sandbox, with a timeout
- [ ] On level complete, calls `onLevelComplete` with their code as `artifact`
- [ ] Mentor button calls `onMentorRequest` with code + current goal + any error

### Notes
This is the reference implementation for every other game. Get it right; copy the pattern.

---

## #14 — Sandbox: JS Web Worker runner

**Labels:** `area:web` `area:sdk` `type:feature` `priority:p1` `track:games`

### Summary
A reusable utility games can use to safely run student JS. Web Worker, hard timeout, message-based API.

### Acceptance criteria
- [ ] `runStudentCode(source, { timeout, api })` lives in `packages/games-sdk` (or `apps/web/src/lib/sandbox.ts` if SDK feels wrong)
- [ ] Worker is terminated on timeout
- [ ] Errors bubble back as structured `{ type: 'error', message, line? }`
- [ ] `api` argument is the surface the student's code can call (e.g. `move`, `look`) — typed
- [ ] Unit tests: infinite loop, syntax error, valid code

---

## #15 — Docs: ADR template + first three ADRs

**Labels:** `type:docs` `priority:p2` `track:foundation`

### Summary
Record the architectural decisions so future contributors don't re-litigate them.

### Acceptance criteria
- [ ] `docs/adr/0000-template.md` with a short ADR template (Status, Context, Decision, Consequences)
- [ ] `docs/adr/0001-monorepo-structure.md`
- [ ] `docs/adr/0002-games-sdk-contract.md`
- [ ] `docs/adr/0003-mentor-socratic-pattern.md`

---

## After M1

The next wave: Calculator Lab (#TBD), 3D Print Studio (#TBD), Arduino Workshop (#TBD), deployment (#TBD), pilot prep (#TBD). Open these as we get closer.
