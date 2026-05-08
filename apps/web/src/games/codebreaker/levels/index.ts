export type SceneType = "vault" | "cameras" | "locks" | "drone" | "boss";

export interface CheckItem {
  description: string;
  /** JS expression evaluated inside the student's code scope — must be truthy to pass. */
  expression: string;
  failHint: string;
}

export interface MissionLevel {
  id: number;
  scene: SceneType;
  title: string;
  subtitle: string;
  concept: string;
  missionBrief: string;
  starterCode: string;
  checks: CheckItem[];
  hints: string[];
  xpBase: number;
  diamondBase: number;
  /**
   * Silently extracts live variable values from the student's current code.
   * Called on every keystroke (debounced). Must never throw.
   * Returns empty object on any error.
   */
  liveExtract: (code: string) => Record<string, unknown>;
}

export interface RankInfo {
  name: string;
  minXP: number;
  color: string;
}

export const RANKS: RankInfo[] = [
  { name: "Rookie Hacker",  minXP: 0,    color: "text-slate-400" },
  { name: "Script Kiddie",  minXP: 150,  color: "text-blue-400" },
  { name: "Code Breaker",   minXP: 400,  color: "text-cyan-400" },
  { name: "Vault Cracker",  minXP: 750,  color: "text-purple-400" },
  { name: "Elite Ghost",    minXP: 1200, color: "text-yellow-400" },
];

export function getRank(xp: number): RankInfo {
  return [...RANKS].reverse().find((r) => xp >= r.minXP) ?? RANKS[0]!;
}

/** XP cost for each successive hint (index = hint number, 0-based). */
export const HINT_XP_COSTS = [0, 10, 20, 30, 50];

