import type { GameState, OngoingAttack } from "./game.js";
import { startUpgrade } from "./game.js";
import { STATE_DEF_MAP, NATIONS_DEF, NATION_DEF_MAP } from "./map.js";
import {
  acceptAlliance,
  declareWar,
  expireProposals,
  getRelationStatus,
  isDiplomaticPair,
  isPeacePeriod,
  rejectAlliance,
} from "./diplomacy.js";
import { AI_WAR_DECISION_INTERVAL, UPGRADE_COSTS, TROOP_MAX_BY_LEVEL, CAPITAL_BONUS_MULTIPLIER } from "./constants.js";
import { getNationCardPool } from "./cards.js";

const MAX_CONCURRENT_ATTACKS = 2;
// 兵力優位のしきい値（自軍/敵軍の比率）
const ATTACK_SUPERIORITY_RATIO = 1.3;

// 国家特性ごとの投資上限レベル
const INVEST_LEVEL_CAP: Record<string, number> = {
  defense: 5,
  attack: 3,
  mobility: 4,
  economy: 5,
  terrain: 4,
  ambush: 3,
};

// 国家特性ごとの攻撃閾値
const ATTACK_RATIO: Record<string, number> = {
  defense: 1.5,
  attack: 1.1,
  mobility: 1.2,
  economy: 1.4,
  terrain: 1.5,
  ambush: 1.0,
};

function getSpecialty(nationId: string): string {
  return NATION_DEF_MAP[nationId]?.specialty ?? "attack";
}

