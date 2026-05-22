import type { GameState, OngoingAttack } from "./game.js";
import { STATE_DEF_MAP, NATIONS_DEF } from "./map.js";
import {
  acceptAlliance,
  declareWar,
  expireProposals,
  getRelationStatus,
  isDiplomaticPair,
  isPeacePeriod,
  rejectAlliance,
} from "./diplomacy.js";
import { AI_WAR_DECISION_INTERVAL } from "./constants.js";

const MAX_CONCURRENT_ATTACKS = 2;

function aiAttack(game: GameState, nationId: string): GameState {
  const nation = game.nations[nationId];
  if (!nation || !nation.isAlive) return game;

  const currentAttacks = game.ongoingAttacks.filter((a) => a.attackerId === nationId);
  if (currentAttacks.length >= MAX_CONCURRENT_ATTACKS) return game;

  let states = { ...game.states };
  let attacks = [...game.ongoingAttacks];

  for (const sid of nation.stateIds) {
    const source = states[sid];
    if (!source || source.troops < 50) continue;

    const stateDef = STATE_DEF_MAP[sid];
    if (!stateDef) continue;

    let bestTarget: { id: string; troops: number } | null = null;
    for (const nid of stateDef.neighbors) {
      const ns = states[nid];
      if (!ns || ns.ownerId === nationId) continue;
      if (ns.neutralizedUntil > game.elapsedSeconds) continue;
      // 厳格モード: 戦争状態の相手のみ攻撃可能
      if (
        isDiplomaticPair(nationId, ns.ownerId) &&
        getRelationStatus(game, nationId, ns.ownerId) !== "war"
      ) {
        continue;
      }
      if (!bestTarget || ns.troops < bestTarget.troops) {
        bestTarget = { id: nid, troops: ns.troops };
      }
    }

    if (!bestTarget) continue;
    if (source.troops < bestTarget.troops * 1.3) continue;

    const alreadyAttacking = attacks.some((a) => a.targetStateId === bestTarget!.id);
    if (alreadyAttacking) continue;

    const newAttack: OngoingAttack = {
      attackerId: nationId,
      targetStateId: bestTarget.id,
      sourceStateId: sid,
    };
    attacks = [...attacks, newAttack];
    const t = states[bestTarget.id];
    if (t) states = { ...states, [bestTarget.id]: { ...t, underAttack: true, attackerId: nationId } };

    const currentCount = attacks.filter((a) => a.attackerId === nationId).length;
    if (currentCount >= MAX_CONCURRENT_ATTACKS) break;
  }

  return { ...game, states, ongoingAttacks: attacks };
}

function aiInvest(game: GameState, nationId: string): GameState {
  const nation = game.nations[nationId];
  if (!nation || !nation.isAlive) return game;

  const lowestState = nation.stateIds
    .map((id) => game.states[id])
    .filter((s): s is NonNullable<typeof s> => !!s)
    .sort((a, b) => a.industryLevel - b.industryLevel)[0];

  if (!lowestState || lowestState.industryLevel >= 3) return game;

  return {
    ...game,
    states: {
      ...game.states,
      [lowestState.stateId]: {
        ...lowestState,
        industryLevel: lowestState.industryLevel + 1,
      },
    },
  };
}

function countCurrentWars(game: GameState, nationId: string): number {
  let n = 0;
  for (const rel of Object.values(game.diplomaticRelations)) {
    if (rel.status !== "war") continue;
    if (rel.nationA === nationId || rel.nationB === nationId) n++;
  }
  return n;
}

