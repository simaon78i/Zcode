import type { StageConfig, StageValidationIssue } from "./types";
import type { CarConfig } from "../../types/game";

const validate = (config: CarConfig): StageValidationIssue[] => {
  const issues: StageValidationIssue[] = [];
  if (config.maxSpeed <= 7) {
    issues.push({
      field: "maxSpeed",
      message: "Your maxSpeed is too low for this gate.",
      hint: "Try increasing maxSpeed above 7.",
    });
  }
  if (config.maxSpeed < 3 || config.maxSpeed > 15) {
    issues.push({
      field: "maxSpeed",
      message: "maxSpeed is out of safe range.",
      hint: "Use a value between 3 and 15.",
    });
  }
  if (config.turnSpeed < 0.5 || config.turnSpeed > 6) {
    issues.push({
      field: "turnSpeed",
      message: "turnSpeed is out of safe range.",
      hint: "Use a value between 0.5 and 6.",
    });
  }
  if (config.acceleration < 0.5 || config.acceleration > 5) {
    issues.push({
      field: "acceleration",
      message: "acceleration is out of safe range.",
      hint: "Use a value between 0.5 and 5.",
    });
  }
  return issues;
};

export const stage1Config: StageConfig = {
  id: "stage1",
  kind: "speedGate",
  title: "Stage 1 - Speed Gate",
  objective: "Increase speed and clear the first gate.",
  hints: [
    "Only numeric blanks are editable.",
    "You must raise maxSpeed to clear the gate.",
    "Use the boost pad before the gate.",
  ],
  starterValues: {
    maxSpeed: 5,
    turnSpeed: 2,
    acceleration: 1,
  },
  editableFields: ["maxSpeed", "turnSpeed", "acceleration"],
  gateZ: -58,
  gateWidth: 5,
  requiredGateSpeed: 7,
  trackLength: 90,
  laneHalfWidth: 6,
  boostPads: [{ z: -40, x: 0, width: 6, depth: 3 }],
  timeLimitMs: 45000,
  validateConfig: validate,
};
