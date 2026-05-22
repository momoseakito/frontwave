import type { GameState, CardInstance, ActiveEffect } from "./game.js";
import { STATE_DEF_MAP } from "./map.js";
import { getRelationStatus, isDiplomaticPair } from "./diplomacy.js";

export type CardRarity = "common" | "rare" | "sr";

export interface CardDefinition {
  id: string;
  name: string;
  rarity: CardRarity;
  description: string;
  needsTarget: boolean;
  targetType?: "enemy_state" | "own_state" | "any_state";
}

export const CARDS_DEF: CardDefinition[] = [
  // SR (3)
  { id: "nuclear_intimidation", name: "核の威圧",     rarity: "sr",     description: "対象の兵力を半減",                  needsTarget: true,  targetType: "enemy_state" },
  { id: "revolution_export",    name: "革命輸出",     rarity: "sr",     description: "敵州を30秒間中立化（再生・攻撃停止）", needsTarget: true,  targetType: "enemy_state" },
  { id: "total_war",            name: "総力戦",       rarity: "sr",     description: "自軍の兵力再生3倍（30秒）",           needsTarget: false },

  // Rare (7)
  { id: "mountain_pass",        name: "山岳突破",     rarity: "rare",   description: "対象を平野地形に変更（60秒）",        needsTarget: true,  targetType: "enemy_state" },
  { id: "rapid_reinforcement",  name: "緊急増援",     rarity: "rare",   description: "自州に80兵力を即座に追加",            needsTarget: true,  targetType: "own_state"   },
  { id: "strategic_bombing",    name: "戦略爆撃",     rarity: "rare",   description: "対象の工業レベルを45秒間-1",          needsTarget: true,  targetType: "enemy_state" },
  { id: "intelligence_network", name: "情報網",       rarity: "rare",   description: "60秒間全AIの兵力を可視化",            needsTarget: false },
  { id: "supply_cut",           name: "補給線遮断",   rarity: "rare",   description: "対象州の兵力再生を30秒停止",          needsTarget: true,  targetType: "enemy_state" },
  { id: "coastal_fort",         name: "海岸要塞",     rarity: "rare",   description: "沿岸州の防衛を45秒間2倍",            needsTarget: true,  targetType: "own_state"   },
  { id: "fortify",              name: "陣地構築",     rarity: "rare",   description: "自州の防衛を45秒間1.5倍",            needsTarget: true,  targetType: "own_state"   },

  // Common (10)
  { id: "conscription",         name: "徴兵",         rarity: "common", description: "自州に40兵力を即座に追加",            needsTarget: true,  targetType: "own_state"   },
  { id: "war_bonds",            name: "戦時国債",     rarity: "common", description: "資金+200を即座に獲得",               needsTarget: false },
  { id: "industry_boost",       name: "増産命令",     rarity: "common", description: "自州の工業Lvを30秒間+1",             needsTarget: true,  targetType: "own_state"   },
  { id: "guerrilla",            name: "ゲリラ戦術",   rarity: "common", description: "対象州への攻撃者が2倍の被害（30秒）", needsTarget: true,  targetType: "own_state"   },
  { id: "air_strike",           name: "空爆",         rarity: "common", description: "対象州の兵力を30減少",               needsTarget: true,  targetType: "enemy_state" },
  { id: "mobilization",         name: "動員令",       rarity: "common", description: "全自州の再生速度+2（20秒）",          needsTarget: false },
  { id: "border_skirmish",      name: "国境衝突",     rarity: "common", description: "最弱の隣接敵州を即座に攻撃開始",      needsTarget: false },
  { id: "economic_aid",         name: "経済援助",     rarity: "common", description: "資金+（所有州数×8）",                needsTarget: false },
  { id: "blitzkrieg",           name: "電撃戦",       rarity: "common", description: "次の攻撃の攻撃補正を無効化",          needsTarget: false },
  { id: "spy_sabotage",         name: "スパイ工作",   rarity: "common", description: "対象州の兵力を20減少",               needsTarget: true,  targetType: "enemy_state" },
];

export const CARD_DEF_MAP: Record<string, CardDefinition> = Object.fromEntries(
  CARDS_DEF.map((c) => [c.id, c])
);

