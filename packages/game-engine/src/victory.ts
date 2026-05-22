import type { GameState } from "./game.js";
import { NATIONS_DEF } from "./map.js";

export function checkVictory(game: GameState): GameState {
  if (game.phase === "finished") return game;

  const aliveNations = NATIONS_DEF.filter((n) => game.nations[n.id]?.isAlive);

  // domination victory: one nation owns all states
  if (aliveNations.length === 1) {
    return {
      ...game,
      phase: "finished",
      winner: aliveNations[0].id,
      eventLog: [`${NATIONS_DEF.find((n) => n.id === aliveNations[0].id)?.name ?? aliveNations[0].id}が全土を制圧！`, ...game.eventLog].slice(0, 30),
    };
  }

  // timer victory
  if (game.elapsedSeconds >= game.timerLimit) {
    let winnerId: string | null = null;
    let maxStates = -1;
    let tied = false;

    for (const n of aliveNations) {
      const count = game.nations[n.id]?.stateIds.length ?? 0;
      if (count > maxStates) {
        maxStates = count;
        winnerId = n.id;
        tied = false;
      } else if (count === maxStates) {
        tied = true;
      }
    }

    const result = tied ? null : winnerId;
    const name = result ? (NATIONS_DEF.find((n) => n.id === result)?.name ?? result) : "引き分け";
    return {
      ...game,
      phase: "finished",
      winner: result,
      eventLog: [tied ? "時間切れ！引き分けです" : `時間切れ！${name}の勝利！`, ...game.eventLog].slice(0, 30),
    };
  }

  return game;
}
