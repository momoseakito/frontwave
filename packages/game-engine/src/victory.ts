import type { GameState } from "./game.js";
import { NATIONS_DEF } from "./map.js";

function checkDominationVictory(game: GameState): GameState | null {
  const aliveNations = NATIONS_DEF.filter((n) => game.nations[n.id]?.isAlive);
  if (aliveNations.length === 1) {
    const winner = aliveNations[0];
    return {
      ...game,
      phase: "finished",
      winner: winner.id,
      eventLog: [
        `${winner.name}が全土を制圧！`,
        ...game.eventLog,
      ].slice(0, 30),
    };
  }
  return null;
}

function checkStrategyVictory(game: GameState): GameState {
  const domination = checkDominationVictory(game);
  if (domination) return domination;
  return game;
}

function checkCasualVictory(game: GameState): GameState {
  const domination = checkDominationVictory(game);
  if (domination) return domination;

  if (game.elapsedSeconds >= game.timerLimit) {
    const aliveNations = NATIONS_DEF.filter((n) => game.nations[n.id]?.isAlive);
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
    const name = result
      ? (NATIONS_DEF.find((n) => n.id === result)?.name ?? result)
      : "引き分け";
    return {
      ...game,
      phase: "finished",
      winner: result,
      eventLog: [
        tied ? "時間切れ！引き分けです" : `時間切れ！${name}の勝利！`,
        ...game.eventLog,
      ].slice(0, 30),
    };
  }

  return game;
}

export function checkVictory(game: GameState): GameState {
  if (game.phase === "finished") return game;

  if (game.gameMode === "strategy") return checkStrategyVictory(game);
  return checkCasualVictory(game);
}
