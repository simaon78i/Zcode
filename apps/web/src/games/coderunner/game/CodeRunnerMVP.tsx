import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { GameCanvas } from "./GameCanvas";
import { LeftPanel } from "../ui/LeftPanel";
import { GameHUD } from "../ui/GameHUD";
import { useGameStore } from "../store/gameStore";

export function CodeRunnerMVP() {
  const {
    stageState,
    completionMs,
    feedback,
    retry,
    selectedStageId,
    stage,
    stageProgress,
    continueToNextStage,
    bonusRun,
  } = useGameStore();

  const progressKey = bonusRun?.instance.id ?? selectedStageId;
  const progressEntry = stageProgress[progressKey];
  const stars = progressEntry?.stars ?? (stageState === "passed" ? 1 : 0);

  const showContinueStage1 =
    !bonusRun &&
    stageState === "passed" &&
    selectedStageId === "stage1" &&
    stage.id === "stage1";

  return (
    <main className="h-screen w-full bg-[radial-gradient(circle_at_top,_#082f49_0%,_#020617_50%,_#01030a_100%)] p-3 text-slate-100">
      <div className="grid h-full grid-cols-1 gap-3 xl:grid-cols-[42%_58%]">
        <section className="relative min-h-0 overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950/70 backdrop-blur">
          <LeftPanel />
        </section>

        <section className="relative min-h-0 overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950/40">
          <GameCanvas />
          <GameHUD />

          <AnimatePresence>
            {(stageState === "passed" || stageState === "failed") && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 grid place-items-center bg-slate-950/60 backdrop-blur-sm"
              >
                <div className="w-[340px] rounded-xl border border-slate-600 bg-slate-900/95 p-6 text-center">
                  {stageState === "passed" ? (
                    <CheckCircle2 className="mx-auto text-emerald-400" size={36} />
                  ) : (
                    <AlertTriangle className="mx-auto text-rose-400" size={36} />
                  )}
                  <h2 className="mt-3 text-xl font-semibold">
                    {stageState === "passed" ? "Stage Complete" : "Run Failed"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">{feedback.message}</p>
                  {stageState === "passed" && (
                    <p className="mt-1 text-xs text-cyan-300">
                      Time: {((completionMs ?? 0) / 1000).toFixed(2)}s
                    </p>
                  )}
                  {stageState === "passed" && (
                    <p className="mt-2 text-base text-amber-300">{`${"★".repeat(stars)}${"☆".repeat(3 - stars)}`}</p>
                  )}
                  <button
                    type="button"
                    onClick={retry}
                    className="mt-5 w-full rounded-md bg-cyan-400/90 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Retry Stage
                  </button>
                  {showContinueStage1 && (
                    <button
                      type="button"
                      onClick={continueToNextStage}
                      className="mt-2 w-full rounded-md border border-cyan-400/60 bg-slate-800 px-4 py-2 font-semibold text-cyan-200 transition hover:bg-slate-700"
                    >
                      Continue to Stage 2
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
