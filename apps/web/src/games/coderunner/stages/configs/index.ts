import { stage1Config } from "./stage1";
import { stage2Config } from "./stage2";
import type { StageConfig } from "./types";

export const STAGES: StageConfig[] = [stage1Config, stage2Config];

export const STAGE_MAP: Record<string, StageConfig> = STAGES.reduce(
  (acc, stage) => {
    acc[stage.id] = stage;
    return acc;
  },
  {} as Record<string, StageConfig>,
);
