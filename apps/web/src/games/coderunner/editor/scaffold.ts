import type { CarConfig } from "../types/game";
import type { StageConfig } from "../stages/configs/types";

export const ORDERED_KEYS: Array<keyof CarConfig> = ["maxSpeed", "turnSpeed", "acceleration"];

export type BlankValues = Record<keyof CarConfig, string>;

export function stageStarterCode(): string {
  return ORDERED_KEYS.map((key) => `car.${key} = _____`).join("\n");
}

export function createBlankValues(stage: StageConfig): BlankValues {
  return {
    maxSpeed: String(stage.starterValues.maxSpeed),
    turnSpeed: String(stage.starterValues.turnSpeed),
    acceleration: String(stage.starterValues.acceleration),
  };
}

export function parseBlankValues(values: BlankValues): { config: CarConfig | null; errors: string[] } {
  const errors: string[] = [];
  const numeric = {} as CarConfig;

  ORDERED_KEYS.forEach((key) => {
    const raw = values[key]?.trim();
    if (!raw) {
      errors.push(`${key} is empty.`);
      return;
    }
    if (!/^\d+(\.\d+)?$/.test(raw)) {
      errors.push(`${key} must be a number.`);
      return;
    }
    numeric[key] = Number(raw);
  });

  return {
    config: errors.length ? null : numeric,
    errors,
  };
}
