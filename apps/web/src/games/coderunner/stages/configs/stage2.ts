import type { JumpLogicStageConfig, StageValidationIssue } from "./types";

const validateLogic = (blanks: { inputProp: string; action: string }): StageValidationIssue[] => {
  const issues: StageValidationIssue[] = [];
  if (blanks.inputProp.trim() !== "key") {
    issues.push({
      field: "logic",
      message: "Your condition is checking the wrong input property.",
      hint: 'Hint: Which input property stores the pressed key? Try "key".',
    });
  }
  if (blanks.action.trim() !== "jump") {
    issues.push({
      field: "logic",
      message: "Your action doesn't tell the car to jump.",
      hint: 'Hint: What action should the car perform? Try "jump".',
    });
  }
  return issues;
};

export const stage2Config: JumpLogicStageConfig = {
  id: "stage2",
  kind: "jumpLogic",
  title: "Stage 2 - Jump Logic",
  objective: "Teach the computer what to do when SPACE is pressed.",
  hints: [
    "Drive toward the barrier and press SPACE. Nothing happens… yet.",
    "The car can only jump if you define the logic in code.",
    'Complete the IF statement: if (input.key === "Space") { car.jump() }',
  ],
  starterValues: {
    maxSpeed: 7,
    turnSpeed: 2.2,
    acceleration: 1.3,
  },
  trackLength: 120,
  laneHalfWidth: 6.5,
  boostPads: [{ z: -30, x: 0, width: 5.2, depth: 2.8 }],
  timeLimitMs: 40000,
  scaffold: {
    template: `// Define what happens when SPACE is pressed

if (input._____ === "Space") {
  car._____()
}`,
  },
  barrier: {
    z: -62,
    width: 6.2,
    height: 2.2,
    depth: 1.4,
    clearanceY: 1.25,
  },
  finishZ: -86,
  validateLogic,
};
