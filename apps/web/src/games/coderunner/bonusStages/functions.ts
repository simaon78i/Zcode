import type { BlankMap, BonusTemplateRuntime, BonusValidationIssue } from "./types";

function validate(blanks: BlankMap): BonusValidationIssue[] {
  const issues: BonusValidationIssue[] = [];
  const norm = (s: string | undefined) =>
    (s ?? "")
      .trim()
      .toLowerCase()
      .replace(/\(\)$/, "")
      .replace(/\(\)/g, "");
  const a = norm(blanks.evadeCall0);
  const b = norm(blanks.evadeCall1);
  if (!a.includes("jump")) {
    issues.push({ message: "First line should jump.", hint: "Try jump or jump()." });
  }
  if (!b.includes("boost")) {
    issues.push({ message: "Second line should boost.", hint: "Try boost or boost()." });
  }
  return issues;
}

export const functionsTemplate: BonusTemplateRuntime = {
  topicId: "functions",
  topicLabel: "FUNCTIONS",
  objective: "Package jump + boost once — the track repeats the same hazard rhythm.",
  hints: ["function evadeObstacle() { car._____; car._____; }"],
  starterCodePreview: `function evadeObstacle() {
  car._____
  car._____
}`,
  blankFields: [
    { key: "evadeCall0", label: "first call" },
    { key: "evadeCall1", label: "second call" },
  ],
  layout: {
    kind: "functions",
    data: {
      trackLength: 115,
      laneHalfWidth: 6.2,
      timeLimitMs: 42000,
      starterValues: { maxSpeed: 7.2, turnSpeed: 2.35, acceleration: 1.45 },
      sections: [
        { z: -46, barrierWidth: 5.8, barrierClearY: 1.15 },
        { z: -72, barrierWidth: 5.8, barrierClearY: 1.15 },
      ],
      finishZ: -98,
    },
  },
  validateBlanks: validate,
};
