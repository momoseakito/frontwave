import type { GameState } from "./game.js";
import { rebuildNations, getMaxTroops } from "./game.js";
import { applyCombatDelta } from "./combat.js";
import { aiTick } from "./ai.js";
import { checkVictory } from "./victory.js";
import { drawDraftChoices } from "./cards.js";
import {
  DELTA_SECONDS,
  TROOP_REGEN_BY_LEVEL,
  GOLD_INCOME_BY_LEVEL,
  CAPITAL_BONUS_MULTIPLIER,
  CARD_DRAW_INTERVAL,
  HAND_SIZE,
  AI_TICK_INTERVAL,
} from "./constants.js";
import { STATE_DEF_MAP } from "./map.js";
import type { Terrain } from "./constants.js";

function getEffectiveTerrain(game: GameState, stateId: string): Terrain {
  const override = game.activeEffects.find(
    (e) => e.type === "terrain_override" && e.stateId === stateId
  );
  if (override && override.type === "terrain_override") return override.terrain;
  const def = STATE_DEF_MAP[stateId];
  if (!def) return "plains";
  if (def.capitalOf) return "capital";
  return def.terrain as Terrain;
}

function troopRegenTick(game: GameState, delta: number): GameState {
  const states = { ...game.states };
  const now = game.elapsedSeconds;

  const mobilizationEffect = game.activeEffects.find(
    (e) => e.type === "mobilization" && e.nationId === game.playerNationId && e.expiresAt > now
  );
  const mobilizationBonus =
    mobilizationEffect && mobilizationEffect.type === "mobilization"
      ? mobilizationEffect.bonus
      : 0;

  for (const stateId of Object.keys(states)) {
    const s = states[stateId];
    if (!s) continue;

    const supplycut = game.activeEffects.find(
      (e) => e.type === "supply_cut" && e.stateId === stateId && e.expiresAt > now
    );
    if (supplycut) continue;

    const def = STATE_DEF_MAP[stateId];
    const isCapital = def?.capitalOf !== undefined;
    const level = Math.min(s.industryLevel, 5) as 0 | 1 | 2 | 3 | 4 | 5;
    const baseRegen = TROOP_REGEN_BY_LEVEL[level];
    const regenRate = isCapital ? baseRegen * CAPITAL_BONUS_MULTIPLIER : baseRegen;
    const maxTroops = getMaxTroops(s.industryLevel, isCapital);

    if (s.troops >= maxTroops) continue;

    let effectiveRegen = regenRate;

    // 状態固有の動員ボーナス（内部キー使用）
    const stateBoost = game.activeEffects.find(
      (e) =>
        e.type === "mobilization" &&
        e.nationId === `__state_${stateId}` &&
        e.expiresAt > now
    );
    if (stateBoost && stateBoost.type === "mobilization") {
      effectiveRegen += stateBoost.bonus;
    }

    if (s.ownerId === game.playerNationId) {
      effectiveRegen += mobilizationBonus;
    }

    states[stateId] = {
      ...s,
      troops: Math.min(s.troops + effectiveRegen * delta, maxTroops),
    };
  }

  return { ...game, states };
}

function poisonDotTick(game: GameState, delta: number): GameState {
  const now = game.elapsedSeconds;
  const poisons = game.activeEffects.filter(
    (e) => e.type === "poison_dot" && e.expiresAt > now
  );
  if (poisons.length === 0) return game;

  const states = { ...game.states };
  for (const e of poisons) {
    if (e.type !== "poison_dot") continue;
    const s = states[e.stateId];
    if (!s) continue;
    states[e.stateId] = { ...s, troops: Math.max(0, s.troops - e.dpsPerSecond * delta) };
  }
  return { ...game, states };
}

function revenueTick(game: GameState, delta: number): GameState {
  const playerNation = game.nations[game.playerNationId];
  if (!playerNation) return game;

  const now = game.elapsedSeconds;
  const isBlockaded = game.activeEffects.some(
    (e) => e.type === "economic_blockade" && e.nationId === game.playerNationId && e.expiresAt > now
  );
  if (isBlockaded) return game;

  let income = 0;
  for (const sid of playerNation.stateIds) {
    const s = game.states[sid];
    if (!s) continue;
    const level = Math.min(s.industryLevel, 5) as 0 | 1 | 2 | 3 | 4 | 5;
    income += GOLD_INCOME_BY_LEVEL[level];
  }

  return { ...game, playerFunds: game.playerFunds + income * delta };
}

function upgradeCompletionTick(game: GameState): GameState {
  const now = game.elapsedSeconds;
  const states = { ...game.states };
  let changed = false;

  for (const [id, s] of Object.entries(states)) {
    if (s.upgradeInProgress && s.upgradeCompletesAt <= now) {
      states[id] = {
        ...s,
        industryLevel: Math.min(s.industryLevel + 1, 5),
        upgradeInProgress: false,
        upgradeCompletesAt: 0,
      };
      changed = true;
    }
  }

  return changed ? { ...game, states } : game;
}

function expireEffects(game: GameState): GameState {
  const now = game.elapsedSeconds;
  const expired = game.activeEffects.filter((e) => {
    if ("expiresAt" in e) return e.expiresAt <= now;
    return false;
  });

  if (expired.length === 0) return game;

  const activeEffects = game.activeEffects.filter((e) => {
    if (e.type === "terrain_upgrade") return true; // 永続効果
    if ("expiresAt" in e) return e.expiresAt > now;
    if (e.type === "blitzkrieg") return e.usesLeft > 0;
    return true;
  });

  return { ...game, activeEffects };
}

function cardDraftTick(game: GameState): GameState {
  // 手札上限またはドラフト待機中はスキップ
  if (game.cardDraftPending) return game;
  if (game.playerHand.length >= HAND_SIZE) return game;

  const secondsSinceLastDraw = game.elapsedSeconds - game.lastCardDraw;
  if (secondsSinceLastDraw < CARD_DRAW_INTERVAL) return game;

  const choices = drawDraftChoices(game);
  if (choices.length === 0) return game;

  return {
    ...game,
    cardDraftPending: true,
    cardDraftChoices: choices,
  };
}

export function gameTick(game: GameState): GameState {
  if (game.phase !== "playing") return game;

  let g = game;

  g = { ...g, elapsedSeconds: g.elapsedSeconds + DELTA_SECONDS };

  g = troopRegenTick(g, DELTA_SECONDS);
  g = poisonDotTick(g, DELTA_SECONDS);
  g = applyCombatDelta(g, DELTA_SECONDS);
  g = revenueTick(g, DELTA_SECONDS);
  g = upgradeCompletionTick(g);
  g = expireEffects(g);
  g = cardDraftTick(g);
  g = rebuildNations(g);

  const prevAiSec = Math.floor(game.lastAiTick);
  const curSec = Math.floor(g.elapsedSeconds);
  if (curSec - prevAiSec >= AI_TICK_INTERVAL) {
    g = aiTick(g);
    g = { ...g, lastAiTick: g.elapsedSeconds };
    g = rebuildNations(g);
  }

  g = checkVictory(g);

  return g;
}