// ─── Safe live extractor helper ───────────────────────────────────────────────
// Executes student code in a silent sandbox and evaluates a return expression.
// Both outer (syntax) and inner (runtime) errors are silently caught.
function safeExtract(
  code: string,
  returnExpr: string
): Record<string, unknown> {
  try {
    const fn = new Function(
      "console",
      `${code}\ntry{return(${returnExpr})}catch(e){return{}}`
    ) as (c: unknown) => unknown;
    const noop = (): void => undefined;
    const fakeConsole = { log: noop, error: noop, warn: noop, info: noop };
    const result = fn(fakeConsole);
    return result && typeof result === "object"
      ? (result as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

// ─── Mission definitions ──────────────────────────────────────────────────────
export const MISSIONS: MissionLevel[] = [

  // ═══ LEVEL 1 — Variables & Math ════════════════════════════════════════════
  {
    id: 1,
    scene: "vault",
    title: "Mission 1: The Vault",
    subtitle: "Variables & Math",
    concept: "Variables + Addition",
    missionBrief:
      "Pinnacle Bank's vault runs a live security scanner. " +
      "It adds two quantities together and only unlocks when the total is exactly 100. " +
      "Watch the scanner panel — it reacts as you type.",
    starterCode: `// ╔══ VAULT OVERRIDE SYSTEM v2.3 — ACTIVE ══╗
// The scanner reads two quantities and adds them.
// Adjust both values until the display reads: 100
// ═══════════════════════════════════════════

let diamond_weight = 50;  // ← CHANGE THIS
let gold_bars      = 30;  // ← CHANGE THIS

// The vault computes the total automatically:
let total = diamond_weight + gold_bars;

console.log("Security code:", total, "/ 100");`,
    checks: [
      {
        description: "Both values are numbers",
        expression:
          'typeof diamond_weight === "number" && typeof gold_bars === "number"',
        failHint:
          "diamond_weight and gold_bars must be plain numbers — no quotes.",
      },
      {
        description: "Total equals exactly 100",
        expression: "total === 100",
        failHint:
          "diamond_weight + gold_bars must equal exactly 100. Watch the scanner.",
      },
    ],
    hints: [
      "💡 You need two numbers that add up to 100. Example: 60 + 40 = 100.",
      "💡 Try: diamond_weight = 60, gold_bars = 40. Does 60 + 40 = 100?",
      "💡 Any pair works: 70 + 30, 55 + 45, even 1 + 99.",
      "💡 Solution: diamond_weight = 60, gold_bars = 40.",
    ],
    xpBase: 100,
    diamondBase: 5,
    liveExtract: (code) =>
      safeExtract(code, "{ diamond_weight, gold_bars, total }"),
  },

  // ═══ LEVEL 2 — Conditions ══════════════════════════════════════════════════
  {
    id: 2,
    scene: "cameras",
    title: "Mission 2: Kill the Cameras",
    subtitle: "if / else Conditions",
    concept: "Conditions (if / else)",
    missionBrief:
      "Security cameras stay awake unless the hour sensor reads 22 or later. " +
      "The monitoring code has a bug — the comparison operator is backwards. " +
      "Fix it and watch the camera system react in real time.",
    starterCode: `// ╔══ CAMERA CONTROL SYSTEM v1.7 — ACTIVE ══╗
// The camera checks the hour every cycle.
// It should enter SLEEP MODE when hour >= 22.
// But the logic below is wrong — cameras keep alarming!
// Fix the condition operator and watch the camera react.
// ════════════════════════════════════════════

let hour = 23;            // heist time: 11 pm
let camera_status = "ALERT";

if (hour < 22) {          // ← CHANGE THIS (wrong operator)
  camera_status = "sleeping";
} else {
  camera_status = "ALERT! INTRUDER!";
}

console.log("Camera status:", camera_status);`,
    checks: [
      {
        description: 'camera_status is "sleeping"',
        expression: 'camera_status === "sleeping"',
        failHint:
          'When hour is 23, the camera should be sleeping. Is < the right operator?',
      },
    ],
    hints: [
      '💡 The camera should sleep when hour >= 22. Which operator means "greater than or equal to"?',
      "💡 Operators: < (less than), > (greater than), <= (≤), >= (≥).",
      '💡 Change < to >= . Now: 23 >= 22 is true → camera_status = "sleeping".',
      '💡 Solution: change "hour < 22" to "hour >= 22".',
    ],
    xpBase: 130,
    diamondBase: 7,
    liveExtract: (code) =>
      safeExtract(code, "{ camera_status, hour }"),
  },

  // ═══ LEVEL 3 — Loops ═══════════════════════════════════════════════════════
  {
    id: 3,
    scene: "locks",
    title: "Mission 3: Ten Locks",
    subtitle: "for Loops",
    concept: "Loops (for)",
    missionBrief:
      "The corridor has 10 electromagnetic locks. " +
      "Your lock-pick device loops through them automatically — but it stops too early. " +
      "Fix the loop limit and watch the lock counter update in real time.",
    starterCode: `// ╔══ LOCK-PICK AUTOMATOR v3.0 — ACTIVE ══╗
// The device runs a loop and opens one lock per cycle.
// Watch the counter on the left — it updates as you type.
// Adjust the loop so it opens exactly 10 locks.
// ═══════════════════════════════════════════

let locks_opened = 0;

for (let i = 0; i < 5; i++) {  // ← CHANGE THIS (change the limit)
  locks_opened = locks_opened + 1;
}

console.log("Locks opened:", locks_opened, "/ 10");`,
    checks: [
      {
        description: "All 10 locks are opened",
        expression: "locks_opened === 10",
        failHint:
          "The loop must run exactly 10 times. Change the limit so i < ??? runs 10 times.",
      },
    ],
    hints: [
      "💡 A for loop `for (let i = 0; i < N; i++)` runs exactly N times.",
      "💡 Currently N = 5. Change N to 10.",
      "💡 i < 10 counts 0,1,2,3,4,5,6,7,8,9 — that's 10 iterations.",
      '💡 Solution: change "i < 5" to "i < 10".',
    ],
    xpBase: 150,
    diamondBase: 8,
    liveExtract: (code) => safeExtract(code, "{ locks_opened }"),
  },

  // ═══ LEVEL 4 — Functions ═══════════════════════════════════════════════════
  {
    id: 4,
    scene: "drone",
    title: "Mission 4: The Drone",
    subtitle: "Functions",
    concept: "Functions",
    missionBrief:
      "Your stealth drone needs a flight computer. " +
      "The rule: 1 metre = 2 seconds of flight time. " +
      "Write the function body — the system tests it live with multiple distances.",
    starterCode: `// ╔══ DRONE FLIGHT COMPUTER v4.1 — ACTIVE ══╗
// The drone calls fly_drone(distance) to calculate flight time.
// Rule: every 1 metre takes 2 seconds.
// Write the formula inside the function.
// The system will test it automatically — watch the console.
// ════════════════════════════════════════════

function fly_drone(distance) {
  // ← CHANGE THIS: return the flight time
  // Rule: 1 metre = 2 seconds. What is the formula?

}

// Live tests (results appear in the console):
console.log("5m →", fly_drone(5), "sec");  // expect: 10
console.log("3m →", fly_drone(3), "sec");  // expect: 6
console.log("1m →", fly_drone(1), "sec");  // expect: 2`,
    checks: [
      {
        description: "fly_drone is a function",
        expression: 'typeof fly_drone === "function"',
        failHint: 'The function must be named exactly "fly_drone".',
      },
      {
        description: "fly_drone(5) returns 10",
        expression: "fly_drone(5) === 10",
        failHint: "For distance=5: time = 5 × 2 = 10. Check your formula.",
      },
      {
        description: "fly_drone(3) returns 6",
        expression: "fly_drone(3) === 6",
        failHint: "For distance=3: time = 3 × 2 = 6. Does your formula work for all values?",
      },
    ],
    hints: [
      "💡 The formula is: time = distance × 2. Use * for multiplication.",
      "💡 Inside the function: let time = distance * 2;",
      "💡 Send the answer back with: return time;",
      "💡 Solution: function fly_drone(distance) { return distance * 2; }",
    ],
    xpBase: 180,
    diamondBase: 10,
    liveExtract: (code) =>
      safeExtract(
        code,
        `{
          hasFn: typeof fly_drone === "function",
          result5: typeof fly_drone === "function" ? fly_drone(5) : undefined,
          result3: typeof fly_drone === "function" ? fly_drone(3) : undefined,
          result1: typeof fly_drone === "function" ? fly_drone(1) : undefined,
        }`
      ),
  },

  // ═══ LEVEL 5 — Combined logic ═══════════════════════════════════════════════
  {
    id: 5,
    scene: "boss",
    title: "Mission 5: Robot Boss",
    subtitle: "Combined Logic",
    concept: "Loops + Conditions combined",
    missionBrief:
      "The vault's final guardian — a security robot — has activated. " +
      "It has 100 HP and a shield that halves your damage. " +
      "Write the battle loop. The system scans your progress in real time.",
    starterCode: `// ╔══ COMBAT ALGORITHM v5.0 — ACTIVE ══╗
// Write a loop that fights the robot until it's defeated.
// The combat scanner reads your variables in real time.
//
// Rules:
//   loop while: robot_health > 0  AND  rounds < 6
//   each round: damage = player_power / 2  if shield is active
//               damage = player_power       if shield is down
//   after round 2: set shield_active = false
//   always: rounds++
// ════════════════════════════════════════

let robot_health  = 100;
let player_power  = 35;
let shield_active = true;
let rounds        = 0;

// ← CHANGE THIS: write your while loop below


console.log("Robot HP:", robot_health, "| Rounds:", rounds);`,
    checks: [
      {
        description: "Robot is defeated (HP ≤ 0)",
        expression: "robot_health <= 0",
        failHint:
          "The robot's HP must reach 0 or below. Subtract damage every round.",
      },
      {
        description: "Battle lasted at least 3 rounds",
        expression: "rounds >= 3",
        failHint: "The battle should take at least 3 rounds. Is your loop running enough times?",
      },
    ],
    hints: [
      "💡 Start with: while (robot_health > 0 && rounds < 6) { ... }",
      "💡 Inside the loop: let damage = shield_active ? player_power / 2 : player_power;\n   robot_health -= damage;\n   rounds++;",
      "💡 To break the shield: if (rounds === 2) { shield_active = false; }",
      "💡 Full solution:\nwhile (robot_health > 0 && rounds < 6) {\n  let d = shield_active ? player_power / 2 : player_power;\n  robot_health -= d;\n  if (rounds === 2) shield_active = false;\n  rounds++;\n}",
    ],
    xpBase: 220,
    diamondBase: 15,
    liveExtract: (code) =>
      safeExtract(code, "{ robot_health, rounds, shield_active, player_power }"),
  },
];
