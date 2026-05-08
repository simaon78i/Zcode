import type { CarConfig } from "../types/game";

export const STAGE_ID = "speed-gate";
export const SPEED_GATE_Z = -58;
export const SPEED_GATE_WIDTH = 5;
export const REQUIRED_GATE_SPEED = 7;

export const STAGE_INSTRUCTIONS = [
  "Upgrade the car settings to pass the speed gate.",
  "Only numeric values can be changed in this level.",
  `The gate requires speed above ${REQUIRED_GATE_SPEED}.`,
  "Tip: use the glowing boost pad before the gate.",
];

export const DEFAULT_CAR_CONFIG: CarConfig = {
  maxSpeed: 5,
  turnSpeed: 2,
  acceleration: 1,
};
