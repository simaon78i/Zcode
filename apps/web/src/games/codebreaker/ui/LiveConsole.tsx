import React, { useEffect, useRef } from "react";
import type { SceneType } from "../levels";
import type { RunResult } from "../engine/testRunner";

// ─── Log entry types ──────────────────────────────────────────────────────────
type LogType = "sys" | "read" | "calc" | "ok" | "warn" | "lock" | "open" | "test" | "eval" | "loop" | "scan" | "wait";

interface LogEntry {
  tag: string;
  text: string;
  type: LogType;
}

const TAG_COLORS: Record<LogType, string> = {
  sys:  "text-cyan-700",
  read: "text-blue-400",
  calc: "text-slate-400",
  ok:   "text-emerald-400",
  warn: "text-amber-400",
  lock: "text-red-400",
  open: "text-emerald-300",
  test: "text-blue-300",
  eval: "text-purple-300",
  loop: "text-cyan-300",
  scan: "text-slate-300",
  wait: "text-slate-600",
};

const TEXT_COLORS: Record<LogType, string> = {
  sys:  "text-cyan-800",
  read: "text-blue-300",
  calc: "text-slate-300",
  ok:   "text-emerald-300",
  warn: "text-amber-300",
  lock: "text-red-300",
  open: "text-emerald-200",
  test: "text-blue-200",
  eval: "text-purple-200",
  loop: "text-cyan-200",
  scan: "text-slate-200",
  wait: "text-slate-600",
};

// ─── Log generators ───────────────────────────────────────────────────────────
function vaultLogs(data: Record<string, unknown>): LogEntry[] {
  const logs: LogEntry[] = [
    { tag: "SYS ", text: "Vault Override v2.3 — ACTIVE", type: "sys" },
  ];
  const dw = data.diamond_weight;
  const gb = data.gold_bars;
  const total = data.total;

  if (typeof dw === "number")
    logs.push({ tag: "READ", text: `diamond_weight .......... ${dw}`, type: "read" });
  if (typeof gb === "number")
    logs.push({ tag: "READ", text: `gold_bars ............... ${gb}`, type: "read" });

  if (typeof total === "number" && typeof dw === "number" && typeof gb === "number") {
    logs.push({ tag: "CALC", text: `Security code: ${dw} + ${gb} = ${total}`, type: "calc" });
    if (total === 100) {
      logs.push({ tag: "OK  ", text: "Code verified ✓ — ready to unlock", type: "ok" });
      logs.push({ tag: "OPEN", text: "Hit HACK IT to trigger vault sequence", type: "open" });
    } else {
      const diff = 100 - total;
      logs.push({
        tag: "WARN",
        text: diff > 0 ? `Mismatch — need ${diff} more` : `Mismatch — ${Math.abs(diff)} too many`,
        type: "warn",
      });
      const pct = Math.max(0, Math.round((total / 100) * 100));
      logs.push({ tag: "LOCK", text: `Vault sealed — ${pct}% of code correct`, type: "lock" });
    }
  } else {
    logs.push({ tag: "WAIT", text: "Waiting for security code values...", type: "wait" });
  }
  return logs;
}

function cameraLogs(data: Record<string, unknown>): LogEntry[] {
  const logs: LogEntry[] = [
    { tag: "SYS ", text: "Camera Control v1.7 — ACTIVE", type: "sys" },
  ];
  const hour = data.hour;
  const status = data.camera_status;

  if (typeof hour === "number")
    logs.push({ tag: "READ", text: `Hour sensor reading .... ${hour}:00`, type: "read" });

  if (typeof status === "string") {
    if (status === "sleeping") {
      logs.push({ tag: "EVAL", text: "Condition evaluated → true", type: "ok" });
      logs.push({ tag: "OK  ", text: 'camera_status = "sleeping" ✓', type: "ok" });
    } else {
      logs.push({ tag: "EVAL", text: "Condition evaluated → false", type: "warn" });
      logs.push({ tag: "WARN", text: `camera_status = "${status}"`, type: "warn" });
      logs.push({ tag: "LOCK", text: "Fix the comparison operator in the if()", type: "lock" });
    }
  } else {
    logs.push({ tag: "WAIT", text: "Evaluating condition...", type: "wait" });
  }
  return logs;
}

function locksLogs(data: Record<string, unknown>): LogEntry[] {
  const logs: LogEntry[] = [
    { tag: "SYS ", text: "Lock-Pick Automator v3.0 — ACTIVE", type: "sys" },
  ];
  const opened = data.locks_opened;

  if (typeof opened === "number") {
    logs.push({ tag: "LOOP", text: `Loop completed ......... ${opened} iterations`, type: "loop" });
    if (opened === 10) {
      logs.push({ tag: "OK  ", text: "All 10 locks cleared ✓", type: "ok" });
    } else if (opened < 10) {
      logs.push({ tag: "WARN", text: `Only ${opened} / 10 locks opened`, type: "warn" });
      logs.push({ tag: "LOCK", text: `Increase loop limit by ${10 - opened}`, type: "lock" });
    } else {
      logs.push({ tag: "WARN", text: `Too many iterations (${opened} > 10)`, type: "warn" });
    }
  } else {
    logs.push({ tag: "WAIT", text: "Scanning loop structure...", type: "wait" });
  }
  return logs;
}

