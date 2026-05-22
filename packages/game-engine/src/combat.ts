import type { GameState, OngoingAttack } from "./game.js";
import { STATE_DEF_MAP, NATION_DEF_MAP } from "./map.js";
import { ATTACKER_PENALTY, COMBAT_DPS_SCALE, TERRAIN_DEFENSE, type Terrain } from "./constants.js";
import { addEvent } from "./events.js";
import { escalateRelation, isDiplomaticPair } from "./diplomacy.js";

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

function getFortifyMultiplier(game: GameState, stateId: string): number {
  const effect = game.activeEffects.find(
    (e) => e.type === "fortify" && e.stateId === stateId
  );
  if (effect && effect.type === "fortify") return effect.multiplier;
  return 1.0;
}

function getAttackerPenalty(game: GameState, attackerId: string): number {
  const blitz = game.activeEffects.find(
    (e) => e.type === "blitzkrieg" && e.nationId === attackerId && e.usesLeft > 0
  );
  return blitz ? 1.0 : ATTACKER_PENALTY;
}

export function applyCombatDelta(
  game: GameState,
  deltaSeconds: number
): GameState {
  if (game.ongoingAttacks.length === 0) return game;

  let states = { ...game.states };
  const resolvedTargets: string[] = [];
  let updatedEffects = [...game.activeEffects];
  let log = game.eventLog;
  const escalationPairs: Array<[string, string]> = [];

  for (const attack of game.ongoingAttacks) {
    const { attackerId, targetStateId, sourceStateId } = attack;
    const source = states[sourceStateId];
    const target = states[targetStateId];

    if (!source || !target) {
      resolvedTargets.push(targetStateId);
      continue;
    }

    // Neutralized state cannot be attacked
    if (target.neutralizedUntil > game.elapsedSeconds) continue;

    // Source lost or captured
    if (source.ownerId !== attackerId) {
      resolvedTargets.push(targetStateId);
      continue;
    }

    const terrain = getEffectiveTerrain(game, targetStateId);
    const defenseMultiplier = TERRAIN_DEFENSE[terrain] * getFortifyMultiplier(game, targetStateId);
    const attackPenalty = getAttackerPenalty(game, attackerId);

    const attackerDps = source.troops * attackPenalty * COMBAT_DPS_SCALE * deltaSeconds;
    const defenderDps = target.troops * defenseMultiplier * COMBAT_DPS_SCALE * deltaSeconds;

    const newSourceTroops = source.troops - defenderDps;
    const newTargetTroops = target.troops - attackerDps;

    if (newSourceTroops <= 0) {
      // attacker wiped out — cancel attack
      states = {
        ...states,
        [sourceStateId]: { ...source, troops: 0 },
        [targetStateId]: { ...target, underAttack: false, attackerId: null },
      };
      resolvedTargets.push(targetStateId);
      const atkName = NATION_DEF_MAP[attackerId]?.name ?? attackerId;
      log = [`${atkName}の攻撃が撃退された！`, ...log].slice(0, 30);
    } else if (newTargetTroops <= 0) {
      // defender captured
      const capturedTroops = Math.max(1, newSourceTroops * 0.5);
      const prevOwner = target.ownerId;
      states = {
        ...states,
        [sourceStateId]: { ...source, troops: newSourceTroops * 0.8 },
        [targetStateId]: {
          ...target,
          ownerId: attackerId,
          troops: capturedTroops,
          underAttack: false,
          attackerId: null,
          neutralizedUntil: 0,
        },
      };
      resolvedTargets.push(targetStateId);

      // consume blitzkrieg use
      updatedEffects = updatedEffects.map((e) => {
        if (e.type === "blitzkrieg" && e.nationId === attackerId && e.usesLeft > 0) {
          return { ...e, usesLeft: e.usesLeft - 1 };
        }
        return e;
      });

      const atkName = NATION_DEF_MAP[attackerId]?.name ?? attackerId;
      const defName = NATION_DEF_MAP[prevOwner]?.name ?? prevOwner;
      const stateDef = STATE_DEF_MAP[targetStateId];
      log = [`${atkName}が${defName}の${stateDef?.name ?? targetStateId}を占領！`, ...log].slice(0, 30);

      if (isDiplomaticPair(attackerId, prevOwner)) {
        escalationPairs.push([attackerId, prevOwner]);
      }
    } else {
      // battle continues
      states = {
        ...states,
        [sourceStateId]: { ...source, troops: newSourceTroops },
        [targetStateId]: { ...target, troops: newTargetTroops },
      };
    }
  }

  const remainingAttacks = game.ongoingAttacks.filter(
    (a) => !resolvedTargets.includes(a.targetStateId)
  );

  let next: GameState = {
    ...game,
    states,
    ongoingAttacks: remainingAttacks,
    activeEffects: updatedEffects,
    eventLog: log,
  };

  for (const [a, b] of escalationPairs) {
    next = escalateRelation(next, a, b);
  }

  return next;
}
