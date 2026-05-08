import type { CarConfig } from "../../types/game";

export type StageFieldKey = keyof CarConfig;

export type StageValidationIssue = {
  field?: StageFieldKey | "logic";
  message: string;
  hint: string;
};

type StageConfigBase = {
  id: "stage1" | "stage2";
  title: string;
  objective: string;
  hints: string[];
  starterValues: CarConfig;
  trackLength: number;
  laneHalfWidth: number;
  boostPads: Array<{ z: number; x: number; width: number; depth: number }>;
  timeLimitMs: number;
};

export type SpeedGateStageConfig = StageConfigBase & {
  kind: "speedGate";
  editableFields: StageFieldKey[];
  gateZ: number;
  gateWidth: number;
  requiredGateSpeed: number;
  validateConfig: (config: CarConfig) => StageValidationIssue[];
};

export type JumpLogicStageConfig = StageConfigBase & {
  kind: "jumpLogic";
  scaffold: {
    template: string;
  };
  barrier: {
    z: number;
    width: number;
    height: number;
    depth: number;
    clearanceY: number;
  };
  finishZ: number;
  validateLogic: (blanks: { inputProp: string; action: string }) => StageValidationIssue[];
};

export type StageConfig = SpeedGateStageConfig | JumpLogicStageConfig;