const DRAW_WEIGHTS: Record<CardRarity, number> = { common: 6, rare: 3, sr: 1 };

function weightedRandomCard(hand: CardInstance[]): CardDefinition {
  const handDefIds = new Set(hand.map((c) => c.definitionId));
  const pool = CARDS_DEF.filter((c) => !handDefIds.has(c.id));
  if (pool.length === 0) return CARDS_DEF[0];

  const totalWeight = pool.reduce((sum, c) => sum + DRAW_WEIGHTS[c.rarity], 0);
  let r = Math.random() * totalWeight;
  for (const card of pool) {
    r -= DRAW_WEIGHTS[card.rarity];
    if (r <= 0) return card;
  }
  return pool[pool.length - 1];
}

let _nextInstanceId = 0;
function nextInstanceId(): string {
  return `ci_${++_nextInstanceId}`;
}

export function drawCard(game: GameState): GameState {
  if (game.playerHand.length >= 3) return game;
  const def = weightedRandomCard(game.playerHand);
  const instance: CardInstance = { instanceId: nextInstanceId(), definitionId: def.id };
  return {
    ...game,
    playerHand: [...game.playerHand, instance],
    lastCardDraw: game.elapsedSeconds,
    eventLog: [`カード「${def.name}」を手に入れた！`, ...game.eventLog].slice(0, 30),
  };
}

export function activateCard(
  game: GameState,
  instanceId: string,
  targetStateId?: string
): GameState {
  const instance = game.playerHand.find((c) => c.instanceId === instanceId);
  if (!instance) return game;
  const def = CARD_DEF_MAP[instance.definitionId];
  if (!def) return game;

  const newHand = game.playerHand.filter((c) => c.instanceId !== instanceId);
  let g: GameState = { ...game, playerHand: newHand };

  g = applyCardEffect(g, def, targetStateId);
  g = { ...g, eventLog: [`「${def.name}」を発動！`, ...g.eventLog].slice(0, 30) };
  return g;
}

