import type { GameState } from "./game.js";
import { rebuildNations } from "./game.js";
import { applyCombatDelta } from "./combat.js";
import { aiTick } from "./ai.js";
import { checkVictory } from "./victory.js";
import { drawCard } from "./cards.js";
import {
  DELTA_SECONDS,
  TROOP_REGEN_BASE,
  TROOP_REGEN_PER_LEVEL,
  MAX_TROOPS,
  FUNDS_PER_STATE_PER_SECOND,
  CARD_DRAW_INTERVAL,
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

  const totalWarEffect = game.activeEffects.find(
    (e) => e.type === "total_war" && e.nationId === game.playerNationId && e.expiresAt > now
  );
  const totalWarMultiplier = totalWarEffect ? 3.0 : 1.0;

  const mobilizationEffect = game.activeEffects.find(
    (e) => e.type === "mobilization" && e.nationId === game.playerNationId && e.expiresAt > now
  );
  const mobilizationBonus = mobilizationEffect && mobilizationEffect.type === "mobilization" ? mobilizationEffect.bonus : 0;

  for (const stateId of Object.keys(states)) {
    const s = states[stateId];
    if (!s) continue;
    if (s.troops >= MAX_TROOPS) continue;
    if (s.neutralizedUntil > now) continue;

    const supplycut = game.activeEffects.find(
      (e) => e.type === "supply_cut" && e.stateId === stateId && e.expiresAt > now
    );
    if (supplycut) continue;

    let baseRegen = TROOP_REGEN_BASE + (s.industryLevel - 1) * TROOP_REGEN_PER_LEVEL;

    // industry_boost (stored as mobilization with __state_ prefix)
    const industryBoost = game.activeEffects.find(
      (e) => e.type === "mobilization" && e.nationId === `__state_${stateId}` && e.expiresAt > now
    );
    if (industryBoost && industryBoost.type === "mobilization") {
      baseRegen += industryBoost.bonus;
    }

    if (s.ownerId === game.playerNationId) {
      baseRegen = baseRegen * totalWarMultiplier + mobilizationBonus;
    }

    states[stateId] = { ...s, troops: Math.min(s.troops + baseRegen * delta, MAX_TROOPS) };
  }

  return { ...game, states };
}

function revenueTick(game: GameState, delta: number): GameState {
  const playerNation = game.nations[game.playerNationId];
  if (!playerNation) return game;
  const income = playerNation.stateIds.length * FUNDS_PER_STATE_PER_SECOND * delta;
  return { ...game, playerFunds: game.playerFunds + income };
}

function expireEffects(game: GameState): GameState {
  const now = game.elapsedSeconds;
  const expired = game.activeEffects.filter((e) => {
    if ("expiresAt" in e) return e.expiresAt <= now;
    return false;
  });

  if (expired.length === 0) return game;

  let states = { ...game.states };

  // clear neutralized states whose effect expired
  for (const e of expired) {
    if (e.type === "revolution_export") {
      const s = states[e.stateId];
      if (s && s.neutralizedUntil <= now) {
        states = { ...states, [e.stateId]: { ...s, neutralizedUntil: 0 } };
      }
    }
  }

  const activeEffects = game.activeEffects.filter((e) => {
    if ("expiresAt" in e) return e.expiresAt > now;
    if (e.type === "blitzkrieg") return e.usesLeft > 0;
    return true;
  });

  return { ...game, states, activeEffects };
}

function cardDrawTick(game: GameState): GameState {
  if (game.playerHand.length >= 3) return game;
  const secondsSinceLastDraw = game.elapsedSeconds - game.lastCardDraw;
  if (secondsSinceLastDraw < CARD_DRAW_INTERVAL) return game;
  return drawCard(game);
}

export function gameTick(game: GameState): GameState {
  if (game.phase !== "playing") return game;

  let g = game;

  g = { ...g, elapsedSeconds: g.elapsedSeconds + DELTA_SECONDS };

  g = troopRegenTick(g, DELTA_SECONDS);
  g = applyCombatDelta(g, DELTA_SECONDS);
  g = revenueTick(g, DELTA_SECONDS);
  g = expireEffects(g);
  g = cardDrawTick(g);
  g = rebuildNations(g);

  // AI tick every AI_TICK_INTERVAL seconds
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
