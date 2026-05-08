import { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";

function formatMs(ms: number | null) {
  if (ms == null) return "00:00.000";
  const total = Math.max(0, ms);
  const seconds = Math.floor(total / 1000);
  const millis = Math.floor(total % 1000)
    .toString()
    .padStart(3, "0");
  return `00:${seconds.toString().padStart(2, "0")}.${millis}`;
}

export function GameHUD() {
  const { telemetry, startedAtMs, completionMs, stageState, stage, boostUntilMs, jumpLogicEnabled, bonusRun } =
    useGameStore();
  const [now, setNow] = useState(() => performance.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(performance.now()), 50);
    return () => window.clearInterval(id);
  }, []);

  const timeLimitMs = bonusRun ? bonusRun.template.layout.data.timeLimitMs : stage.timeLimitMs;
  const title = bonusRun ? bonusRun.instance.displayName : stage.title;

  useEffect(() => {
    console.log("[HUD_PIPELINE] active title/context", title, {
      bonusInstanceId: bonusRun?.instance?.id ?? null,
      pinnedMainStageId: stage.id,
    });
  }, [bonusRun?.instance?.id, stage.id, title]);

  const elapsed = (() => {
    if (stageState === "passed") return completionMs;
    if (!startedAtMs) return null;
    return now - startedAtMs;
  })();
  const remainingMs =
    stageState === "running" && startedAtMs
      ? Math.max(0, timeLimitMs - (now - startedAtMs))
      : timeLimitMs;
  const boosting = performance.now() < boostUntilMs;

  const bottomHint = bonusRun ? (
    bonusRun.template.topicId === "conditionals" || bonusRun.template.topicId === "functions" ? (
      <div className="text-cyan-300">SPACE uses your bonus bindings (jump / boost).</div>
    ) : (
      <div className="text-cyan-300">Bonus prototype — timer uses the template limit.</div>
    )
  ) : stage.kind === "speedGate" ? (
    <div className="text-cyan-300">
      Gate speed {">"} {stage.requiredGateSpeed}
    </div>
  ) : (
    <div className="text-cyan-300">
      SPACE jump:{" "}
      <span className={jumpLogicEnabled ? "text-emerald-300" : "text-rose-300"}>
        {jumpLogicEnabled ? "enabled" : "disabled"}
      </span>
    </div>
  );

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-4 top-4 rounded-lg border border-cyan-400/20 bg-slate-900/75 px-3 py-2 text-xs backdrop-blur">
        <div className="text-slate-400">Speed</div>
        <div className="text-lg font-bold text-cyan-300">{telemetry.speed.toFixed(2)}</div>
      </div>
      <div className="absolute right-4 top-4 rounded-lg border border-cyan-400/20 bg-slate-900/75 px-3 py-2 text-xs backdrop-blur">
        <div className="text-slate-400">Timer / Limit</div>
        <div className="text-lg font-bold text-cyan-300">{formatMs(elapsed)}</div>
        <div className="text-[11px] text-slate-400">Remain: {formatMs(remainingMs)}</div>
      </div>
      <div className="absolute bottom-4 right-4 rounded-lg border border-cyan-400/20 bg-slate-900/75 px-3 py-2 text-xs backdrop-blur">
        <div className="text-slate-400">{title}</div>
        {bottomHint}
      </div>
      <div
        className={`absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-cyan-400/20 to-transparent transition-opacity ${telemetry.speed > 6 ? "opacity-100" : "opacity-20"}`}
      />
      <div className={`absolute inset-0 transition-opacity ${boosting ? "opacity-100" : "opacity-0"}`}>
        <div className="absolute inset-y-0 left-1/4 w-px bg-cyan-300/60 blur-[1px]" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-300/70 blur-[1px]" />
        <div className="absolute inset-y-0 left-3/4 w-px bg-cyan-300/60 blur-[1px]" />
      </div>
    </div>
  );
}
