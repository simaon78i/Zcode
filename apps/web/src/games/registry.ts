import type { GameDefinition } from "@codequest/games-sdk";

/**
 * The registry of all minigames available in the lobby.
 *
 * To add a new game:
 *   1. Build it as a React component implementing the GameProps interface from @codequest/games-sdk
 *   2. Export a GameDefinition for it (see games-sdk for the shape)
 *   3. Import + add it to this array
 *
 * The lobby reads this registry directly. No other UI code needs to change to add a game.
 */
export const games: GameDefinition[] = [
  // Maze Runner — placeholder, to be implemented (issue #?)
  // Calculator Lab — placeholder
  // Arduino Workshop — placeholder
  // 3D Print Studio — placeholder
];

export function findGame(id: string): GameDefinition | undefined {
  return games.find((g) => g.id === id);
}
