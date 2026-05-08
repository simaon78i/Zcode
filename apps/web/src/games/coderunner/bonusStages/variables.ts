import type { BlankMap, BonusTemplateRuntime, BonusValidationIssue } from "./types";

function validate(blanks: BlankMap): BonusValidationIssue[] {
  const issues: BonusValidationIssue[] = [];
  const maxSpeed = Number(blanks.maxSpeed);
  const turnSpeed = Number(blanks.turnSpeed);
  const acceleration = Number(blanks.acceleration);
  if (Number.isNaN(maxSpeed) || maxSpeed < 6.5 || maxSpeed > 11.5) {
    issues.push({
      message: "maxSpeed needs a balanced value.",
      hint: "Try maxSpeed around 8–10 to clear the gate without hitting the hazard.",
    });
  }
  if (Number.isNaN(turnSpeed) || turnSpeed < 1.8 || turnSpeed > 3.2) {
    issues.push({ message: "turnSpeed out of workable range.", hint: "Try ~2.2–2.6." });
  }
  if (Number.isNaN(acceleration) || acceleration < 1 || acceleration > 2.2) {
    issues.push({ message: "acceleration out of workable range.", hint: "Try ~1.3–1.6." });
  }
  return issues;
}

export const variablesTemplate: BonusTemplateRuntime = {
  topicId: "variables",
  topicLabel: "VARIABLES",
  objective: "Tune maxSpeed / turn / acceleration to survive the squeeze then clear the gate.",
  hints: ["Too fast hits the hazard block.", "Too slow misses the cruise gate."],
  starterCodePreview: `car.maxSpeed = _____
car.turnSpeed = _____
car.acceleration = _____`,
  blankFields: [
    { key: "maxSpeed", label: "car.maxSpeed", inputMode: "decimal" },
    { key: "turnSpeed", label: "car.turnSpeed", inputMode: "decimal" },
    { key: "acceleration", label: "car.acceleration", inputMode: "decimal" },
  ],
  layout: {
    kind: "variables",
    data: {
      trackLength: 95,
      laneHalfWidth: 6,
      timeLimitMs: 38000,
      starterValues: { maxSpeed: 9.5, turnSpeed: 2.85, acceleration: 1.1 },
      hazardZ: -32,
      hazardWidth: 4.2,
      finishZ: -78,
      gateZ: -58,
      requiredGateSpeed: 6.8,
    },
  },
  validateBlanks: validate,
};
