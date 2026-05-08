export type CarConfig = {
  maxSpeed: number;
  turnSpeed: number;
  acceleration: number;
};

export type GameFeedback = {
  kind: "info" | "error" | "success";
  message: string;
};

export type StageState = "idle" | "running" | "passed" | "failed";

export type CarTelemetry = {
  x: number;
  z: number;
  speed: number;
};

export type StageId = "stage1" | "stage2";
