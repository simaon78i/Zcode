import { create } from "zustand";
import { getBonusTemplate } from "../bonusStages";
import type { BlankMap, BonusRunState, BonusStageInstance, BonusTopicId } from "../bonusStages/types";
import { STAGE_MAP } from "../stages/configs";
import type { StageConfig } from "../stages/configs/types";
import type { CarConfig, CarTelemetry, GameFeedback, StageId, StageState } from "../types/game";

type StageProgress = {
  bestMs: number | null;
  stars: number;
  completed: boolean;
};

type GameStore = {
  unlockedMainIds: StageId[];
  stageProgress: Record<string, StageProgress>;
  selectedStageId: StageId;
  /** Active stage configuration (main stages only). */
  stage: StageConfig;

  teacherMode: boolean;
  tryUnlockTeacherMode: (code: string) => boolean;

  bonusInstances: BonusStageInstance[];
  addBonusStage: (displayName: string, topicId: BonusTopicId) => void;
  bonusRun: BonusRunState | null;
  selectBonusStage: (instanceId: string) => void;
  exitBonusStage: () => void;
  bonusBlanksApplied: BlankMap | null;
  applyBonusBlanks: (blanks: BlankMap) => void;

  carConfig: CarConfig;
  jumpLogicEnabled: boolean;
  jumpLogicBlanks: { inputProp: string; action: string };

  feedback: GameFeedback;
  stageState: StageState;
  telemetry: CarTelemetry;
  startedAtMs: number | null;
  completionMs: number | null;
  runId: number;
  boostUntilMs: number;
  boostPulse: number;

  selectStageFromMenu: (selectionKey: string) => void;
  selectMainStage: (id: StageId) => void;
  /** @deprecated Prefer selectStageFromMenu or selectMainStage */
  selectStage: (id: StageId | string) => void;
  /** @deprecated Prefer unlockedMainIds */
  unlockedStageIds: StageId[];

  setFeedback: (feedback: GameFeedback) => void;
  applyConfig: (config: CarConfig) => void;
  applyJumpLogic: (blanks: { inputProp: string; action: string }) => void;
  markStarted: () => void;
  markPassed: (completionMs: number) => void;
  markFailed: (reason: string) => void;
  setTelemetry: (telemetry: CarTelemetry) => void;
  triggerBoost: (durationMs: number) => void;
  consumeBoostPulse: () => void;
  continueToNextStage: () => void;
  retry: () => void;
};

const initialMain = STAGE_MAP.stage1;