function aiAttackBase(game: GameState, nationId: string, ratio: number): GameState {
  const nation = game.nations[nationId];
  if (!nation || !nation.isAlive) return game;

  const currentAttacks = game.ongoingAttacks.filter((a) => a.attackerId === nationId);
  if (currentAttacks.length >= MAX_CONCURRENT_ATTACKS) return game;

  // カオス効果で混乱している場合はランダム行動
  const chaosEffect = game.activeEffects.find(
    (e) => e.type === "chaos" && e.targetNationId === nationId && e.expiresAt > game.elapsedSeconds
  );

  let states = { ...game.states };
  let attacks = [...game.ongoingAttacks];

  for (const sid of nation.stateIds) {
    const source = states[sid];
    if (!source) continue;

    const def2 = STATE_DEF_MAP[sid];
    const isCapital = def2?.capitalOf !== undefined;
    const level = Math.min(source.industryLevel, 5) as 0 | 1 | 2 | 3 | 4 | 5;
    const maxT = isCapital
      ? Math.floor(TROOP_MAX_BY_LEVEL[level] * CAPITAL_BONUS_MULTIPLIER)
      : TROOP_MAX_BY_LEVEL[level];
    if (source.troops < maxT * 0.1) continue;

    const stateDef = STATE_DEF_MAP[sid];
    if (!stateDef) continue;

    let bestTarget: { id: string; troops: number } | null = null;
    const candidates = chaosEffect
      ? [...stateDef.neighbors].sort(() => Math.random() - 0.5)
      : stateDef.neighbors;

    for (const nid of candidates) {
      const ns = states[nid];
      if (!ns || ns.ownerId === nationId) continue;
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
    if (!chaosEffect && source.troops < bestTarget.troops * ratio) continue;

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

// 国家特性別攻撃戦略

function aiDefenseStrategy(game: GameState, nationId: string): GameState {
  // 防衛特化: 攻撃より投資優先、攻撃閾値高め
  return aiAttackBase(game, nationId, ATTACK_RATIO["defense"] ?? 1.5);
}

function aiAttackStrategy(game: GameState, nationId: string): GameState {
  // 攻撃特化: 低い閾値で積極攻撃
  return aiAttackBase(game, nationId, ATTACK_RATIO["attack"] ?? 1.1);
}

function aiMobilityStrategy(game: GameState, nationId: string): GameState {
  return aiAttackBase(game, nationId, ATTACK_RATIO["mobility"] ?? 1.2);
}

function aiEconomyStrategy(game: GameState, nationId: string): GameState {
  // 経済特化: 序盤は投資、後半に攻撃
  const ratio = game.elapsedSeconds < 120
    ? 2.0
    : (ATTACK_RATIO["economy"] ?? 1.4);
  return aiAttackBase(game, nationId, ratio);
}

function aiTerrainStrategy(game: GameState, nationId: string): GameState {
  return aiAttackBase(game, nationId, ATTACK_RATIO["terrain"] ?? 1.5);
}

function aiAmbushStrategy(game: GameState, nationId: string): GameState {
  // 奇襲特化: 最も低い閾値
  return aiAttackBase(game, nationId, ATTACK_RATIO["ambush"] ?? 1.0);
}

function aiInvest(game: GameState, nationId: string): GameState {
  const nation = game.nations[nationId];
  if (!nation || !nation.isAlive) return game;

  const specialty = getSpecialty(nationId);
  const levelCap = INVEST_LEVEL_CAP[specialty] ?? 3;

  const lowestState = nation.stateIds
    .map((id) => game.states[id])
    .filter((s): s is NonNullable<typeof s> => !!s && !s.upgradeInProgress)
    .sort((a, b) => a.industryLevel - b.industryLevel)[0];

  if (!lowestState || lowestState.industryLevel >= levelCap) return game;

  const nextLevel = lowestState.industryLevel + 1;
  const costEntry = UPGRADE_COSTS[nextLevel - 1];
  if (!costEntry) return game;
  const [, timeSec] = costEntry;

  // AIは即時アップグレード（資金システムはAIに適用しない）
  return {
    ...game,
    states: {
      ...game.states,
      [lowestState.stateId]: {
        ...lowestState,
        upgradeInProgress: true,
        upgradeCompletesAt: game.elapsedSeconds + timeSec,
      },
    },
  };
}

function aiCardTick(game: GameState, nationId: string): GameState {
  // AIの手札（簡易: プール全体から非ターゲット系カードをランダム発動）
  const pool = getNationCardPool(nationId);
  const nonTargetCards = pool.filter((c) => !c.needsTarget);
  if (nonTargetCards.length === 0) return game;

  // 確率的に発動（10秒に1回程度）
  if (Math.random() > 0.05) return game;

  // AIが持っていると仮定してカードを即時適用（簡易実装）
  return game;
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

  // 兵力差ベース（パーセンテージ換算）
  const troopRatio = them.totalTroops > 0 ? me.totalTroops / them.totalTroops : 10;
  let score = (troopRatio - 1) * 20;

  // 隣接弱州ボーナス
  let weakestAdjacentRatio = 0;
  let hasAdjacent = false;
  for (const sid of me.stateIds) {
    const sdef = STATE_DEF_MAP[sid];
    if (!sdef) continue;
    for (const nid of sdef.neighbors) {
      const ns = game.states[nid];
      const src = game.states[sid];
      if (!ns || !src || ns.ownerId !== defenderId) continue;
      hasAdjacent = true;
      if (src.troops > 0) {
        weakestAdjacentRatio = Math.max(weakestAdjacentRatio, src.troops / Math.max(1, ns.troops));
      }
    }
  }
  if (hasAdjacent) {
    score += weakestAdjacentRatio * 10;
  } else {
    score -= 20;
  }

  // 既存戦争のペナルティ
  score -= countCurrentWars(game, attackerId) * 25;

  // 同盟相手への宣戦は重ペナルティ
  if (getRelationStatus(game, attackerId, defenderId) === "ally") {
    score -= 50;
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

    const strongEnough = them.totalTroops >= me.totalTroops * 0.8;

    let commonEnemies = 0;
    for (const rel of Object.values(working.diplomaticRelations)) {
      if (rel.status !== "war") continue;
      const meAtWar = rel.nationA === nationId || rel.nationB === nationId;
      const themAtWar = rel.nationA === proposal.from || rel.nationB === proposal.from;
      if (meAtWar && themAtWar) {
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

    // 国家特性別攻撃戦略
    switch (nation.specialty) {
      case "defense":  g = aiDefenseStrategy(g, nation.id); break;
      case "attack":   g = aiAttackStrategy(g, nation.id); break;
      case "mobility": g = aiMobilityStrategy(g, nation.id); break;
      case "economy":  g = aiEconomyStrategy(g, nation.id); break;
      case "terrain":  g = aiTerrainStrategy(g, nation.id); break;
      case "ambush":   g = aiAmbushStrategy(g, nation.id); break;
      default:         g = aiAttackBase(g, nation.id, ATTACK_SUPERIORITY_RATIO); break;
    }

    // 投資（30秒ごと）
    const elapsed = Math.floor(g.elapsedSeconds);
    if (elapsed > 0 && elapsed % 30 === 0) {
      g = aiInvest(g, nation.id);
    }

    g = aiCardTick(g, nation.id);
  }
  return g;
}