function scoreWarTarget(
  game: GameState,
  attackerId: string,
  defenderId: string
): number {
  const me = game.nations[attackerId];
  const them = game.nations[defenderId];
  if (!me || !them || !them.isAlive) return -Infinity;

  // 兵力差ベース
  let score = (me.totalTroops - them.totalTroops) / 10;

  // 隣接弱州ボーナス: 自国の州に隣接する敵州で最も弱い州の troops を考慮
  let weakestAdjacent = Infinity;
  let hasAdjacent = false;
  let capitalAdjacent = false;
  for (const sid of me.stateIds) {
    const sdef = STATE_DEF_MAP[sid];
    if (!sdef) continue;
    for (const nid of sdef.neighbors) {
      const ns = game.states[nid];
      if (!ns || ns.ownerId !== defenderId) continue;
      hasAdjacent = true;
      if (ns.troops < weakestAdjacent) weakestAdjacent = ns.troops;
      const nsDef = STATE_DEF_MAP[nid];
      if (nsDef?.capitalOf === defenderId) capitalAdjacent = true;
    }
  }
  if (hasAdjacent) {
    score += Math.max(0, 40 - weakestAdjacent);
  } else {
    // 隣接がない場合は宣戦の旨味が薄い
    score -= 20;
  }
  if (capitalAdjacent) score += 15;

  // 既存戦争のペナルティ
  score -= countCurrentWars(game, attackerId) * 25;

  // 同盟相手への宣戦は重ペナルティ
  if (getRelationStatus(game, attackerId, defenderId) === "ally") {
    score -= 30;
  }

  return score;
}

function aiDiplomacy(game: GameState, nationId: string): GameState {
  if (isPeacePeriod(game)) return game;
  const lastAt = game.aiLastWarDecisionAt[nationId] ?? -Infinity;
  if (game.elapsedSeconds - lastAt < AI_WAR_DECISION_INTERVAL) return game;

  let bestTarget: { id: string; score: number } | null = null;
  for (const other of NATIONS_DEF) {
    if (other.id === nationId) continue;
    if (!game.nations[other.id]?.isAlive) continue;
    if (getRelationStatus(game, nationId, other.id) === "war") continue;
    const s = scoreWarTarget(game, nationId, other.id);
    if (!bestTarget || s > bestTarget.score) {
      bestTarget = { id: other.id, score: s };
    }
  }

  const updated: GameState = {
    ...game,
    aiLastWarDecisionAt: {
      ...game.aiLastWarDecisionAt,
      [nationId]: game.elapsedSeconds,
    },
  };

  if (!bestTarget || bestTarget.score <= 0) return updated;
  return declareWar(updated, nationId, bestTarget.id);
}

function aiAllianceResponse(game: GameState, nationId: string): GameState {
  const myProposals = game.pendingAllianceProposals.filter((p) => p.to === nationId);
  if (myProposals.length === 0) return game;

  let working = game;
  for (const proposal of myProposals) {
    const me = working.nations[nationId];
    const them = working.nations[proposal.from];
    if (!me || !them) {
      working = rejectAlliance(working, proposal.from, proposal.to);
      continue;
    }

    // 受諾条件: 相手の兵力が自分の80%以上 かつ 共通の戦争相手が1つ以上
    const strongEnough = them.totalTroops >= me.totalTroops * 0.8;

    let commonEnemies = 0;
    for (const rel of Object.values(working.diplomaticRelations)) {
      if (rel.status !== "war") continue;
      const meAtWar = rel.nationA === nationId || rel.nationB === nationId;
      const themAtWar = rel.nationA === proposal.from || rel.nationB === proposal.from;
      if (meAtWar && themAtWar) {
        // 同じ相手と戦争状態か確認
        const meEnemy = rel.nationA === nationId ? rel.nationB : rel.nationA;
        const themEnemy = rel.nationA === proposal.from ? rel.nationB : rel.nationA;
        if (meEnemy === themEnemy) commonEnemies++;
      }
    }

    if (strongEnough && commonEnemies >= 1) {
      working = acceptAlliance(working, proposal.from, proposal.to);
    } else {
      working = rejectAlliance(working, proposal.from, proposal.to);
    }
  }
  return working;
}

export function aiTick(game: GameState): GameState {
  let g = expireProposals(game);

  for (const nation of NATIONS_DEF) {
    if (nation.id === g.playerNationId) continue;
    if (!g.nations[nation.id]?.isAlive) continue;

    g = aiDiplomacy(g, nation.id);
    g = aiAllianceResponse(g, nation.id);
    g = aiAttack(g, nation.id);

    const elapsed = Math.floor(g.elapsedSeconds);
    if (elapsed > 0 && elapsed % 30 === 0) {
      g = aiInvest(g, nation.id);
    }
  }
  return g;
}
