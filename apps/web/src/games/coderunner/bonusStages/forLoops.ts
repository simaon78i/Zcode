import type { BlankMap, BonusTemplateRuntime, BonusValidationIssue } from "./types";

const pads = [-22, -30, -38, -46, -54].map((z) => ({ z, x: 0, width: 4, depth: 2 }));

function validate(blanks: BlankMap): BonusValidationIssue[] {
  const issues: BonusValidationIssue[] = [];
  const count = blanks.count?.trim();
  const action = blanks.action?.trim()?.toLowerCase().replace(/\(\)/g, "");
  if (count !== "5") {
    issues.push({
      message: "Loop count is wrong.",
      hint: "Five boost pads line the track — use i < 5.",
    });
  }
  if (action !== "boost") {
    issues.push({ message: "Loop body should call boost each time.", hint: "Use boost in the loop body." });
  }
  return issues;
}

export const forLoopsTemplate: BonusTemplateRuntime = {
  topicId: "forLoops",
  topicLabel: "FOR LOOPS",
  objective: "Automate boosts across the pad sequence — you cannot tap fast enough alone.",
  hints: ["Count the pads.", "for (let i = 0; i < ?; i++) { car.?() }"],
  starterCodePreview: `for (let i = 0; i < _____; i++) {
  car._____()
}`,
  blankFields: [
    { key: "count", label: "loop count", inputMode: "decimal" },
    { key: "action", label: "car action" },
  ],
  layout: {
    kind: "forLoops",
    data: {
      trackLength: 85,
      laneHalfWidth: 6,
      timeLimitMs: 35000,
      starterValues: { maxSpeed: 7, turnSpeed: 2.4, acceleration: 1.4 },
      pads,
      finishZ: -72,
    },
  },
  validateBlanks: validate,
};
