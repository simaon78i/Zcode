import type { BlankMap, BonusTemplateRuntime, BonusValidationIssue } from "./types";

function validate(blanks: BlankMap): BonusValidationIssue[] {
  const issues: BonusValidationIssue[] = [];
  const normalize = (raw?: string) => raw?.replace(/"/g, "").trim().toLowerCase() ?? "";
  const a = normalize(blanks.gate0);
  const b = normalize(blanks.gate1);
  const c = normalize(blanks.gate2);
  if (a !== "red" || b !== "blue" || c !== "green") {
    issues.push({
      message: "Gate order must be red → blue → green.",
      hint: 'Use "red", "blue", "green" in that order.',
    });
  }
  return issues;
}

export const arraysTemplate: BonusTemplateRuntime = {
  topicId: "arrays",
  topicLabel: "ARRAYS",
  objective: "Store gate order red → blue → green so the route checker can follow.",
  hints: ["const gateOrder = [?, ?, ?]"],
  starterCodePreview: `const gateOrder = [_____, _____, _____]`,
  blankFields: [
    { key: "gate0", label: "gate 1" },
    { key: "gate1", label: "gate 2" },
    { key: "gate2", label: "gate 3" },
  ],
  layout: {
    kind: "arrays",
    data: {
      trackLength: 100,
      laneHalfWidth: 6.2,
      timeLimitMs: 40000,
      starterValues: { maxSpeed: 7.2, turnSpeed: 2.3, acceleration: 1.35 },
      finishZ: -88,
      checkpoints: [
        { z: -28, laneX: -2.2, colorName: "red" },
        { z: -48, laneX: 0, colorName: "blue" },
        { z: -68, laneX: 2.2, colorName: "green" },
      ],
    },
  },
  validateBlanks: validate,
};
