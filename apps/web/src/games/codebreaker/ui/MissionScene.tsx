import React from "react";
import type { SceneType } from "../levels";

export type SceneStatus = "idle" | "success" | "error";

interface SceneProps {
  status: SceneStatus;
  liveData: Record<string, unknown>;
}

// ─── Shared particles that float up on success ────────────────────────────────
function SuccessParticles({
  items,
  positions,
}: {
  items: string[];
  positions: number[];
}) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {items.map((item, i) => (
        <span
          key={i}
          className="absolute text-2xl animate-float-up"
          style={{
            left: `${positions[i]}%`,
            bottom: "25%",
            animationDelay: `${i * 180}ms`,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// ─── VAULT SCENE ──────────────────────────────────────────────────────────────
function VaultScene({ status, liveData }: SceneProps) {
  const open = status === "success";
  const denied = status === "error";

  const total = typeof liveData.total === "number" ? liveData.total : null;
  const dw = typeof liveData.diamond_weight === "number" ? liveData.diamond_weight : null;
  const gb = typeof liveData.gold_bars === "number" ? liveData.gold_bars : null;

  const hasValues = dw !== null && gb !== null && total !== null;
  const progress = hasValues ? Math.min(1, Math.max(0, total! / 100)) : 0;
  const pct = Math.round(progress * 100);
  const preUnlock = hasValues && total === 100 && !open;

  const progressColor =
    pct === 0 ? "bg-slate-600"
    : pct < 40 ? "bg-red-500"
    : pct < 70 ? "bg-amber-500"
    : pct < 100 ? "bg-yellow-400"
    : "bg-emerald-400";

  const lightColor =
    pct === 0 ? "bg-slate-700"
    : pct < 40 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
    : pct < 70 ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
    : pct < 100 ? "bg-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.8)]"
    : "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]";

  const dialAngle = progress * 340;

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center gap-3 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 60%, #1a2a40 0%, #080f1a 100%)",
      }}
    >
      {/* Decorative grid lines */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(96,165,250,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Indicator lights row */}
      {hasValues && !open && (
        <div className="relative z-10 flex items-center gap-2">
          {[0, 25, 50, 75, 100].map((threshold, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                pct >= threshold ? lightColor : "bg-slate-800 border border-slate-700"
              }`}
            />
          ))}
          <span className="ml-2 text-xs font-mono text-slate-400">
            {pct < 100 ? `${pct}%` : "READY"}
          </span>
        </div>
      )}

      {/* Vault frame */}
      <div
        className="relative z-10 transition-all duration-500"
        style={{
          filter: open
            ? "drop-shadow(0 0 30px rgba(16,185,129,0.6))"
            : denied
              ? "drop-shadow(0 0 20px rgba(239,68,68,0.5))"
              : preUnlock
                ? "drop-shadow(0 0 25px rgba(52,211,153,0.4))"
                : "drop-shadow(0 0 15px rgba(59,130,246,0.3))",
        }}
      >
        {/* Vault door */}
        <div className="relative w-44 h-28 bg-slate-900 rounded-lg border-4 border-slate-600 overflow-hidden">
          {/* Left door half */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-[50.5%] flex flex-col justify-between py-2 px-1.5 transition-transform duration-700 ease-in-out ${
              open ? "-translate-x-full" : ""
            }`}
            style={{
              background: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
              borderRight: "2px solid #4b5563",
            }}
          >
            {[0, 1, 2].map((r) => (
              <div key={r} className="flex justify-between">
                {[0, 1].map((c) => (
                  <div
                    key={c}
                    className="w-3 h-3 rounded-full bg-slate-500 border-2 border-slate-400"
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Right door half */}
          <div
            className={`absolute right-0 top-0 bottom-0 w-[50.5%] flex flex-col justify-between py-2 px-1.5 transition-transform duration-700 ease-in-out ${
              open ? "translate-x-full" : ""
            }`}
            style={{
              background: "linear-gradient(225deg, #374151 0%, #1f2937 100%)",
              borderLeft: "2px solid #4b5563",
            }}
          >
            {[0, 1, 2].map((r) => (
              <div key={r} className="flex justify-between">
                {[0, 1].map((c) => (
                  <div
                    key={c}
                    className="w-3 h-3 rounded-full bg-slate-500 border-2 border-slate-400"
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Combination dial */}
          {!open && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="relative w-10 h-10">
                <div
                  className="w-full h-full rounded-full border-4 border-slate-400 bg-slate-700"
                  style={{
                    transform: `rotate(${dialAngle}deg)`,
                    transition: "transform 0.4s ease-out",
                    animationPlayState: denied ? "paused" : "running",
                    boxShadow: preUnlock ? "0 0 12px rgba(52,211,153,0.6)" : "none",
                    borderColor: preUnlock ? "rgb(52,211,153)" : undefined,
                  }}
                />
                <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-slate-200 rounded-full" />
                <div className="absolute inset-1.5 rounded-full border-2 border-slate-500" />
              </div>
            </div>
          )}

          {/* Diamond revealed */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center z-30 transition-all duration-500 ${
              open ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
            style={{ transitionDelay: open ? "400ms" : "0ms" }}
          >
            <div
              className="text-4xl animate-bounce"
              style={{ filter: "drop-shadow(0 0 16px rgba(147,197,253,0.9))" }}
            >
              💎
            </div>
          </div>

          {/* Error X overlay */}
          {denied && (
            <div className="absolute inset-0 flex items-center justify-center z-30 bg-red-900/30">
              <span className="text-4xl font-black text-red-400 animate-shake">
                ✗
              </span>
            </div>
          )}
        </div>

        {/* Neon frame accent */}
        <div
          className={`absolute -inset-1 rounded-xl border-2 transition-colors duration-500 ${
            open
              ? "border-emerald-400/60"
              : denied
                ? "border-red-500/60"
                : preUnlock
                  ? "border-emerald-400/40"
                  : "border-blue-500/20"
          }`}
        />
      </div>

      {/* Live progress bar */}
      {hasValues && !open && (
        <div className="relative z-10 w-44 flex flex-col gap-1">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-center text-xs font-mono text-slate-500">
            {preUnlock
              ? "✓ Code correct — press HACK IT!"
              : `${total} / 100 — need ${100 - total!} more`}
          </p>
        </div>
      )}

      {/* Status label */}
      {!hasValues && (
        <p className="relative z-10 text-sm font-bold tracking-wider uppercase text-blue-300/60">
          🔐 Vault Locked
        </p>
      )}
      {open && (
        <p className="relative z-10 text-sm font-bold tracking-wider uppercase text-emerald-400">
          ✓ Vault Cracked!
        </p>
      )}
      {denied && (
        <p className="relative z-10 text-sm font-bold tracking-wider uppercase text-red-400 animate-shake">
          ✗ Access Denied
        </p>
      )}

      {open && (
        <SuccessParticles
          items={["💎", "⭐", "✨", "💎", "⭐", "✨"]}
          positions={[10, 25, 40, 55, 70, 85]}
        />
      )}
    </div>
  );
}

// ─── CAMERA SCENE ─────────────────────────────────────────────────────────────
function CameraScene({ status, liveData }: SceneProps) {
  const liveStatus = typeof liveData.camera_status === "string" ? liveData.camera_status : null;
  const sleeping = status === "success" || liveStatus === "sleeping";
  const alert = !sleeping;

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center gap-3 overflow-hidden"
      style={{
        background: sleeping
          ? "radial-gradient(ellipse at 50% 50%, #0f2010 0%, #070d08 100%)"
          : "radial-gradient(ellipse at 50% 40%, #2a0f0f 0%, #0d0707 100%)",
        transition: "background 1s ease",
      }}
    >
      {/* Ambient glow */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${alert ? "opacity-100" : "opacity-0"}`}
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(239,68,68,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Camera body */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        {/* Sweep beam (only when alert) */}
        {alert && (
          <div
            className="absolute -top-2 left-1/2 w-0.5 h-28 origin-bottom animate-scan-beam"
            style={{
              background:
                "linear-gradient(to top, rgba(239,68,68,0.8), transparent)",
              transformOrigin: "50% 100%",
            }}
          />
        )}

        {/* Camera housing */}
        <div
          className={`relative transition-all duration-700 ${sleeping ? "grayscale opacity-60" : ""}`}
        >
          <div className="w-20 h-14 rounded-lg bg-slate-700 border-2 border-slate-500 flex items-center justify-center relative">
            {/* Lens */}
            <div
              className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                sleeping
                  ? "border-slate-500 bg-slate-600"
                  : "border-red-500 bg-red-900/50 animate-glow-pulse"
              }`}
              style={{
                boxShadow: sleeping
                  ? "none"
                  : "0 0 15px rgba(239,68,68,0.6)",
              }}
            >
              <div
                className={`w-4 h-4 rounded-full transition-all duration-500 ${
                  sleeping ? "bg-slate-500 scale-50" : "bg-red-500"
                }`}
              />
            </div>
            {/* Mount */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-600 border-2 border-slate-500 rounded-sm" />
          </div>
        </div>

        {/* ZZZ bubbles on sleep */}
        {sleeping && (
          <div className="absolute -top-4 right-2 flex flex-col items-end gap-1">
            {["z", "z", "Z"].map((z, i) => (
              <span
                key={i}
                className="text-slate-400 font-bold animate-zzz-rise"
                style={{
                  fontSize: `${10 + i * 4}px`,
                  animationDelay: `${i * 400}ms`,
                  animationIterationCount: "infinite",
                }}
              >
                {z}
              </span>
            ))}
          </div>
        )}

        {/* Status badge */}
        <div
          className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-500 ${
            sleeping
              ? "bg-emerald-900/60 text-emerald-300 border border-emerald-500/30"
              : "bg-red-900/60 text-red-300 border border-red-500/40 animate-glow-pulse"
          }`}
          style={{
            boxShadow: sleeping ? "none" : "0 0 12px rgba(239,68,68,0.3)",
          }}
        >
          {sleeping ? "💤 SLEEPING" : liveStatus ? `🔴 ${liveStatus}` : "🔴 ALERT!"}
        </div>

        {/* Live operator hint */}
        {liveStatus && !sleeping && (
          <p className="text-xs font-mono text-red-400/70 mt-1">
            Fix the operator: if (hour &lt; 22) → if (hour &gt;= 22)
          </p>
        )}
      </div>
    </div>
  );
}

// ─── LOCKS SCENE ──────────────────────────────────────────────────────────────
function LocksScene({ status, liveData }: SceneProps) {
  const open = status === "success";
  const liveOpened = typeof liveData.locks_opened === "number" ? liveData.locks_opened : 0;
  const displayOpened = open ? 10 : Math.min(10, Math.max(0, liveOpened));

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center gap-4 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 50%, #0f1a2a 0%, #060c16 100%)",
      }}
    >
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,179,237,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.5) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      {/* Locks grid */}
      <div className="relative z-10 grid grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => {
          const isOpen = i < displayOpened;
          return (
            <div
              key={i}
              className={`flex flex-col items-center gap-1 transition-all duration-300`}
              style={{
                transitionDelay: isOpen ? `${i * 60}ms` : "0ms",
              }}
            >
              <span
                className={`text-3xl transition-all duration-300 ${isOpen ? "animate-lock-pop" : "opacity-40"}`}
                style={{
                  animationDelay: isOpen ? `${i * 60}ms` : "0ms",
                  filter: isOpen
                    ? "drop-shadow(0 0 8px rgba(52,211,153,0.7))"
                    : "none",
                }}
              >
                {isOpen ? "🔓" : "🔒"}
              </span>
              <div
                className={`text-xs font-bold transition-colors duration-300 ${
                  isOpen ? "text-emerald-400" : "text-slate-600"
                }`}
                style={{ transitionDelay: isOpen ? `${i * 60 + 200}ms` : "0ms" }}
              >
                #{i + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Counter */}
      <div
        className={`relative z-10 text-sm font-bold transition-all duration-500 ${
          open || displayOpened === 10 ? "text-emerald-400" : "text-blue-300/60"
        }`}
      >
        {open || displayOpened === 10
          ? "✓ ALL 10 LOCKS OPENED!"
          : `🔒 ${displayOpened} / 10 locks opened`}
      </div>

      {open && (
        <SuccessParticles
          items={["🔓", "⭐", "✨", "🔓", "⭐"]}
          positions={[15, 30, 50, 65, 80]}
        />
      )}
    </div>
  );
}

// ─── DRONE SCENE ──────────────────────────────────────────────────────────────
function DroneScene({ status, liveData }: SceneProps) {
  const flying = status === "success";
  const hasFn = liveData.hasFn === true;
  const r5 = typeof liveData.result5 === "number" ? liveData.result5 : undefined;
  const r3 = typeof liveData.result3 === "number" ? liveData.result3 : undefined;
  const r1 = typeof liveData.result1 === "number" ? liveData.result1 : undefined;
  const allPass = r5 === 10 && r3 === 6 && r1 === 2;

  const tests: { label: string; result: number | undefined; expected: number }[] = [
    { label: "5m", result: r5, expected: 10 },
    { label: "3m", result: r3, expected: 6 },
    { label: "1m", result: r1, expected: 2 },
  ];

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center gap-3 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 60%, #0a1f1a 0%, #060c0a 100%)",
      }}
    >
      {/* Stars / dots */}
      {[15, 30, 50, 70, 85].map((x) =>
        [20, 45, 70].map((y) => (
          <div
            key={`${x}-${y}`}
            className="absolute w-1 h-1 rounded-full bg-cyan-400/20"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        ))
      )}

      {/* Flight zone */}
      <div className="relative z-10 w-full px-8">
        {/* Launch pad */}
        <div className="absolute left-8 bottom-0 w-16 h-3 bg-cyan-900/50 border border-cyan-500/30 rounded flex items-center justify-center">
          <span className="text-xs text-cyan-400 font-mono">LAUNCH</span>
        </div>

        {/* Target zone */}
        <div className="absolute right-8 bottom-0 w-16 h-3 bg-emerald-900/50 border border-emerald-500/30 rounded flex items-center justify-center">
          <span className="text-xs text-emerald-400 font-mono">TARGET</span>
        </div>

        {/* Flight path */}
        <div className="relative h-20 flex items-center">
          <div className="absolute inset-x-12 top-1/2 border-t-2 border-dashed border-cyan-500/20" />

          {/* Distance markers */}
          {[0, 25, 50, 75, 100].map((pct, i) => (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-full -translate-x-1/2"
              style={{ left: `${12 + pct * 0.76}%` }}
            >
              <div className="w-px h-2 bg-cyan-500/30 mb-0.5" />
              <span className="text-xs text-cyan-500/40 font-mono">{i}m</span>
            </div>
          ))}

          {/* Drone */}
          <div
            className={`absolute transition-none ${flying || allPass ? "animate-fly-across" : ""}`}
            style={{ left: "6%", top: "50%", transform: "translateY(-50%)" }}
          >
            <div className="relative">
              {/* Propeller arms */}
              <div className="absolute -top-3 left-0 right-0 flex justify-between px-1">
                <div
                  className="w-4 h-0.5 bg-slate-400 rounded-full animate-spin-fast"
                  style={{ transformOrigin: "right center" }}
                />
                <div
                  className="w-4 h-0.5 bg-slate-400 rounded-full animate-spin-fast"
                  style={{ transformOrigin: "left center", animationDirection: "reverse" }}
                />
              </div>
              {/* Body */}
              <div
                className="text-4xl"
                style={{ filter: flying || allPass ? "drop-shadow(0 0 10px rgba(6,182,212,0.7))" : "none" }}
              >
                🚁
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live test results */}
      {hasFn && (
        <div className="relative z-10 flex gap-3">
          {tests.map(({ label, result, expected }) => {
            const pass = result === expected;
            const pending = result === undefined;
            return (
              <div
                key={label}
                className={`flex flex-col items-center px-2 py-1 rounded border text-xs font-mono transition-all duration-300 ${
                  pending
                    ? "border-slate-700 text-slate-600"
                    : pass
                      ? "border-emerald-500/50 text-emerald-400 bg-emerald-900/20"
                      : "border-red-500/50 text-red-400 bg-red-900/20"
                }`}
              >
                <span>{label}</span>
                <span>{pending ? "—" : `${result}`}</span>
                <span className="text-[10px]">{pending ? "" : pass ? "✓" : `✗${expected}`}</span>
              </div>
            );
          })}
        </div>
      )}

      {!hasFn && (
        <p className="relative z-10 text-xs font-mono text-cyan-400/40">
          Define fly_drone(distance) to see live tests
        </p>
      )}

      <p
        className={`relative z-10 text-sm font-bold transition-colors ${
          flying || allPass ? "text-emerald-400" : "text-cyan-400/50"
        }`}
      >
        {flying || allPass ? "✓ Drone Successfully Programmed!" : "🚁 Drone Standing By"}
      </p>
    </div>
  );
}

// ─── BOSS SCENE ───────────────────────────────────────────────────────────────
function BossScene({ status, liveData }: SceneProps) {
  const defeated = status === "success";

  const liveHp = typeof liveData.robot_health === "number" ? liveData.robot_health : 100;
  const liveRounds = typeof liveData.rounds === "number" ? liveData.rounds : 0;
  const liveShield = typeof liveData.shield_active === "boolean" ? liveData.shield_active : true;

  const displayHp = defeated ? 0 : Math.max(0, liveHp);
  const hpPct = Math.min(100, Math.max(0, (displayHp / 100) * 100));
  const fighting = liveRounds > 0 && !defeated;

  const hpBarColor =
    hpPct > 60 ? "bg-red-500"
    : hpPct > 30 ? "bg-amber-500"
    : "bg-red-700";

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center gap-3 overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at 50% 40%, #1a0d2e 0%, #0a0614 100%)",
      }}
    >
      {/* Ambient lightning */}
      {!defeated && (
        <div
          className="absolute inset-0 animate-glow-pulse"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(147,51,234,0.08) 0%, transparent 70%)" }}
        />
      )}

      {/* Battle arena */}
      <div className="relative z-10 flex items-end justify-between w-full px-6 pb-2">
        {/* Player */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`text-5xl transition-all duration-500 ${defeated ? "animate-bounce" : ""}`}
            style={{ filter: "drop-shadow(0 0 10px rgba(52,211,153,0.5))" }}
          >
            🧑‍💻
          </div>
          <div className="w-20">
            <div className="flex justify-between text-xs text-slate-400 mb-0.5">
              <span className="font-mono">YOU</span>
              <span className="font-bold text-emerald-400">100</span>
            </div>
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div className="h-full w-full bg-emerald-500 rounded-full" />
            </div>
          </div>
        </div>

        {/* VS / round counter */}
        <div className="flex flex-col items-center gap-1">
          <span
            className={`text-2xl font-black transition-all duration-300 ${defeated ? "text-emerald-400 scale-125" : "text-purple-400 animate-glow-pulse"}`}
          >
            {defeated ? "WIN!" : "⚔️"}
          </span>
          {liveRounds > 0 && (
            <span className="text-xs font-mono text-slate-500">
              Round {liveRounds}
            </span>
          )}
        </div>

        {/* Robot */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`text-5xl transition-all duration-700 ${defeated ? "animate-explode opacity-0" : ""}`}
            style={{
              filter: defeated ? "none" : "drop-shadow(0 0 10px rgba(239,68,68,0.5))",
            }}
          >
            {defeated ? "💥" : "🤖"}
          </div>
          <div className="w-20">
            <div className="flex justify-between text-xs text-slate-400 mb-0.5">
              <span className="font-mono">ROBOT</span>
              <span className={`font-bold ${hpPct === 0 ? "text-slate-500" : "text-red-400"}`}>
                {displayHp}
              </span>
            </div>
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-700 ${hpBarColor} ${defeated ? "animate-hp-drain" : ""}`}
                style={{ width: `${hpPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shield / status indicator */}
      {!defeated && (
        <div className="relative z-10 flex items-center gap-2 text-xs font-mono">
          {liveShield ? (
            <span className="text-purple-300/70">🛡️ Shield active — damage halved</span>
          ) : fighting ? (
            <span className="text-amber-400/80">⚡ Shield down — full damage!</span>
          ) : (
            <span className="text-slate-500">🛡️ Shield active — write your loop</span>
          )}
        </div>
      )}

      {defeated && (
        <p className="relative z-10 text-sm font-bold text-emerald-400 animate-slide-up">
          ✓ Security Robot Defeated!
        </p>
      )}

      {defeated && (
        <SuccessParticles
          items={["⭐", "💥", "🏆", "⭐", "💥"]}
          positions={[10, 25, 45, 65, 80]}
        />
      )}
    </div>
  );
}

// ─── Exported shell ───────────────────────────────────────────────────────────
interface MissionSceneProps {
  scene: SceneType;
  status: SceneStatus;
  liveData: Record<string, unknown>;
}

const SCENES: Record<SceneType, React.FC<SceneProps>> = {
  vault: VaultScene,
  cameras: CameraScene,
  locks: LocksScene,
  drone: DroneScene,
  boss: BossScene,
};

export function MissionScene({ scene, status, liveData }: MissionSceneProps) {
  const Scene = SCENES[scene];
  return <Scene status={status} liveData={liveData} />;
}
