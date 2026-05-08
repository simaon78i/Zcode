import type { GameDefinition } from "@codequest/games-sdk";
import { CodeBreakerComponent } from "./component";

export const CodeBreaker: GameDefinition = {
  id: "codebreaker",
  name: "CodeBreaker: Diamond Heist",
  tagline: "Hack vaults, crack locks, and steal diamonds — with code.",
  icon: "ti-diamond",
  color: "purple",
  totalLevels: 5,
  Component: CodeBreakerComponent,
};
