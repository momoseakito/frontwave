import type { GameState } from "./game.js";

export interface StraitDefinition {
  fromStateId: string;
  toStateId: string;
  name: string;
}

// 5本の海峡ルート
export const STRAITS: StraitDefinition[] = [
  { fromStateId: "fed_denmark",    toStateId: "emp_holstein",   name: "デンマーク海峡" },
  { fromStateId: "fed_denmark",    toStateId: "emp_pomerania",  name: "バルト海西口" },
  { fromStateId: "fed_gothland",   toStateId: "emp_pomerania",  name: "バルト海東口" },
  { fromStateId: "hol_calabria_s", toStateId: "hol_palermo",    name: "メッシーナ海峡" },
  { fromStateId: "kgd_andalusia",  toStateId: "dch_maghreb",    name: "ジブラルタル海峡" },
];

export function getStraitNeighbors(stateId: string): string[] {
  return STRAITS
    .filter((s) => s.fromStateId === stateId || s.toStateId === stateId)
    .map((s) => s.fromStateId === stateId ? s.toStateId : s.fromStateId);
}

export function isStraitConnection(fromStateId: string, toStateId: string): boolean {
  return STRAITS.some(
    (s) =>
      (s.fromStateId === fromStateId && s.toStateId === toStateId) ||
      (s.toStateId === fromStateId && s.fromStateId === toStateId)
  );
}

export function canCrossStrait(
  game: GameState,
  attackingNationId: string,
  fromStateId: string,
  toStateId: string
): boolean {
  if (!isStraitConnection(fromStateId, toStateId)) return false;

  const now = game.elapsedSeconds;
  return game.activeEffects.some(
    (e) =>
      e.type === "strait_crossing_enabled" &&
      e.nationId === attackingNationId &&
      e.expiresAt > now
  );
}
