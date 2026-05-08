import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import { Info, Lock, Play, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { JumpLogicSnippet } from "../editor/JumpLogicSnippet";
import { createBlankValues, parseBlankValues, stageStarterCode, type BlankValues } from "../editor/scaffold";
import { STAGES, STAGE_MAP } from "../stages/configs";
import type { BlankMap } from "../bonusStages/types";
import { useGameStore } from "../store/gameStore";
import { TeacherBonusModal } from "./TeacherBonusModal";

export function LeftPanel() {
  const {
    stage,
    selectedStageId,
    unlockedMainIds,
    stageProgress,
    carConfig,
    applyConfig,
    applyJumpLogic,
    applyBonusBlanks,
    feedback,
    setFeedback,
    retry,
    stageState,
    jumpLogicEnabled,
    teacherMode,
    bonusInstances,
    bonusRun,
    exitBonusStage,
    addBonusStage,
    bonusBlanksApplied,
  } = useGameStore();

  const [blanks, setBlanks] = useState<BlankValues>(() => createBlankValues(STAGE_MAP.stage1));
  const [logicBlanks, setLogicBlanks] = useState({ inputProp: "", action: "" });
  const [bonusDraft, setBonusDraft] = useState<BlankMap>({});
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);

  useEffect(() => {
    const br = bonusRun;
    console.log("[EDITOR_PANEL] bonusRun snapshot", br?.instance.id ?? null, br?.instance.displayName ?? null);
  }, [bonusRun?.instance?.id]);

  /** Reset IF/tuning blanks only when switching main stages (not on every store tick). */
  useEffect(() => {
    if (bonusRun) return;
    const cfg = STAGE_MAP[selectedStageId];
    setBlanks(createBlankValues(cfg));
    setLogicBlanks({ inputProp: "", action: "" });
  }, [selectedStageId, bonusRun]);

  useEffect(() => {
    if (!bonusRun) return;
    const init: BlankMap = {};
    for (const f of bonusRun.template.blankFields) {
      init[f.key] = "";
    }
    setBonusDraft(init);
  }, [bonusRun?.instance.id, bonusRun?.template.topicId]);

  const codePreview = useMemo(() => stageStarterCode(), []);

  const onSubmit = () => {
    if (bonusRun) {
      applyBonusBlanks(bonusDraft);
      return;
    }
    if (stage.kind === "jumpLogic") {
      const issues = stage.validateLogic(logicBlanks);
      if (issues.length) {
        setFeedback({ kind: "error", message: `${issues[0].message} ${issues[0].hint}` });
        return;
      }

      applyJumpLogic(logicBlanks);
      setLogicBlanks({
        inputProp: logicBlanks.inputProp.trim(),
        action: logicBlanks.action.trim(),
      });
      setFeedback({
        kind: "success",
        message:
          'LOGIC EXECUTED. You authored the SPACE branch: input.key === "Space" → car.jump().',
      });
      return;
    }

    const parsed = parseBlankValues(blanks);
    if (parsed.errors.length) {
      setFeedback({
        kind: "error",
        message: `${parsed.errors[0]} Keep structure locked — only tweak numeric blanks.`,
      });
      return;
    }
    const tuningIssues = stage.validateConfig(parsed.config!);
    if (tuningIssues.length) {
      setFeedback({ kind: "error", message: `${tuningIssues[0].message} ${tuningIssues[0].hint}` });
      return;
    }

    applyConfig(parsed.config!);
    setFeedback({ kind: "success", message: "CONFIG APPLIED — telemetry updated for the run." });
  };

  const activeTitle = bonusRun ? bonusRun.instance.displayName : stage.title;
  const activeObjective = bonusRun ? bonusRun.template.objective : stage.objective;
  const activeHints = bonusRun ? bonusRun.template.hints : stage.hints;
  const isJumpMain = !bonusRun && stage.kind === "jumpLogic";
  const bonusPreview = bonusRun?.template.starterCodePreview ?? "";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <TeacherBonusModal
        open={teacherModalOpen}
        onClose={() => setTeacherModalOpen(false)}
        onCreate={(displayName, topicId) => addBonusStage(displayName, topicId)}
      />
      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4">
        <div className="flex flex-col gap-4 pb-2">
          <div className="grid grid-cols-2 gap-2">
            {STAGES.map((entry) => {
              const unlocked = unlockedMainIds.includes(entry.id);
              const progress = stageProgress[entry.id];
              const active = !bonusRun && selectedStageId === entry.id;

              return (
                <button
                  key={entry.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => {
                    console.log("[UI] main stage TILE click", entry.id);
                    useGameStore.getState().selectStageFromMenu(entry.id);
                  }}
                  className={`rounded-xl border p-3 text-left transition ${
                    active ? "border-cyan-300 bg-cyan-500/15 shadow-neon" : "border-slate-700 bg-slate-900/80"
                  } ${unlocked ? "hover:border-cyan-500/60" : "opacity-60"}`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>{entry.title}</span>
                    {!unlocked ? (
                      <Lock size={13} />
                    ) : (progress?.stars ?? 0) > 0 ? (
                      <span>{"★".repeat(progress.stars)}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">{entry.objective}</p>
                </button>
              );
            })}
          </div>

          {teacherMode && (
            <div className="rounded-xl border border-amber-400/30 bg-amber-950/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/90">
                  Teacher
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="border border-amber-400/40 text-amber-100"
                  onClick={() => setTeacherModalOpen(true)}
                >
                  Create Bonus Stage…
                </Button>
              </div>
            </div>
          )}

          <div className="isolate space-y-2 rounded-xl border border-slate-700 bg-slate-900/85 p-3 ring-1 ring-black/50">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Bonus stages</p>
            {bonusInstances.length === 0 ? (
              <p className="text-xs text-slate-500">
                {teacherMode
                  ? "No bonus stages yet — create one from the teacher strip above."
                  : "Bonus stages appear here after a teacher creates them locally."}
              </p>
            ) : (
              <div className="relative z-10 flex flex-col gap-2">
                {bonusInstances.map((b) => {
                  const activeBonus = bonusRun?.instance.id === b.id;
                  const prog = stageProgress[b.id];
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        console.log("[UI] bonus card CLICK", b.id, b.displayName);
                        try {
                          useGameStore.getState().selectStageFromMenu(b.id);
                          console.log("[UI] bonus dispatch returned; store bonusRun=", useGameStore.getState().bonusRun?.instance.id ?? null);
                        } catch (err) {
                          console.error("[UI] bonus card handler THREW", err);
                        }
                      }}
                      className={`relative z-[1] cursor-pointer touch-manipulation rounded-lg border px-3 py-2 text-left text-xs transition ${
                        activeBonus
                          ? "border-cyan-400 bg-cyan-500/10 text-cyan-50"
                          : "border-slate-700 bg-slate-950/60 text-slate-200 hover:border-cyan-500/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{b.displayName}</span>
                        {(prog?.stars ?? 0) > 0 ? (
                          <span className="shrink-0 text-amber-200">{"★".repeat(prog!.stars)}</span>
                        ) : null}
                      </div>
                      <div className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                        Template • {b.topicId}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {bonusRun && (
              <Button type="button" variant="ghost" className="w-full text-slate-300" onClick={() => exitBonusStage()}>
                Exit bonus / return to main stage
              </Button>
            )}
          </div>

          <div className="rounded-xl border border-cyan-400/25 bg-slate-900/90 p-4 shadow-neon">
            <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-300">{activeTitle}</p>
            <p className="mt-2 text-sm text-slate-100">{activeObjective}</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              {activeHints.map((line) => (
                <li key={line}>- {line}</li>
              ))}
            </ul>
          </div>

          {bonusRun ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-xl border border-slate-700 bg-[#050814] p-3 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.06)]">
                <pre
                  className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-slate-200"
                  style={{ fontFamily: "\"JetBrains Mono\", ui-monospace, monospace", margin: 0 }}
                >
                  {bonusPreview}
                </pre>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {bonusRun.template.blankFields.map((field) => (
                  <label
                    key={field.key}
                    className="group flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm transition hover:border-cyan-500/60"
                  >
                    <span className="font-mono text-[11px] text-slate-400">
                      {field.label ?? field.key}
                    </span>
                    <input
                      value={bonusDraft[field.key] ?? ""}
                      onChange={(event) =>
                        setBonusDraft((prev) => ({
                          ...prev,
                          [field.key]: event.target.value,
                        }))
                      }
                      className="w-36 rounded border border-cyan-500/50 bg-slate-950 px-2 py-1 text-right font-mono font-semibold text-cyan-200 outline-none transition focus:border-cyan-300 focus:shadow-[0_0_10px_rgba(34,211,238,0.45)]"
                      placeholder="_____"
                      inputMode={field.inputMode === "decimal" ? "decimal" : "text"}
                    />
                  </label>
                ))}
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900/85 p-3 text-[11px] text-slate-400">
                Apply status:{" "}
                <span className={bonusBlanksApplied ? "font-semibold text-emerald-300" : "font-semibold text-rose-300"}>
                  {bonusBlanksApplied ? "BOUND" : "UNBOUND"}
                </span>
              </div>
            </div>
          ) : isJumpMain ? (
            <JumpLogicSnippet
              blanks={logicBlanks}
              onChange={(patch) => setLogicBlanks((p) => ({ ...p, ...patch }))}
              onRequestApply={onSubmit}
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
              <Editor
                height="140px"
                defaultLanguage="javascript"
                value={codePreview}
                theme="coderunner-dark"
                beforeMount={(monaco) => {
                  monaco.editor.defineTheme("coderunner-dark", {
                    base: "vs-dark",
                    inherit: true,
                    rules: [],
                    colors: {
                      "editor.background": "#020617",
                      "editor.lineHighlightBackground": "#0f172a",
                    },
                  });
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 15,
                  lineNumbers: "off",
                  readOnly: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 14 },
                  fontFamily: "\"JetBrains Mono\", monospace",
                }}
              />
            </div>
          )}

          {isJumpMain && (
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                className="h-12 w-full gap-2 text-base font-semibold shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                onClick={onSubmit}
              >
                <Play size={18} className="shrink-0" />
                Apply IF to game
              </Button>
              <p className="text-center text-[11px] leading-snug text-slate-400">
                Binds your blanks to the car. Press <span className="font-mono text-cyan-300">Enter</span> in either
                blank to apply.
              </p>
            </div>
          )}

          {isJumpMain && (
            <div className="rounded-lg border border-slate-700 bg-slate-900/85 p-3 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-semibold text-cyan-200">
                <Info size={14} /> Inline hints
              </div>
              <p className="mt-1">Question 1: Which input field stores literal keys?</p>
              <p className="text-slate-400">Question 2: Which car verb launches vertically?</p>
              <div className="mt-3 text-[11px] text-slate-500">
                Runtime status:&nbsp;
                <span className={jumpLogicEnabled ? "font-semibold text-emerald-300" : "font-semibold text-rose-300"}>
                  {jumpLogicEnabled ? "BOUND (SPACE routed)" : "UNBOUND"}
                </span>
              </div>
            </div>
          )}

          {!bonusRun && !isJumpMain && (
            <div className="grid grid-cols-1 gap-2">
              {(["maxSpeed", "turnSpeed", "acceleration"] as const).map((field) => (
                <label
                  key={field}
                  className="group flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm transition hover:border-cyan-500/60"
                >
                  <span className="font-mono text-slate-300">car.{field} =</span>
                  <input
                    value={blanks[field]}
                    onChange={(event) =>
                      setBlanks((prev) => ({
                        ...prev,
                        [field]: event.target.value,
                      }))
                    }
                    className="w-28 rounded border border-cyan-500/50 bg-slate-950 px-2 py-1 text-right font-mono font-semibold text-cyan-200 outline-none transition focus:border-cyan-300 focus:shadow-[0_0_10px_rgba(34,211,238,0.45)]"
                    placeholder="_____"
                    inputMode="decimal"
                  />
                </label>
              ))}
            </div>
          )}

          <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-cyan-300">
              <Info size={14} />
              Code explanation
            </div>
            <p className="mt-2 leading-relaxed">
              {bonusRun
                ? "Prototype bonus tracks ship with one frozen template per topic — learners still prove understanding through blanks."
                : stage.kind === "jumpLogic"
                  ? "Computers obey explicit branches. SPACE is meaningless until IF connects the event to action."
                  : "Tune the three numeric car levers until telemetry matches objective constraints."}
            </p>
          </div>

          <motion.div
            key={feedback.message}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg border p-3 text-sm ${
              feedback.kind === "error"
                ? "border-rose-500/50 bg-rose-950/35 text-rose-100"
                : feedback.kind === "success"
                  ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-100"
                  : "border-cyan-500/40 bg-slate-900 text-cyan-100"
            }`}
          >
            {feedback.message}
          </motion.div>

          <div className="flex gap-2">
            {bonusRun ? (
              <>
                <Button type="button" onClick={onSubmit} className="flex-1">
                  <Sparkles size={14} className="mr-2" />
                  Submit bonus
                </Button>
                <Button type="button" variant="ghost" onClick={retry}>
                  Retry
                </Button>
              </>
            ) : isJumpMain ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full border border-slate-600 text-slate-200"
                onClick={retry}
              >
                Reset car / Retry run
              </Button>
            ) : (
              <>
                <Button type="button" onClick={onSubmit} className="flex-1">
                  <Sparkles size={14} className="mr-2" />
                  Submit Code
                </Button>
                <Button type="button" variant="ghost" onClick={retry}>
                  Retry
                </Button>
              </>
            )}
          </div>
          <p className="text-center text-[11px] text-slate-500">
            {stageState === "passed"
              ? "Stage objective complete — Retry for stars or continue when available."
              : bonusRun
                ? "Submit applies validation locally — UNBOUND runs still move, but objectives stay locked."
                : stage.kind === "jumpLogic"
                  ? "Until you Apply IF, SPACE stays unbound and the status stays UNBOUND."
                  : "Tab-friendly blanks mimic IDE placeholders without exposing raw editors."}
          </p>

          <div className="rounded-lg border border-slate-700/70 bg-black/35 p-3 text-[10px] text-slate-500">
            <div className="flex justify-between text-slate-400">
              <span>telemetry.target</span>
              <span>
                vmax {carConfig.maxSpeed.toFixed(2)} • turn {carConfig.turnSpeed.toFixed(2)} • accel{" "}
                {carConfig.acceleration.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-20 flex shrink-0 justify-end border-t border-slate-800/80 bg-slate-950/40 px-3 py-2">
        <button
          type="button"
          className="h-6 w-6 shrink-0 cursor-pointer rounded-md border border-cyan-500/10 bg-cyan-500/[0.04] opacity-[0.14] transition hover:opacity-70"
          title="Teacher access"
          aria-label="Teacher access"
          onClick={() => {
            const code = window.prompt("Teacher code");
            if (code == null) return;
            console.log("[UI] teacher unlock attempt");
            useGameStore.getState().tryUnlockTeacherMode(code);
          }}
        />
      </div>
    </div>
  );
}