function applyCardEffect(
  game: GameState,
  def: CardDefinition,
  targetStateId?: string
): GameState {
  const now = game.elapsedSeconds;
  let states = { ...game.states };
  let effects: ActiveEffect[] = [...game.activeEffects];
  let playerFunds = game.playerFunds;
  let attacks = [...game.ongoingAttacks];

  switch (def.id) {
    case "nuclear_intimidation": {
      if (!targetStateId) break;
      const t = states[targetStateId];
      if (!t) break;
      states = { ...states, [targetStateId]: { ...t, troops: t.troops * 0.5 } };
      break;
    }
    case "revolution_export": {
      if (!targetStateId) break;
      const expiresAt = now + 30;
      effects = effects.filter((e) => !(e.type === "revolution_export" && e.stateId === targetStateId));
      effects.push({ type: "revolution_export", stateId: targetStateId, expiresAt });
      const t = states[targetStateId];
      if (t) states = { ...states, [targetStateId]: { ...t, neutralizedUntil: expiresAt } };
      break;
    }
    case "total_war":
      effects = effects.filter((e) => !(e.type === "total_war" && e.nationId === game.playerNationId));
      effects.push({ type: "total_war", nationId: game.playerNationId, expiresAt: now + 30 });
      break;

    case "mountain_pass": {
      if (!targetStateId) break;
      effects = effects.filter((e) => !(e.type === "terrain_override" && e.stateId === targetStateId));
      effects.push({ type: "terrain_override", stateId: targetStateId, expiresAt: now + 60, terrain: "plains" });
      break;
    }
    case "rapid_reinforcement": {
      if (!targetStateId) break;
      const t = states[targetStateId];
      if (!t) break;
      states = { ...states, [targetStateId]: { ...t, troops: Math.min(t.troops + 80, 500) } };
      break;
    }
    case "strategic_bombing": {
      if (!targetStateId) break;
      effects = effects.filter((e) => !(e.type === "terrain_override" && e.stateId === targetStateId));
      // industry boost のマイナス版は industry_override が必要だが簡易実装として supply_cut を流用
      effects.push({ type: "supply_cut", stateId: targetStateId, expiresAt: now + 45 });
      break;
    }
    case "supply_cut": {
      if (!targetStateId) break;
      effects = effects.filter((e) => !(e.type === "supply_cut" && e.stateId === targetStateId));
      effects.push({ type: "supply_cut", stateId: targetStateId, expiresAt: now + 30 });
      break;
    }
    case "coastal_fort":
    case "fortify": {
      if (!targetStateId) break;
      const multiplier = def.id === "coastal_fort" ? 2.0 : 1.5;
      const dur = def.id === "coastal_fort" ? 45 : 45;
      effects = effects.filter((e) => !(e.type === "fortify" && e.stateId === targetStateId));
      effects.push({ type: "fortify", stateId: targetStateId, expiresAt: now + dur, multiplier });
      break;
    }
    case "conscription": {
      if (!targetStateId) break;
      const t = states[targetStateId];
      if (!t) break;
      states = { ...states, [targetStateId]: { ...t, troops: Math.min(t.troops + 40, 500) } };
      break;
    }
    case "war_bonds":
      playerFunds += 200;
      break;
    case "industry_boost": {
      if (!targetStateId) break;
      effects = effects.filter((e) => !(e.type === "mobilization" && e.nationId === `__state_${targetStateId}`));
      effects.push({ type: "mobilization", nationId: `__state_${targetStateId}`, expiresAt: now + 30, bonus: 3 });
      break;
    }
    case "guerrilla": {
      if (!targetStateId) break;
      effects = effects.filter((e) => !(e.type === "fortify" && e.stateId === targetStateId));
      effects.push({ type: "fortify", stateId: targetStateId, expiresAt: now + 30, multiplier: 1.5 });
      break;
    }
    case "air_strike":
    case "spy_sabotage": {
      if (!targetStateId) break;
      const t = states[targetStateId];
      if (!t) break;
      const dmg = def.id === "air_strike" ? 30 : 20;
      states = { ...states, [targetStateId]: { ...t, troops: Math.max(1, t.troops - dmg) } };
      break;
    }
    case "mobilization":
      effects = effects.filter((e) => !(e.type === "mobilization" && e.nationId === game.playerNationId));
      effects.push({ type: "mobilization", nationId: game.playerNationId, expiresAt: now + 20, bonus: 2 });
      break;
    case "border_skirmish": {
      const playerNation = game.nations[game.playerNationId];
      if (!playerNation) break;
      let weakest: { id: string; troops: number } | null = null;
      for (const sid of playerNation.stateIds) {
        const stateDef = STATE_DEF_MAP[sid];
        if (!stateDef) continue;
        for (const nid of stateDef.neighbors) {
          const ns = states[nid];
          if (!ns || ns.ownerId === game.playerNationId) continue;
          // 戦争中の国の州のみ対象
          if (
            isDiplomaticPair(game.playerNationId, ns.ownerId) &&
            getRelationStatus(game, game.playerNationId, ns.ownerId) !== "war"
          ) {
            continue;
          }
          if (!weakest || ns.troops < weakest.troops) weakest = { id: nid, troops: ns.troops };
        }
      }
      if (weakest) {
        const alreadyAttacking = attacks.some((a) => a.targetStateId === weakest!.id);
        if (!alreadyAttacking) {
          let sourceId: string | null = null;
          for (const sid of playerNation.stateIds) {
            const stateDef2 = STATE_DEF_MAP[sid];
            if (stateDef2?.neighbors.includes(weakest.id)) { sourceId = sid; break; }
          }
          if (sourceId) {
            attacks.push({ attackerId: game.playerNationId, targetStateId: weakest.id, sourceStateId: sourceId });
            const t = states[weakest.id];
            if (t) states = { ...states, [weakest.id]: { ...t, underAttack: true, attackerId: game.playerNationId } };
          }
        }
      }
      break;
    }
    case "economic_aid": {
      const nation = game.nations[game.playerNationId];
      if (nation) playerFunds += nation.stateIds.length * 8;
      break;
    }
    case "blitzkrieg":
      effects = effects.filter((e) => !(e.type === "blitzkrieg" && e.nationId === game.playerNationId));
      effects.push({ type: "blitzkrieg", nationId: game.playerNationId, usesLeft: 1 });
      break;
    default:
      break;
  }

  return { ...game, states, activeEffects: effects, playerFunds, ongoingAttacks: attacks };
}
