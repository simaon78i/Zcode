import type { ComponentType } from "react";

export interface GameDefinition {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  color: string;
  totalLevels: number;
  Component: ComponentType<GameProps>;
}

export interface GameProps {
  level: number;
  onLevelComplete: (result: LevelResult) => void;
  onMentorRequest: (req: MentorRequest) => void;
  onExit: () => void;
}

export interface LevelResult {
  level: number;
  passed: boolean;
  hintsUsed?: number;
  artifact?: string;
}

export interface MentorRequest {
  level: number;
  goal: string;
  currentCode?: string;
  errorMessage?: string;
}