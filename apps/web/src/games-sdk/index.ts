import type { ComponentType } from "react";

export interface LevelResult {
  level: number;
  passed: boolean;
  timeSpent: number;
  attempts: number;
  artifact?: string;
  hintsUsed?: number;
}

export interface MentorRequest {
  level: number;
  goal: string;
  currentCode?: string;
  errorMessage?: string;
}

export interface GameProps {
  level: number;
  onLevelComplete: (result: LevelResult) => void;
  onMentorRequest: (req: MentorRequest) => void;
  onExit: () => void;
}

export interface GameDefinition {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  color: string;
  totalLevels: number;
  Component: ComponentType<GameProps>;
  unlockRequires?: string[];
  hardware?: unknown;
}