import type { GameState, OngoingAttack } from "./game.js";
import { triggerNationSurrender } from "./game.js";
import { STATE_DEF_MAP, NATION_DEF_MAP } from "./map.js";
import {
  ATTACKER_COEFFICIENT,
  DEFENDER_COEFFICIENT,
  ALLIANCE_BREAK_ATTACK_MULT,
  TERRAIN_DEFENSE,
  type Terrain,
} from "./constants.js";
import { addEvent } from "./events.js";
import { escalateRelation, isDiplomaticPair } from "./diplomacy.js";

function getEffectiveTerrain(game: GameState, stateId: string): Terrain {
  // 永続的な地形アップグレードを確認
  const permanent = game.activeEffects.find(
    (e) => e.type === "terrain_upgrade" && e.stateId === stateId
  );
  if (permanent && permanent.type === "terrain_upgrade") return permanent.permanentTerrain;

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

function getAttackerMultiplier(game: GameState, attackerId: string): number {
  const now = game.elapsedSeconds;

  // 電撃戦カードがあれば攻撃ペナルティなし
  const blitz = game.activeEffects.find(
    (e) => e.type === "blitzkrieg" && e.nationId === attackerId && e.usesLeft > 0
  );
  const basePenalty = blitz ? 1.0 : 0.75;

  // 同盟破棄ペナルティ
  const alliancePenalty = game.activeEffects.find(
    (e) =>
      e.type === "alliance_break_penalty" &&
      e.nationId === attackerId &&
      e.expiresAt > now
  );
  const allianceMult = alliancePenalty ? ALLIANCE_BREAK_ATTACK_MULT : 1.0;

  // 攻撃ブーストカード
  const attackBoost = game.activeEffects.find(
    (e) =>
      e.type === "attack_boost" &&
      e.nationId === attackerId &&
      e.expiresAt > now
  );
  const boostMult =
    attackBoost && attackBoost.type === "attack_boost" ? attackBoost.multiplier : 1.0;

  return basePenalty * allianceMult * boostMult;
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
  const surrenderPairs: Array<[string, string]> = []; // [surrenderedNationId, captorId]

  for (const attack of game.ongoingAttacks) {
    const { attackerId, targetStateId, sourceStateId } = attack;
    const source = states[sourceStateId];
    const target = states[targetStateId];

    if (!source || !target) {
      resolvedTargets.push(targetStateId);
      continue;
    }

    if (source.ownerId !== attackerId) {
      resolvedTargets.push(targetStateId);
      continue;
    }

    const terrain = getEffectiveTerrain(game, targetStateId);
    const defenseMultiplier = TERRAIN_DEFENSE[terrain] * getFortifyMultiplier(game, targetStateId);
    const attackerMult = getAttackerMultiplier(game, attackerId);

    const attackerDps = source.troops * ATTACKER_COEFFICIENT * attackerMult * deltaSeconds;
    const defenderDps = target.troops * DEFENDER_COEFFICIENT * defenseMultiplier * deltaSeconds;

    const newSourceTroops = source.troops - defenderDps;
    const newTargetTroops = target.troops - attackerDps;

    if (newSourceTroops <= 0) {
      states = {
        ...states,
        [sourceStateId]: { ...source, troops: 0 },
        [targetStateId]: { ...target, underAttack: false, attackerId: null },
      };
      resolvedTargets.push(targetStateId);
      const atkName = NATION_DEF_MAP[attackerId]?.name ?? attackerId;
      log = [`${atkName}の攻撃が撃退された！`, ...log].slice(0, 30);
    } else if (newTargetTroops <= 0) {
      const capturedTroops = Math.max(1, newSourceTroops * 0.5);
      const prevOwner = target.ownerId;
      const stateDef = STATE_DEF_MAP[targetStateId];

      states = {
        ...states,
        [sourceStateId]: { ...source, troops: newSourceTroops * 0.8 },
        [targetStateId]: {
          ...target,
          ownerId: attackerId,
          troops: capturedTroops,
          underAttack: false,
          attackerId: null,
        },
      };
      resolvedTargets.push(targetStateId);

      // 電撃戦の使用回数消費
      updatedEffects = updatedEffects.map((e) => {
        if (e.type === "blitzkrieg" && e.nationId === attackerId && e.usesLeft > 0) {
          return { ...e, usesLeft: e.usesLeft - 1 };
        }
        return e;
      });

      const atkName = NATION_DEF_MAP[attackerId]?.name ?? attackerId;
      const defName = NATION_DEF_MAP[prevOwner]?.name ?? prevOwner;
      log = [`${atkName}が${defName}の${stateDef?.name ?? targetStateId}を占領！`, ...log].slice(0, 30);

      if (isDiplomaticPair(attackerId, prevOwner)) {
        escalationPairs.push([attackerId, prevOwner]);
      }

      // ストラテジーモード: 首都陥落で降伏
      if (game.gameMode === "strategy" && stateDef?.capitalOf) {
        surrenderPairs.push([stateDef.capitalOf, attackerId]);
      }
    } else {
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

  // 降伏処理（ストラテジーモード）
  for (const [surrenderedId, captorId] of surrenderPairs) {
    if (next.nations[surrenderedId]?.isAlive) {
      next = triggerNationSurrender(next, surrenderedId, captorId);
    }
  }

  return next;
}
