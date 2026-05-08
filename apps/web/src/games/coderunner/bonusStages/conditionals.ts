import type { BlankMap, BonusTemplateRuntime, BonusValidationIssue } from "./types";

function validate(blanks: BlankMap): BonusValidationIssue[] {
  const issues: BonusValidationIssue[] = [];
  const th = blanks.typeHigh?.trim().toLowerCase();
  const ah = blanks.actionHigh?.trim().toLowerCase().replace(/\(\)/g, "");
  const tn = blanks.typeNarrow?.trim().toLowerCase();
  const an = blanks.actionNarrow?.trim().toLowerCase().replace(/\(\)/g, "");
  if (th !== "high") issues.push({ message: "HIGH branch needs obstacle.type check.", hint: 'Use "high".' });
  if (ah !== "jump") issues.push({ message: "HIGH branch should jump.", hint: "Use jump." });
  if (tn !== "narrow") issues.push({ message: "NARROW branch needs type check.", hint: 'Use "narrow".' });
  if (!an.includes("brake")) issues.push({ message: "NARROW branch should brake.", hint: "Use brake." });
  return issues;
}

export const conditionalsTemplate: BonusTemplateRuntime = {
  topicId: "conditionals",
  topicLabel: "CONDITIONALS",
  objective: "Branch on obstacle type: jump when high, brake when narrow.",
  hints: ["if (obstacle.type === ?) car.?()", "Second IF for narrow + brake."],
  starterCodePreview: `if (obstacle.type === _____) {
  car._____()
}
if (obstacle.type === _____) {
  car._____()
}`,
  blankFields: [
    { key: "typeHigh", label: "HIGH type" },
    { key: "actionHigh", label: "HIGH action" },
    { key: "typeNarrow", label: "NARROW type" },
    { key: "actionNarrow", label: "NARROW action" },
  ],
  layout: {
    kind: "conditionals",
    data: {
      trackLength: 105,
      laneHalfWidth: 6.1,
      timeLimitMs: 40000,
      starterValues: { maxSpeed: 7.4, turnSpeed: 2.4, acceleration: 1.4 },
      obstacles: [
        { z: -38, type: "high", width: 5.5, height: 2.1, depth: 1.2 },
        { z: -62, type: "narrow", width: 2.2, height: 0.6, depth: 1.4 },
      ],
      finishZ: -88,
    },
  },
  validateBlanks: validate,
};
