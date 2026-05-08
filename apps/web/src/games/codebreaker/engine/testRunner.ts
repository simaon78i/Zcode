import type { MissionLevel } from "../levels";

export interface CheckResult {
  description: string;
  passed: boolean;
  failHint: string;
}

export interface RunResult {
  passed: boolean;
  output: string[];
  error: string | null;
  checkResults: CheckResult[];
}

/**
 * Runs the student's code against a mission's checks.
 *
 * Two-phase approach:
 *   1. Execute code once for output capture + syntax/runtime error detection.
 *   2. Re-execute code with all check expressions appended (same scope) to
 *      evaluate all checks in a single pass — avoids side-effect divergence.
 */
export function runMission(mission: MissionLevel, code: string): RunResult {
  const output: string[] = [];
  const fakeConsole = {
    log: (...args: unknown[]) => output.push(args.map(String).join(" ")),
    error: (...args: unknown[]) =>
      output.push("[error] " + args.map(String).join(" ")),
    warn: (...args: unknown[]) =>
      output.push("[warn] " + args.map(String).join(" ")),
  };

  const emptyChecks: CheckResult[] = mission.checks.map((c) => ({
    description: c.description,
    passed: false,
    failHint: c.failHint,
  }));

  // ── Phase 1: compile + run for output ────────────────────────────────────
  let compileFn: ((...args: unknown[]) => unknown) | null = null;
  try {
    compileFn = new Function("console", code) as (
      ...args: unknown[]
    ) => unknown;
  } catch (e) {
    return {
      passed: false,
      output: [],
      error: e instanceof Error ? e.message : String(e),
      checkResults: emptyChecks,
    };
  }

  try {
    compileFn(fakeConsole);
  } catch (e) {
    return {
      passed: false,
      output,
      error: e instanceof Error ? e.message : String(e),
      checkResults: emptyChecks,
    };
  }

  // ── Phase 2: evaluate all checks in one scope ─────────────────────────────
  const checkExprs = mission.checks
    .map((c) => `(${c.expression})`)
    .join(", ");

  let rawResults: unknown[] = mission.checks.map(() => false);
  let checkError: string | null = null;

  try {
    const checkFn = new Function(
      "console",
      `${code}\nreturn [${checkExprs}];`
    ) as (...args: unknown[]) => unknown[];
    rawResults = checkFn(fakeConsole);
  } catch (e) {
    checkError = e instanceof Error ? e.message : String(e);
  }

  const checkResults: CheckResult[] = mission.checks.map((c, i) => ({
    description: c.description,
    passed: Boolean(rawResults[i]),
    failHint: c.failHint,
  }));

  return {
    passed: !checkError && checkResults.every((c) => c.passed),
    output,
    error: checkError,
    checkResults,
  };
}
