import type { BlankMap, BonusRunState } from "../bonusStages/types";
import type { StageState } from "../types/game";

export type BonusEvalResult = { fail?: string; pass?: boolean };

export function getBonusBoostPads(bonusRun: BonusRunState | null, mainPads: Array<{ z: number; x: number; width: number; depth: number }>) {
  if (!bonusRun) return mainPads;
  const L = bonusRun.template.layout;
  if (L.kind === "forLoops") return L.data.pads;
  return [];
}

export function bonusLaneHalf(bonusRun: BonusRunState | null, mainHalf: number) {
  if (!bonusRun) return mainHalf;
  return bonusRun.template.layout.data.laneHalfWidth;
}

/** Narrow-obstacle brake tuning when the learner bound `brake`. */
export function bonusNarrowSpeedDamping(
  bonusRun: BonusRunState | null,
  blanks: BlankMap | null,
  nextX: number,
  nextZ: number,
) {
  if (!bonusRun || !blanks) return 1;
  if (bonusRun.template.layout.kind !== "conditionals") return 1;
  const obs = bonusRun.template.layout.data.obstacles.find((o) => o.type === "narrow");
  if (!obs) return 1;
  const norm = (s: string) => (s ?? "").trim().toLowerCase();
  if (!norm(blanks.actionNarrow).includes("brake")) return 1;
  const inZ = nextZ <= obs.z + obs.depth * 0.55 && nextZ >= obs.z - obs.depth * 0.55;
  const inX = Math.abs(nextX) <= obs.width * 0.55;
  return inZ && inX ? 0.88 : 1;
}

export function bonusArraysMaybeAdvance(
  prevZ: number,
  nextZ: number,
  nextX: number,
  checkpoints: Array<{ z: number; laneX: number }>,
  idxRef: { current: number },
) {
  const idx = idxRef.current;
  if (idx >= checkpoints.length) return;
  const cp = checkpoints[idx];
  const crossed = prevZ > cp.z + 0.15 && nextZ <= cp.z + 0.35;
  if (crossed && Math.abs(nextX - cp.laneX) < 1.95) idxRef.current += 1;
}

export function spaceJumpAllowedForBonus(
  bonusRun: BonusRunState | null,
  blanks: BlankMap | null,
  mainJump: boolean,
): boolean {
  if (mainJump) return true;
  if (!bonusRun || !blanks) return false;
  const norm = (s: string) => (s ?? "").trim().toLowerCase().replace(/\(\)/g, "");
  if (bonusRun.template.topicId === "conditionals") {
    return norm(blanks.actionHigh).includes("jump");
  }
  if (bonusRun.template.topicId === "functions") {
    return norm(blanks.evadeCall0).includes("jump");
  }
  return false;
}

export function evaluateBonusFrame(opts: {
  bonusRun: BonusRunState;
  blanks: BlankMap;
  nextX: number;
  nextZ: number;
  nextY: number;
  speed: number;
  stageState: StageState;
  passedRef: { current: boolean };
  arraysIdxRef: { current: number };
  variablesGateCheckedRef: { current: boolean };
}): BonusEvalResult | null {
  const {
    bonusRun,
    blanks,
    nextX,
    nextZ,
    nextY,
    speed,
    stageState,
    passedRef,
    arraysIdxRef,
    variablesGateCheckedRef,
  } = opts;
  if (stageState === "failed" || stageState === "passed") return null;
  const layout = bonusRun.template.layout;

  if (layout.kind === "forLoops") {
    const { finishZ } = layout.data;
    if (!passedRef.current && nextZ <= finishZ) {
      passedRef.current = true;
      return { pass: true };
    }
    return null;
  }

  if (layout.kind === "arrays") {
    const { checkpoints, finishZ } = layout.data;
    if (!passedRef.current && nextZ <= finishZ) {
      if (arraysIdxRef.current < checkpoints.length) {
        return { fail: "Missed an array gate — line up each colored checkpoint." };
      }
      passedRef.current = true;
      return { pass: true };
    }
    return null;
  }

  if (layout.kind === "variables") {
    const { hazardZ, hazardWidth, finishZ, gateZ, requiredGateSpeed } = layout.data;
    const inHazard =
      nextZ <= hazardZ + 1.1 &&
      nextZ >= hazardZ - 2.8 &&
      Math.abs(nextX) < hazardWidth * 0.5 &&
      nextY < 1.05;
    if (inHazard) return { fail: "Hit the hazard — retune your variables." };

    if (!variablesGateCheckedRef.current && nextZ <= gateZ + 0.45) {
      if (Math.abs(nextX) > 1.5) return { fail: "Missed the cruise gate lane." };
      if (speed < requiredGateSpeed) {
        return { fail: `Need speed ≥ ${requiredGateSpeed} through the gate.` };
      }
      variablesGateCheckedRef.current = true;
    }

    if (!passedRef.current && nextZ <= finishZ) {
      passedRef.current = true;
      return { pass: true };
    }
    return null;
  }

  if (layout.kind === "functions") {
    const { sections, finishZ } = layout.data;
    for (const sec of sections) {
      const clipped =
        nextZ <= sec.z + 1.1 &&
        nextZ >= sec.z - 1.35 &&
        Math.abs(nextX) <= sec.barrierWidth * 0.5 &&
        nextY < sec.barrierClearY;
      if (clipped) return { fail: "Barrier clipped — jump then boost inside evadeObstacle()." };
    }
    if (!passedRef.current && nextZ <= finishZ) {
      passedRef.current = true;
      return { pass: true };
    }
    return null;
  }

  if (layout.kind === "conditionals") {
    const { obstacles, finishZ } = layout.data;
    const highObs = obstacles.find((o) => o.type === "high");
    if (highObs) {
      const norm = (s: string) => (s ?? "").trim().toLowerCase().replace(/\(\)/g, "");
      const wantsJump = norm(blanks.actionHigh).includes("jump");
      const inHigh =
        nextZ <= highObs.z + highObs.depth * 0.55 &&
        nextZ >= highObs.z - highObs.depth * 0.55 &&
        Math.abs(nextX) <= highObs.width * 0.5;
      if (inHigh && wantsJump && nextY < highObs.height - 0.2) {
        return { fail: "HIGH obstacle needs a stronger jump arc." };
      }
    }
    const normN = (s: string) => (s ?? "").trim().toLowerCase().replace(/\(\)/g, "");
    for (const obs of obstacles) {
      if (obs.type !== "narrow") continue;
      const wantsBrake = normN(blanks.actionNarrow).includes("brake");
      const inNarrow =
        nextZ <= obs.z + obs.depth * 0.55 &&
        nextZ >= obs.z - obs.depth * 0.55 &&
        Math.abs(nextX) <= obs.width * 0.55;
      if (inNarrow && wantsBrake && speed > 4.35) {
        return { fail: "NARROW sector still too fast — brake harder." };
      }
    }
    if (!passedRef.current && nextZ <= finishZ) {
      passedRef.current = true;
      return { pass: true };
    }
    return null;
  }

  return null;
}
