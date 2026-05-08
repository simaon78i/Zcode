import { REQUIRED_GATE_SPEED } from "../stages/speedGateStage";
import type { CarConfig } from "../types/game";

export function validateCarConfig(config: CarConfig): string[] {
  const errors: string[] = [];

  if (config.maxSpeed < 3 || config.maxSpeed > 15) {
    errors.push("maxSpeed must be between 3 and 15.");
  }
  if (config.turnSpeed < 0.5 || config.turnSpeed > 6) {
    errors.push("turnSpeed must be between 0.5 and 6.");
  }
  if (config.acceleration < 0.5 || config.acceleration > 5) {
    errors.push("acceleration must be between 0.5 and 5.");
  }
  if (config.maxSpeed <= REQUIRED_GATE_SPEED) {
    errors.push(`For this stage, maxSpeed must be greater than ${REQUIRED_GATE_SPEED}.`);
  }

  return errors;
}