function droneLogs(data: Record<string, unknown>): LogEntry[] {
  const logs: LogEntry[] = [
    { tag: "SYS ", text: "Drone Flight Computer v4.1 — ACTIVE", type: "sys" },
  ];
  const hasFn = data.hasFn === true;
  const r5 = data.result5;
  const r3 = data.result3;
  const r1 = data.result1;

  if (!hasFn) {
    logs.push({ tag: "WAIT", text: "No function detected yet...", type: "wait" });
    logs.push({ tag: "READ", text: "Define: function fly_drone(distance) { }", type: "read" });
  } else {
    if (r5 !== undefined) {
      const ok = r5 === 10;
      logs.push({ tag: "TEST", text: `fly_drone(5) → ${r5}   ${ok ? "✓" : `✗  expected: 10`}`, type: ok ? "ok" : "warn" });
    }
    if (r3 !== undefined) {
      const ok = r3 === 6;
      logs.push({ tag: "TEST", text: `fly_drone(3) → ${r3}   ${ok ? "✓" : `✗  expected: 6`}`, type: ok ? "ok" : "warn" });
    }
    if (r1 !== undefined) {
      const ok = r1 === 2;
      logs.push({ tag: "TEST", text: `fly_drone(1) → ${r1}   ${ok ? "✓" : `✗  expected: 2`}`, type: ok ? "ok" : "warn" });
    }
    if (r5 === 10 && r3 === 6 && r1 === 2) {
      logs.push({ tag: "OK  ", text: "All flight tests passing — drone ready ✓", type: "ok" });
    } else if (r5 !== undefined) {
      logs.push({ tag: "WARN", text: "Formula not correct yet — keep adjusting", type: "warn" });
    }
  }
  return logs;
}

function bossLogs(data: Record<string, unknown>): LogEntry[] {
  const logs: LogEntry[] = [
    { tag: "SYS ", text: "Combat Algorithm v5.0 — ACTIVE", type: "sys" },
  ];
  const hp = data.robot_health;
  const rounds = data.rounds;
  const shield = data.shield_active;

  if (typeof hp === "number") {
    logs.push({ tag: "SCAN", text: `robot_health ........... ${hp}`, type: "scan" });
  }
  if (typeof rounds === "number") {
    logs.push({ tag: "SCAN", text: `rounds fought .......... ${rounds}`, type: "scan" });
  }
  if (typeof shield === "boolean") {
    logs.push({ tag: "SCAN", text: `shield_active .......... ${shield}`, type: "scan" });
  }

  if (typeof hp === "number") {
    if (hp <= 0) {
      logs.push({ tag: "OK  ", text: "Robot defeated — vault accessible ✓", type: "ok" });
    } else if (hp === 100 && typeof rounds === "number" && rounds === 0) {
      logs.push({ tag: "WAIT", text: "Battle not started — add your loop", type: "wait" });
    } else {
      logs.push({ tag: "WARN", text: `Robot still has ${hp} HP remaining`, type: "warn" });
    }
  } else {
    logs.push({ tag: "WAIT", text: "Scanning combat variables...", type: "wait" });
  }
  return logs;
}

const LOG_GENERATORS: Record<SceneType, (data: Record<string, unknown>) => LogEntry[]> = {
  vault:   vaultLogs,
  cameras: cameraLogs,
  locks:   locksLogs,
  drone:   droneLogs,
  boss:    bossLogs,
};

// ─── RunResult entries (appended after clicking HACK IT) ─────────────────────
function runResultLogs(result: RunResult): LogEntry[] {
  if (result.passed) {
    return [
      { tag: "RUN ", text: "━━━━━━━━ EXECUTION COMPLETE ━━━━━━━━", type: "sys" },
      { tag: "OK  ", text: "All objectives passed ✓", type: "ok" },
    ];
  }
  const logs: LogEntry[] = [
    { tag: "RUN ", text: "━━━━━━━━ EXECUTION COMPLETE ━━━━━━━━", type: "sys" },
  ];
  if (result.error) {
    logs.push({ tag: "ERR ", text: result.error.split("\n")[0] ?? result.error, type: "lock" });
  }
  for (const c of result.checkResults) {
    logs.push({
      tag: c.passed ? "OK  " : "FAIL",
      text: `${c.passed ? "✓" : "✗"} ${c.description}`,
      type: c.passed ? "ok" : "warn",
    });
  }
  return logs;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface LiveConsoleProps {
  scene: SceneType;
  liveData: Record<string, unknown>;
  runResult: RunResult | null;
}

export function LiveConsole({ scene, liveData, runResult }: LiveConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const generator = LOG_GENERATORS[scene];
  const liveEntries = generator(liveData);
  const runEntries = runResult ? runResultLogs(runResult) : [];
  const allEntries = [...liveEntries, ...runEntries];

  // Scroll to bottom when entries change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allEntries.length]);

  return (
    <div
      className="flex flex-col rounded-lg overflow-hidden border border-cyan-900/30"
      style={{ background: "#030a12", minHeight: 0 }}
    >
      {/* Console title bar */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 border-b border-cyan-900/20 bg-black/40">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-glow-pulse" />
        <span className="text-xs font-mono text-cyan-800 tracking-wider">
          SECURITY CONSOLE
        </span>
        <span className="ml-auto text-xs font-mono text-cyan-900">LIVE</span>
      </div>

      {/* Log entries */}
      <div className="overflow-y-auto p-2.5 space-y-0.5" style={{ maxHeight: "5.5rem" }}>
        {allEntries.map((entry, i) => (
          <div key={i} className="flex gap-2 font-mono text-xs leading-5">
            <span className={`shrink-0 ${TAG_COLORS[entry.type]}`}>
              [{entry.tag}]
            </span>
            <span className={`${TEXT_COLORS[entry.type]} break-all`}>
              {entry.text}
            </span>
          </div>
        ))}

        {/* Blinking cursor */}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-cyan-900 font-mono text-xs">$</span>
          <span
            className="inline-block w-1.5 h-3 bg-cyan-600 animate-glow-pulse"
            style={{ animationDuration: "1s" }}
          />
        </div>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