export const useGameStore = create<GameStore>((set, get) => ({
  unlockedMainIds: ["stage1"],
  unlockedStageIds: ["stage1"],
  stageProgress: {
    stage1: { bestMs: null, stars: 0, completed: false },
    stage2: { bestMs: null, stars: 0, completed: false },
  },

  teacherMode: false,
  bonusInstances: [],
  bonusRun: null,
  bonusBlanksApplied: null,

  selectedStageId: "stage1",
  stage: initialMain,
  carConfig: initialMain.starterValues,
  jumpLogicEnabled: false,
  jumpLogicBlanks: { inputProp: "", action: "" },

  feedback: { kind: "info", message: "Set values in blanks, then click Submit." },
  stageState: "idle",
  telemetry: { x: 0, z: 10, speed: 0 },
  startedAtMs: null,
  completionMs: null,
  runId: 0,
  boostUntilMs: 0,
  boostPulse: 0,

  tryUnlockTeacherMode: (code) => {
    if (code.trim() !== "0000") return false;
    set({ teacherMode: true, feedback: { kind: "success", message: "Teacher mode unlocked locally." } });
    return true;
  },

  addBonusStage: (displayName, topicId) => {
    if (!get().teacherMode) return;
    const name = displayName.trim() || "Untitled bonus";
    const id = `bonus:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    const inst: BonusStageInstance = { id, displayName: name, topicId };
    set((s) => ({ bonusInstances: [...s.bonusInstances, inst] }));
    console.log("[STAGE_FLOW] addBonusStage registered", inst.id, inst.displayName, inst.topicId);
  },

  selectStageFromMenu: (selectionKey) => {
    const key = String(selectionKey ?? "").trim();
    console.log("[STAGE_FLOW] selectStageFromMenu CLICK_KEY", JSON.stringify(key));
    const state = get();
    if (key === "stage1" || key === "stage2") {
      if (!state.unlockedMainIds.includes(key)) {
        console.warn("[STAGE_FLOW] MAIN_LOCKED", key, "unlocked=", state.unlockedMainIds);
        return;
      }
      get().selectMainStage(key);
      console.log("[STAGE_FLOW] after main activate", {
        selectedStageId: get().selectedStageId,
        stageId: get().stage.id,
        bonusRun: get().bonusRun?.instance?.id ?? null,
      });
      return;
    }
    console.log("[STAGE_FLOW] routing as BONUS_INSTANCE", key);
    get().selectBonusStage(key);
    console.log("[STAGE_FLOW] after bonus dispatch", {
      bonusRunId: get().bonusRun?.instance?.id ?? null,
      bonusTopic: get().bonusRun?.template?.topicId ?? null,
      mainStagePinned: get().stage.id,
    });
  },

  selectBonusStage: (instanceId) => {
    console.log("[STAGE_FLOW] selectBonusStage ENTRY", JSON.stringify(instanceId));
    console.log("[STAGE_FLOW] selectBonusStage known instances", get().bonusInstances.map((b) => b.id));
    const inst = get().bonusInstances.find((b) => b.id === instanceId);
    if (!inst) {
      console.warn("[STAGE_FLOW] selectBonusStage NO_INSTANCE_MATCH", JSON.stringify(instanceId));
      return;
    }
    let template: ReturnType<typeof getBonusTemplate>;
    try {
      template = getBonusTemplate(inst.topicId);
      console.log("[STAGE_FLOW] selectBonusStage template OK", inst.topicId, template.layout.kind);
    } catch (e) {
      console.error("[STAGE_FLOW] getBonusTemplate THREW", e);
      return;
    }
    const state = get();
    console.log("[STAGE_FLOW] selectBonusStage APPLYING SET", inst.displayName, "runId", state.runId, "→", state.runId + 1);
    set({
      bonusRun: { instance: inst, template },
      bonusBlanksApplied: null,
      carConfig: template.layout.data.starterValues,
      stageState: "idle",
      startedAtMs: null,
      completionMs: null,
      runId: state.runId + 1,
      telemetry: { x: 0, z: 10, speed: 0 },
      boostUntilMs: 0,
      feedback: { kind: "info", message: `Bonus stage loaded — ${inst.displayName}.` },
    });
    const after = get();
    console.log("[STAGE_FLOW] selectBonusStage STORE_AFTER", {
      bonusRunId: after.bonusRun?.instance.id,
      runId: after.runId,
      stageState: after.stageState,
    });
  },

  exitBonusStage: () =>
    set((s) =>
      s.bonusRun
        ? {
            bonusRun: null,
            bonusBlanksApplied: null,
            stageState: "idle",
            startedAtMs: null,
            completionMs: null,
            runId: s.runId + 1,
            telemetry: { x: 0, z: 10, speed: 0 },
            boostUntilMs: 0,
            carConfig: s.stage.starterValues,
            feedback: { kind: "info", message: `Back to ${s.stage.title}.` },
          }
        : {},
    ),

  selectMainStage: (id) => {
    console.log("[STAGE_FLOW] selectMainStage ENTRY", id);
    const state = get();
    if (!state.unlockedMainIds.includes(id)) {
      console.warn("[STAGE_FLOW] selectMainStage BLOCKED locked", id);
      return;
    }
    const stageCfg = STAGE_MAP[id];
    set({
      selectedStageId: id,
      stage: stageCfg,
      bonusRun: null,
      bonusBlanksApplied: null,
      carConfig: stageCfg.starterValues,
      jumpLogicEnabled: false,
      jumpLogicBlanks: { inputProp: "", action: "" },
      stageState: "idle",
      startedAtMs: null,
      completionMs: null,
      runId: state.runId + 1,
      telemetry: { x: 0, z: 10, speed: 0 },
      boostUntilMs: 0,
      feedback: { kind: "info", message: `Loaded ${stageCfg.title}.` },
    });
    console.log("[STAGE_FLOW] selectMainStage DONE", id, "bonusRun cleared=", get().bonusRun === null);
  },

  selectStage: (key) => get().selectStageFromMenu(String(key)),

  setFeedback: (feedback) => set({ feedback }),
  applyConfig: (config) => set({ carConfig: config }),

  applyBonusBlanks: (raw) => {
    const state = get();
    const br = state.bonusRun;
    if (!br) return;
    const blanks = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, String(v ?? "").trim()]),
    ) as BlankMap;
    const issues = br.template.validateBlanks(blanks);
    if (issues.length) {
      set({
        feedback: { kind: "error", message: `${issues[0].message} ${issues[0].hint}` },
      });
      return;
    }
    if (br.template.topicId === "variables") {
      const nextCfg: CarConfig = {
        maxSpeed: Number(blanks.maxSpeed),
        turnSpeed: Number(blanks.turnSpeed),
        acceleration: Number(blanks.acceleration),
      };
      set({
        carConfig: nextCfg,
        bonusBlanksApplied: blanks,
        feedback: { kind: "success", message: "Bonus tuning applied — drive the hazard + gate." },
      });
      return;
    }
    set({
      bonusBlanksApplied: blanks,
      feedback: { kind: "success", message: "Bonus script applied — try the run." },
    });
  },

  applyJumpLogic: (blanks) =>
    set((state) => {
      const nextBlanks = {
        inputProp: blanks.inputProp.trim(),
        action: blanks.action.trim(),
      };
      const jumpStage = state.stage.kind === "jumpLogic";
      const needsSpawnReset =
        jumpStage && (state.stageState === "failed" || state.stageState === "passed");
      return {
        jumpLogicEnabled: true,
        jumpLogicBlanks: { ...nextBlanks },
        ...(needsSpawnReset
          ? {
              stageState: "idle" as const,
              startedAtMs: null,
              completionMs: null,
              telemetry: { x: 0, z: 10, speed: 0 },
              boostUntilMs: 0,
              runId: state.runId + 1,
            }
          : {}),
      };
    }),

  markStarted: () =>
    set((state) =>
      state.startedAtMs
        ? state
        : {
            stageState: "running",
            startedAtMs: performance.now(),
          },
    ),

  markPassed: (completionMs) => {
    const state = get();
    if (state.stageState === "passed") return;

    const br = state.bonusRun;
    const limit = br ? br.template.layout.data.timeLimitMs : state.stage.timeLimitMs;
    const stars = completionMs <= limit * 0.52 ? 3 : completionMs <= limit * 0.82 ? 2 : 1;

    const key = br ? br.instance.id : state.selectedStageId;
    const prev = state.stageProgress[key] ?? { bestMs: null, stars: 0, completed: false };
    const bestMs = prev.bestMs == null ? completionMs : Math.min(prev.bestMs, completionMs);

    const unlockStage2 = !br && state.stage.id === "stage1" && !state.unlockedMainIds.includes("stage2");

    const unlockedMainIds = (
      unlockStage2 ? [...state.unlockedMainIds, "stage2" as const] : state.unlockedMainIds
    ) as StageId[];

    const successCopy = br
      ? "BONUS STAGE COMPLETE."
      : state.stage.kind === "jumpLogic"
        ? "LOGIC EXECUTED — barrier cleared!"
        : "CONFIG APPLIED — objective complete.";

    set({
      stageState: "passed",
      completionMs,
      unlockedMainIds,
      unlockedStageIds: unlockedMainIds,
      stageProgress: {
        ...state.stageProgress,
        [key]: { completed: true, stars: Math.max(prev.stars, stars), bestMs },
      },
      feedback: { kind: "success", message: successCopy },
    });
  },

  markFailed: (reason) => {
    if (get().stageState === "passed") return;
    set({
      stageState: "failed",
      feedback: { kind: "error", message: reason },
    });
  },

  setTelemetry: (telemetry) => {
    const state = get();
    const limit = state.bonusRun ? state.bonusRun.template.layout.data.timeLimitMs : state.stage.timeLimitMs;
    if (state.stageState === "running" && state.startedAtMs) {
      const elapsed = performance.now() - state.startedAtMs;
      if (elapsed > limit) {
        set({
          stageState: "failed",
          feedback: { kind: "error", message: "Time limit reached for this run." },
        });
      }
    }
    set({ telemetry });
  },

  triggerBoost: (durationMs) =>
    set((s) => ({ boostUntilMs: performance.now() + durationMs, boostPulse: s.boostPulse + 1 })),
  consumeBoostPulse: () => set({ boostPulse: 0 }),

  continueToNextStage: () => {
    const state = get();
    if (state.bonusRun) return;
    if (state.stage.id !== "stage1") return;
    if (!state.unlockedMainIds.includes("stage2")) return;
    const stageCfg = STAGE_MAP.stage2;
    set({
      selectedStageId: "stage2",
      stage: stageCfg,
      carConfig: stageCfg.starterValues,
      jumpLogicEnabled: false,
      jumpLogicBlanks: { inputProp: "", action: "" },
      stageState: "idle",
      startedAtMs: null,
      completionMs: null,
      runId: state.runId + 1,
      telemetry: { x: 0, z: 10, speed: 0 },
      boostUntilMs: 0,
      feedback: { kind: "info", message: "Stage 2: Jump Logic — try SPACE, then define the IF." },
    });
  },

  retry: () =>
    set((state) => {
      if (state.bonusRun) {
        const applied = !!state.bonusBlanksApplied;
        return {
          stageState: "idle",
          startedAtMs: null,
          completionMs: null,
          telemetry: { x: 0, z: 10, speed: 0 },
          boostUntilMs: 0,
          runId: state.runId + 1,
          bonusBlanksApplied: state.bonusBlanksApplied,
          feedback: {
            kind: "info",
            message: applied ? "Run reset — bonus script stays active." : "Run reset — submit bonus blanks to validate.",
          },
        };
      }
      const isJumpMain = state.stage.kind === "jumpLogic";
      return {
        stageState: "idle",
        startedAtMs: null,
        completionMs: null,
        telemetry: { x: 0, z: 10, speed: 0 },
        boostUntilMs: 0,
        jumpLogicEnabled: isJumpMain ? state.jumpLogicEnabled : false,
        runId: state.runId + 1,
        feedback: {
          kind: "info",
          message: isJumpMain
            ? state.jumpLogicEnabled
              ? "Run reset — IF bindings stay active."
              : "Run reset — SPACE idle until logic is authored."
            : "Run reset — adjust tuning and retry.",
        },
      };
    }),
}));
