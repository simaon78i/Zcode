import React, { useEffect, useRef, useState } from "react";
import type { GameProps } from "@codequest/games-sdk";
import { MISSIONS, RANKS, HINT_XP_COSTS, getRank } from "./levels";
import type { SceneType } from "./levels";
import { runMission, type RunResult } from "./engine/testRunner";
import { analyzeError } from "./engine/errorAnalyzer";
import { MissionScene, type SceneStatus } from "./ui/MissionScene";
import { HintSystem } from "./ui/HintSystem";
import { RewardOverlay } from "./ui/RewardOverlay";
import { LiveConsole } from "./ui/LiveConsole";

// Line height + top-padding must match the textarea's Tailwind classes
const LINE_H = 24; // leading-6 at 16px base = 24px
const PAD_T  = 16; // py-4 top = 16px

// ─── Hacker terminal with CHANGE THIS line highlights ─────────────────────────
function HackerTerminal({
  value,
  onChange,
  shaking,
}: {
  value: string;
  onChange: (v: string) => void;
  shaking: boolean;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea height
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const lines = value.split("\n");
  const changeLines = lines.reduce<number[]>((acc, line, i) => {
    if (line.includes("// ← CHANGE THIS")) acc.push(i);
    return acc;
  }, []);

  return (
    <div
      className={`relative flex flex-col rounded-lg overflow-hidden border h-full transition-all duration-300 ${
        shaking
          ? "animate-shake border-red-500/60"
          : "border-cyan-900/50 hover:border-cyan-700/40"
      }`}
      style={{
        background: "#06111e",
        boxShadow: shaking
          ? "0 0 20px rgba(239,68,68,0.2) inset"
          : "0 0 15px rgba(6,182,212,0.04) inset",
      }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-cyan-900/40 bg-black/30 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/70" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
          <div className="w-2 h-2 rounded-full bg-green-500/70" />
        </div>
        <span className="ml-1 text-xs text-cyan-700 font-mono tracking-wider">
          hacker_terminal.js
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {changeLines.length > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono tracking-wider"
              style={{
                background: "rgba(251,146,60,0.15)",
                color: "#fb923c",
                border: "1px solid rgba(251,146,60,0.3)",
              }}
            >
              {changeLines.length} LINE{changeLines.length > 1 ? "S" : ""} TO CHANGE
            </span>
          )}
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-glow-pulse" />
          <span className="text-xs text-cyan-700 font-mono">LIVE</span>
        </div>
      </div>

      {/* Code area */}
      <div className="flex flex-1 min-h-0 overflow-auto">
        {/* Gutter: line numbers + change indicator */}
        <div
          className="shrink-0 select-none py-4 font-mono text-xs border-r border-cyan-900/30"
          style={{ background: "rgba(0,0,0,0.25)", minWidth: "3.25rem" }}
        >
          {lines.map((line, i) => {
            const isChange = line.includes("// ← CHANGE THIS");
            return (
              <div
                key={i}
                className="relative flex items-center justify-end pr-2"
                style={{ height: `${LINE_H}px` }}
              >
                {isChange && (
                  <>
                    {/* Amber left-edge glow */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-0.5"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(251,146,60,0.9), rgba(251,146,60,0.4))",
                        boxShadow: "2px 0 8px rgba(251,146,60,0.4)",
                      }}
                    />
                    <span
                      className="absolute left-1.5 font-black"
                      style={{ fontSize: "8px", color: "#fb923c", lineHeight: 1 }}
                    >
                      ◄
                    </span>
                  </>
                )}
                <span
                  style={{
                    color: isChange ? "#f97316" : "#1e4060",
                    fontWeight: isChange ? 700 : 400,
                  }}
                >
                  {i + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Textarea + highlight overlay */}
        <div className="relative flex-1">
          {/* Highlight layer — positioned absolute, scrolls with content */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            {changeLines.map((lineIdx) => (
              <div
                key={lineIdx}
                className="absolute left-0 right-0"
                style={{
                  top: `${PAD_T + lineIdx * LINE_H}px`,
                  height: `${LINE_H}px`,
                  background:
                    "linear-gradient(90deg, rgba(251,146,60,0.14) 0%, rgba(251,146,60,0.05) 80%, transparent 100%)",
                  borderLeft: "2px solid rgba(251,146,60,0.5)",
                  boxShadow: "inset 0 0 20px rgba(251,146,60,0.04)",
                }}
              />
            ))}
          </div>

          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            className="relative z-10 w-full px-4 py-4 font-mono text-sm leading-6 resize-none focus:outline-none"
            style={{
              color: "#7dd3fc",
              caretColor: "#22d3ee",
              background: "transparent",
              tabSize: 2,
              minHeight: "100%",
            }}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                const next =
                  value.substring(0, start) + "  " + value.substring(end);
                onChange(next);
                requestAnimationFrame(() => {
                  if (taRef.current) {
                    taRef.current.selectionStart = start + 2;
                    taRef.current.selectionEnd = start + 2;
                  }
                });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── XP bar ───────────────────────────────────────────────────────────────────
function XPBar({ totalXP, animated }: { totalXP: number; animated: boolean }) {
  const rank = getRank(totalXP);
  const rankIndex = RANKS.findIndex((r) => r.name === rank.name);
  const nextRank = RANKS[rankIndex + 1];
  const progress = nextRank
    ? Math.min(
        100,
        Math.round(
          ((totalXP - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100
        )
      )
    : 100;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className={`text-xs font-bold shrink-0 ${rank.color}`}>
        {rank.name}
      </span>
      <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden shrink-0">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            animated ? "bg-cyan-400" : "bg-cyan-600"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 shrink-0">{totalXP} XP</span>
    </div>
  );
}

// ─── Live status strip (one-line reactive bar below the scene) ────────────────
function LiveStatusStrip({
  liveData,
  scene,
  runResult,
}: {
  liveData: Record<string, unknown>;
  scene: SceneType;
  runResult: RunResult | null;
}) {
  const unlocked = runResult?.passed === true;

  // ── Vault ──────────────────────────────────────────────────────────────────
  if (scene === "vault") {
    const total = typeof liveData.total === "number" ? liveData.total : null;
    const dw =
      typeof liveData.diamond_weight === "number"
        ? liveData.diamond_weight
        : null;
    const gb =
      typeof liveData.gold_bars === "number" ? liveData.gold_bars : null;

    if (total === null) {
      return (
        <div
          className="shrink-0 px-3 py-1 flex items-center border-b border-white/5"
          style={{ background: "rgba(0,0,0,0.4)", height: "30px" }}
        >
          <span className="text-xs font-mono text-slate-600 animate-glow-pulse">
            — scanning code —
          </span>
        </div>
      );
    }

    const pct = Math.min(100, Math.max(0, Math.round((total / 100) * 100)));
    const tooHigh = total > 100;
    const isReady = total === 100;

    const barColor =
      pct < 40
        ? "bg-red-500"
        : pct < 70
          ? "bg-amber-500"
          : pct < 100
            ? "bg-yellow-400"
            : "bg-emerald-400";

    const valColor = unlocked || isReady
      ? "#34d399"
      : tooHigh
        ? "#f87171"
        : "#fbbf24";

    return (
      <div
        className="shrink-0 px-3 flex items-center gap-3 border-b border-white/5"
        style={{ background: "rgba(0,0,0,0.4)", height: "30px" }}
      >
        <span className="text-[10px] font-mono text-slate-600 tracking-widest shrink-0">
          TOTAL
        </span>
        <span
          className="text-sm font-black font-mono shrink-0 tabular-nums transition-colors duration-300"
          style={{ color: valColor }}
        >
          {dw !== null && gb !== null ? `${dw} + ${gb} = ` : ""}
          <span className="text-white">{total}</span>
          <span style={{ color: "#334155" }}> / 100</span>
        </span>

        <div className="flex-1 h-1 bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {unlocked ? (
          <span
            className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(16,185,129,0.15)",
              color: "#34d399",
              border: "1px solid rgba(52,211,153,0.3)",
            }}
          >
            ✓ VAULT OPEN
          </span>
        ) : isReady ? (
          <span
            className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full animate-glow-pulse"
            style={{
              background: "rgba(16,185,129,0.1)",
              color: "#6ee7b7",
              border: "1px solid rgba(52,211,153,0.2)",
            }}
          >
            READY — HIT HACK IT
          </span>
        ) : (
          <span
            className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
            style={
              tooHigh
                ? {
                    background: "rgba(239,68,68,0.1)",
                    color: "#fca5a5",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }
                : {
                    background: "rgba(30,30,40,0.6)",
                    color: "#94a3b8",
                    border: "1px solid rgba(100,116,139,0.2)",
                  }
            }
          >
            {tooHigh ? `▲ ${total - 100} too many` : `▼ need ${100 - total} more`}
          </span>
        )}
      </div>
    );
  }

  // ── Cameras ────────────────────────────────────────────────────────────────
  if (scene === "cameras") {
    const status =
      typeof liveData.camera_status === "string"
        ? liveData.camera_status
        : null;
    const sleeping = status === "sleeping";
    return (
      <div
        className="shrink-0 px-3 flex items-center gap-3 border-b border-white/5"
        style={{ background: "rgba(0,0,0,0.4)", height: "30px" }}
      >
        <span className="text-[10px] font-mono text-slate-600 tracking-widest shrink-0">
          CAMERA
        </span>
        {status ? (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={
              sleeping
                ? {
                    background: "rgba(16,185,129,0.1)",
                    color: "#34d399",
                    border: "1px solid rgba(52,211,153,0.2)",
                  }
                : {
                    background: "rgba(239,68,68,0.1)",
                    color: "#fca5a5",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }
            }
          >
            {sleeping ? "💤 SLEEPING" : `🔴 ${status}`}
          </span>
        ) : (
          <span className="text-xs font-mono text-slate-600">
            evaluating condition...
          </span>
        )}
        {unlocked && (
          <span className="ml-auto text-xs font-bold text-emerald-400">
            ✓ Cameras offline
          </span>
        )}
      </div>
    );
  }

  // ── Locks ──────────────────────────────────────────────────────────────────
  if (scene === "locks") {
    const opened =
      typeof liveData.locks_opened === "number"
        ? liveData.locks_opened
        : null;
    const pct = opened !== null ? Math.min(100, (opened / 10) * 100) : 0;
    return (
      <div
        className="shrink-0 px-3 flex items-center gap-3 border-b border-white/5"
        style={{ background: "rgba(0,0,0,0.4)", height: "30px" }}
      >
        <span className="text-[10px] font-mono text-slate-600 tracking-widest shrink-0">
          LOCKS
        </span>
        <span
          className="text-sm font-black font-mono shrink-0 tabular-nums"
          style={{ color: opened === 10 ? "#34d399" : "#fbbf24" }}
        >
          {opened ?? 0} / 10
        </span>
        <div className="flex-1 h-1 bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              opened === 10 ? "bg-emerald-400" : "bg-amber-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {opened === 10 ? (
          <span
            className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(16,185,129,0.1)",
              color: "#34d399",
              border: "1px solid rgba(52,211,153,0.2)",
            }}
          >
            ALL CLEAR
          </span>
        ) : opened !== null ? (
          <span className="text-xs text-slate-500 font-mono shrink-0">
            need {10 - opened} more
          </span>
        ) : null}
      </div>
    );
  }

  // ── Drone ──────────────────────────────────────────────────────────────────
  if (scene === "drone") {
    const r5 =
      typeof liveData.result5 === "number" ? liveData.result5 : null;
    const r3 =
      typeof liveData.result3 === "number" ? liveData.result3 : null;
    const allPass = r5 === 10 && r3 === 6;
    return (
      <div
        className="shrink-0 px-3 flex items-center gap-3 border-b border-white/5"
        style={{ background: "rgba(0,0,0,0.4)", height: "30px" }}
      >
        <span className="text-[10px] font-mono text-slate-600 tracking-widest shrink-0">
          TESTS
        </span>
        {r5 !== null ? (
          <>
            <span
              className="text-xs font-mono"
              style={{ color: r5 === 10 ? "#34d399" : "#f87171" }}
            >
              fly(5)={r5}{r5 === 10 ? " ✓" : " ✗"}
            </span>
            {r3 !== null && (
              <span
                className="text-xs font-mono"
                style={{ color: r3 === 6 ? "#34d399" : "#f87171" }}
              >
                fly(3)={r3}{r3 === 6 ? " ✓" : " ✗"}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs font-mono text-slate-600">
            define fly_drone() to see live tests
          </span>
        )}
        {allPass && (
          <span className="ml-auto text-xs font-bold text-emerald-400">
            ✓ All tests pass
          </span>
        )}
      </div>
    );
  }

  // ── Boss ───────────────────────────────────────────────────────────────────
  if (scene === "boss") {
    const hp =
      typeof liveData.robot_health === "number" ? liveData.robot_health : 100;
    const rounds =
      typeof liveData.rounds === "number" ? liveData.rounds : 0;
    const pct = Math.min(100, Math.max(0, hp));
    return (
      <div
        className="shrink-0 px-3 flex items-center gap-3 border-b border-white/5"
        style={{ background: "rgba(0,0,0,0.4)", height: "30px" }}
      >
        <span className="text-[10px] font-mono text-slate-600 tracking-widest shrink-0">
          ROBOT HP
        </span>
        <span
          className="text-sm font-black font-mono shrink-0 tabular-nums"
          style={{ color: hp <= 0 ? "#34d399" : "#f87171" }}
        >
          {Math.max(0, hp)}
        </span>
        <div className="flex-1 h-1 bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 bg-red-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-mono text-slate-600 shrink-0">
          round {rounds}
        </span>
        {hp <= 0 && (
          <span className="text-xs font-bold text-emerald-400 shrink-0">
            ✓ DEFEATED
          </span>
        )}
      </div>
    );
  }

  return null;
}

// ─── How to play sidebar box ──────────────────────────────────────────────────
function HowToPlay() {
  return (
    <div>
      <p className="text-[10px] font-mono text-cyan-700 uppercase tracking-wider mb-2">
        How to Play
      </p>
      <div className="space-y-1.5">
        {(
          [
            ["1", "Change the highlighted lines", "#fb923c"],
            ["2", "Watch the scanner update live", "#22d3ee"],
            ["3", "Hit HACK IT when ready", "#34d399"],
          ] as const
        ).map(([n, text, color]) => (
          <div key={n} className="flex items-start gap-2">
            <span
              className="w-4 h-4 rounded text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5"
              style={{
                background: `${color}15`,
                color,
                border: `1px solid ${color}40`,
              }}
            >
              {n}
            </span>
            <span className="text-xs text-slate-500 leading-tight">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export const CodeBreakerComponent: React.FC<GameProps> = ({
  level,
  onLevelComplete,
  onMentorRequest,
  onExit,
}) => {
  const mission = MISSIONS[level - 1];

  // Per-level state
  const [code, setCode] = useState(mission?.starterCode ?? "");
  const [liveData, setLiveData] = useState<Record<string, unknown>>({});
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [showReward, setShowReward] = useState(false);
  const [pendingReward, setPendingReward] = useState<{
    xp: number;
    diamonds: number;
    bonuses: string[];
  } | null>(null);
  const [shaking, setShaking] = useState(false);

  // Session state (persists across levels)
  const [totalXP, setTotalXP] = useState(0);
  const [totalDiamonds, setTotalDiamonds] = useState(0);
  const [xpJustChanged, setXpJustChanged] = useState(false);

  useEffect(() => {
    if (mission) {
      setCode(mission.starterCode);
      setLiveData({});
      setRunResult(null);
      setAttempts(0);
      setHintsRevealed(0);
      setStartTime(Date.now());
      setShowReward(false);
      setPendingReward(null);
      setShaking(false);
    }
  }, [level]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced live extraction — updates scene + console as student types
  useEffect(() => {
    if (!mission) return;
    const timer = setTimeout(() => {
      setLiveData(mission.liveExtract(code));
    }, 200);
    return () => clearTimeout(timer);
  }, [code, mission]);

  // All missions done
  if (!mission) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-white"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, #1a0d2e 0%, #04020a 100%)",
        }}
      >
        <div className="text-center px-6">
          <div className="text-8xl mb-6 animate-bounce">🏆</div>
          <h1 className="text-5xl font-black text-yellow-400 mb-3 tracking-wider">
            HEIST COMPLETE!
          </h1>
          <p className="text-slate-300 text-lg mb-2">
            You cracked every vault. The diamonds are yours.
          </p>
          <p className="text-slate-500 text-sm mb-10">
            {totalXP} XP earned &nbsp;·&nbsp; {totalDiamonds} 💎 collected
          </p>
          <button
            onClick={onExit}
            className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-2xl transition-colors"
            style={{ boxShadow: "0 0 30px rgba(16,185,129,0.4)" }}
          >
            → Return to Base
          </button>
        </div>
      </div>
    );
  }

  const sceneStatus: SceneStatus =
    runResult === null ? "idle" : runResult.passed ? "success" : "error";

  // ── Handlers ────────────────────────────────────────────────────────────────
  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  };

  const handleRun = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const result = runMission(mission, code);
    setRunResult(result);

    if (result.passed) {
      const timeSeconds = Math.floor((Date.now() - startTime) / 1000);
      const bonuses: string[] = [];
      let bonusXP = 0;

      if (newAttempts === 1) {
        bonuses.push("First Try! +30 XP");
        bonusXP += 30;
      }
      if (hintsRevealed === 0) {
        bonuses.push("No Hints! +20 XP");
        bonusXP += 20;
      }
      if (timeSeconds < 90) {
        bonuses.push("Speed Hacker! +20 XP");
        bonusXP += 20;
      }

      const hintPenalty = HINT_XP_COSTS.slice(0, hintsRevealed).reduce(
        (a, b) => a + b,
        0
      );
      const xpEarned = Math.max(10, mission.xpBase + bonusXP - hintPenalty);
      const diamondsEarned = mission.diamondBase + (timeSeconds < 90 ? 3 : 0);

      setTotalXP((prev) => prev + xpEarned);
      setTotalDiamonds((prev) => prev + diamondsEarned);
      setXpJustChanged(true);
      setTimeout(() => setXpJustChanged(false), 1500);

      setPendingReward({ xp: xpEarned, diamonds: diamondsEarned, bonuses });
      setTimeout(() => setShowReward(true), 800);
    } else {
      triggerShake();
    }
  };

  const handleRevealHint = () => {
    if (hintsRevealed >= mission.hints.length) return;
    setHintsRevealed((h) => h + 1);
    onMentorRequest({
      level,
      goal: mission.concept,
      currentCode: code,
      errorMessage:
        runResult?.error ??
        runResult?.checkResults.find((c) => !c.passed)?.failHint,
    });
  };

  const handleContinue = () => {
    setShowReward(false);
    onLevelComplete({
      level,
      passed: true,
      timeSpent: Math.floor((Date.now() - startTime) / 1000),
      attempts,
      artifact: code,
      hintsUsed: hintsRevealed,
    });
  };

  const failedCheck = runResult?.checkResults.find((c) => !c.passed);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="h-screen flex flex-col text-white overflow-hidden"
      style={{ background: "#04080f" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header
        className="shrink-0 px-3 flex items-center justify-between gap-3 border-b border-white/5"
        style={{
          background: "rgba(4,8,15,0.98)",
          height: "44px",
          minHeight: "44px",
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onExit}
            className="text-slate-600 hover:text-slate-300 text-sm transition-colors shrink-0"
          >
            ✕
          </button>
          <span
            className="font-black text-sm tracking-wider shrink-0"
            style={{
              color: "#7dd3fc",
              textShadow: "0 0 10px rgba(125,211,252,0.4)",
            }}
          >
            💎 CODEBREAKER
          </span>
          <span className="text-slate-700 shrink-0">›</span>
          <span className="text-slate-400 text-xs truncate">{mission.title}</span>
          {/* Mission progress dots */}
          <div className="flex gap-1 ml-1 shrink-0">
            {MISSIONS.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i < level - 1
                    ? "bg-emerald-400"
                    : i === level - 1
                      ? "bg-cyan-400 animate-glow-pulse"
                      : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <XPBar totalXP={totalXP} animated={xpJustChanged} />
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-blue-500/30 text-xs font-bold"
            style={{ background: "rgba(37,99,235,0.1)", color: "#93c5fd" }}
          >
            💎 {totalDiamonds}
          </div>
          <span className="hidden xl:block text-xs text-cyan-500/40 font-mono border border-cyan-900/30 px-1.5 py-0.5 rounded">
            {mission.subtitle}
          </span>
        </div>
      </header>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left column: scene → status → console → editor → controls */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
          {/* Live mission scene — compact fixed height */}
          <div className="shrink-0" style={{ height: "190px" }}>
            <MissionScene
              scene={mission.scene}
              status={sceneStatus}
              liveData={liveData}
            />
          </div>

          {/* Live status strip — single reactive line below scene */}
          <LiveStatusStrip
            liveData={liveData}
            scene={mission.scene}
            runResult={runResult}
          />

          {/* Security console */}
          <div className="shrink-0 px-3 pt-2">
            <LiveConsole
              scene={mission.scene}
              liveData={liveData}
              runResult={runResult}
            />
          </div>

          {/* Editor + error + controls */}
          <div className="flex-1 flex flex-col min-h-0 px-3 pt-2 pb-3 gap-2 overflow-hidden">
            {/* Terminal fills remaining space */}
            <div className="flex-1 min-h-0">
              <HackerTerminal
                value={code}
                onChange={setCode}
                shaking={shaking}
              />
            </div>

            {/* Error / output panel (only on failure) */}
            {runResult && !runResult.passed && (
              <div
                className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-mono max-h-20 overflow-y-auto ${
                  runResult.error
                    ? "border-red-500/30 bg-red-950/30 text-red-300"
                    : "border-slate-700/50 bg-slate-900/50 text-slate-300"
                }`}
              >
                {runResult.error ? (
                  <pre className="whitespace-pre-wrap leading-relaxed">
                    {analyzeError(runResult.error)}
                  </pre>
                ) : (
                  <>
                    {runResult.output.length > 0 && (
                      <div className="mb-1 space-y-0.5 text-slate-400">
                        {runResult.output.map((line, i) => (
                          <div key={i}>
                            <span className="text-slate-600 mr-2">›</span>
                            {line}
                          </div>
                        ))}
                      </div>
                    )}
                    {failedCheck && (
                      <p className="text-amber-300">⚠ {failedCheck.failHint}</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Control bar */}
            <div className="shrink-0 flex gap-2">
              <button
                onClick={handleRun}
                disabled={runResult?.passed}
                className="flex-1 py-2.5 rounded-xl font-black text-sm tracking-wider uppercase transition-all duration-200 disabled:opacity-50 active:scale-95"
                style={
                  runResult?.passed
                    ? {
                        background: "#1a3a2a",
                        color: "#4ade80",
                        border: "1px solid #166534",
                      }
                    : {
                        background:
                          "linear-gradient(135deg, #059669 0%, #047857 100%)",
                        color: "white",
                        boxShadow:
                          "0 0 20px rgba(5,150,105,0.4), 0 4px 15px rgba(0,0,0,0.4)",
                        border: "1px solid rgba(52,211,153,0.3)",
                      }
                }
              >
                {runResult?.passed ? "✓ HACKED!" : "▶▶ HACK IT!"}
              </button>

              <button
                onClick={handleRevealHint}
                disabled={hintsRevealed >= mission.hints.length}
                className="px-4 py-2.5 rounded-xl font-bold text-xs transition-all border border-amber-600/30 disabled:opacity-30 active:scale-95"
                style={{ background: "rgba(120,53,15,0.2)", color: "#fbbf24" }}
              >
                💡{" "}
                {hintsRevealed > 0
                  ? `${hintsRevealed}/${mission.hints.length}`
                  : "Hint"}
              </button>

              <button
                onClick={() => {
                  setCode(mission.starterCode);
                  setRunResult(null);
                }}
                title="Reset code"
                className="px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-400 transition-colors border border-slate-800 hover:border-slate-700"
              >
                ↺
              </button>
            </div>
          </div>
        </div>

        {/* Right column: always-visible sidebar */}
        <div
          className="hidden lg:flex w-56 xl:w-64 shrink-0 flex-col border-l border-white/5 overflow-hidden"
          style={{ background: "rgba(4,8,15,0.6)" }}
        >
          {/* Mission brief */}
          <div className="shrink-0 px-3 pt-3 pb-2.5 border-b border-white/5">
            <p className="text-[10px] font-mono text-cyan-700 uppercase tracking-wider mb-1.5">
              Mission Brief
            </p>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
              {mission.missionBrief.replace(/^[^\s]+\s/, "")}
            </p>
          </div>

          {/* How to play */}
          <div className="shrink-0 px-3 py-2.5 border-b border-white/5">
            <HowToPlay />
          </div>

          {/* Objectives — always visible, no toggle */}
          <div className="flex-1 px-3 py-2.5 overflow-y-auto border-b border-white/5">
            <p className="text-[10px] font-mono text-cyan-700 uppercase tracking-wider mb-2">
              Objectives
            </p>
            <div className="space-y-2.5">
              {mission.checks.map((check, i) => {
                const res = runResult?.checkResults[i];
                const icon = !runResult ? "○" : res?.passed ? "✓" : "✗";
                const col = !runResult
                  ? "text-slate-600"
                  : res?.passed
                    ? "text-emerald-400"
                    : "text-red-400";
                return (
                  <div key={i} className="flex gap-2">
                    <span className={`font-black shrink-0 text-sm ${col}`}>
                      {icon}
                    </span>
                    <div>
                      <p className={`text-xs leading-relaxed ${col}`}>
                        {check.description}
                      </p>
                      {res && !res.passed && (
                        <p className="text-xs text-amber-400/70 mt-0.5 leading-relaxed">
                          {check.failHint}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hints */}
          <div
            className="shrink-0 px-3 py-2.5 border-b border-white/5 overflow-y-auto"
            style={{ maxHeight: "9rem" }}
          >
            <HintSystem
              hints={mission.hints}
              revealed={hintsRevealed}
              onReveal={handleRevealHint}
            />
          </div>

          {/* Stats footer */}
          <div className="shrink-0 px-3 py-2 flex gap-3 text-xs text-slate-700 font-mono">
            <span>
              atts: <strong className="text-slate-500">{attempts}</strong>
            </span>
            <span>
              hints: <strong className="text-slate-500">{hintsRevealed}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ── Reward overlay ────────────────────────────────────────────────── */}
      {showReward && pendingReward && (
        <RewardOverlay
          xpEarned={pendingReward.xp}
          diamonds={pendingReward.diamonds}
          bonuses={pendingReward.bonuses}
          rank={getRank(totalXP)}
          missionTitle={mission.title}
          isLastMission={level >= MISSIONS.length}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
};