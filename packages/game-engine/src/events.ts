import type { GameState } from "./game.js";

export function addEvent(game: GameState, message: string): GameState {
  return {
    ...game,
    eventLog: [message, ...game.eventLog].slice(0, 30),
  };
}
