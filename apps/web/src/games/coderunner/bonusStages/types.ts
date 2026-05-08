import type { CarConfig } from "../types/game";

export type BonusTopicId = "forLoops" | "arrays" | "variables" | "functions" | "conditionals";

export type BonusValidationIssue = { message: string; hint: string };

export type BonusStageInstance = {
  id: string;
  displayName: string;
  topicId: BonusTopicId;
};

export type BonusTrackLayout = {
  trackLength: number;
  laneHalfWidth: number;
  timeLimitMs: number;
  starterValues: CarConfig;
};

export type BonusForLoopsLayout = BonusTrackLayout & {
  pads: Array<{ z: number; x: number; width: number; depth: number }>;
  finishZ: number;
};

export type BonusArraysLayout = BonusTrackLayout & {
  finishZ: number;
  checkpoints: Array<{ z: number; laneX: number; colorName: "red" | "blue" | "green" }>;
};

export type BonusVariablesLayout = BonusTrackLayout & {
  hazardZ: number;
  hazardWidth: number;
  finishZ: number;
  gateZ: number;
  requiredGateSpeed: number;
};

export type BonusFunctionsLayout = BonusTrackLayout & {
  sections: Array<{ z: number; barrierWidth: number; barrierClearY: number }>;
  finishZ: number;
};

export type BonusConditionalsLayout = BonusTrackLayout & {
  obstacles: Array<{
    z: number;
    type: "high" | "narrow";
    width: number;
    height: number;
    depth: number;
  }>;
  finishZ: number;
};

export type BonusTemplate = {
  topicId: BonusTopicId;
  topicLabel: string;
  objective: string;
  hints: string[];
  starterCodePreview: string;
  layout:
    | { kind: "forLoops"; data: BonusForLoopsLayout }
    | { kind: "arrays"; data: BonusArraysLayout }
    | { kind: "variables"; data: BonusVariablesLayout }
    | { kind: "functions"; data: BonusFunctionsLayout }
    | { kind: "conditionals"; data: BonusConditionalsLayout };
};

export type BlankMap = Record<string, string>;

export type BonusBlankField = {
  key: string;
  label?: string;
  inputMode?: "text" | "decimal";
};

export type BonusTemplateRuntime = BonusTemplate & {
  validateBlanks: (blanks: BlankMap) => BonusValidationIssue[];
  blankFields: BonusBlankField[];
};

export type BonusRunState = {
  instance: BonusStageInstance;
  template: BonusTemplateRuntime;
};
