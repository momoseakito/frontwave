import type { GameState, CardInstance, ActiveEffect } from "./game.js";
import { getMaxTroops } from "./game.js";
import { STATE_DEF_MAP } from "./map.js";
import { getRelationStatus, isDiplomaticPair } from "./diplomacy.js";
import { DRAFT_CHOICES, HAND_SIZE } from "./constants.js";

export interface CardDefinition {
  id: string;
  nationId: string;
  name: string;
  description: string;
  needsTarget: boolean;
  targetType?: "enemy_state" | "own_state" | "any_state";
}

// ---- 72枚カード定義（各国12枚） ----

export const CARDS_DEF: CardDefinition[] = [
  // ===== 帝国 (emp) 防衛特化 =====
  { id: "emp_iron_walls",       nationId: "emp", name: "鉄壁の城壁",   description: "自州の防衛力+50%（60秒）",                          needsTarget: true,  targetType: "own_state" },
  { id: "emp_heavy_infantry",   nationId: "emp", name: "重装歩兵",     description: "攻撃時の損耗-15%（電撃戦効果60秒）",                 needsTarget: false },
  { id: "emp_fortification",    nationId: "emp", name: "州の要塞化",   description: "対象州を山岳地形に恒久変更",                         needsTarget: true,  targetType: "own_state" },
  { id: "emp_supply_restore",   nationId: "emp", name: "補給路確保",   description: "自国全州の補給遮断を解除",                           needsTarget: false },
  { id: "emp_conscription",     nationId: "emp", name: "帝国の徴兵",   description: "全自州に兵力+500（分散）",                           needsTarget: false },
  { id: "emp_border_guard",     nationId: "emp", name: "国境警備",     description: "敵隣接州すべての防衛+25%（45秒）",                   needsTarget: false },
  { id: "emp_alliance_support", nationId: "emp", name: "軍事同盟強化", description: "同盟国の全州に防衛+20%（45秒）",                     needsTarget: false },
  { id: "emp_elite_guard",      nationId: "emp", name: "精鋭近衛隊",   description: "首都州の防衛+100%（60秒）",                          needsTarget: false },
  { id: "emp_logistics",        nationId: "emp", name: "兵站改革",     description: "開発時間-50%（120秒）",                              needsTarget: false },
  { id: "emp_discipline",       nationId: "emp", name: "鋼の規律",     description: "兵力再生+50%（30秒）",                               needsTarget: false },
  { id: "emp_scorched_earth",   nationId: "emp", name: "焦土作戦",     description: "自州の兵力を0にして敵州の生産力を90秒停止",           needsTarget: true,  targetType: "own_state" },
  { id: "emp_prestige",         nationId: "emp", name: "帝国の威信",   description: "中立州への侵攻時に相手兵力-20%（60秒）",             needsTarget: false },

  // ===== 王国 (kgd) 攻撃特化 =====
  { id: "kgd_cavalry_charge",   nationId: "kgd", name: "騎兵突撃",     description: "攻撃力+25%（60秒）",                                 needsTarget: false },
  { id: "kgd_blitzkrieg",       nationId: "kgd", name: "電撃戦",       description: "次の攻撃のペナルティ無効化",                         needsTarget: false },
  { id: "kgd_royal_decree",     nationId: "kgd", name: "王の檄文",     description: "全軍の攻撃力+30%（60秒）",                           needsTarget: false },
  { id: "kgd_expedition",       nationId: "kgd", name: "遠征軍編成",   description: "遠征時の損耗-20%（60秒）",                           needsTarget: false },
  { id: "kgd_frontline_supply", nationId: "kgd", name: "前線補給",     description: "攻撃中の州に兵力+300即時追加",                       needsTarget: true,  targetType: "own_state" },
  { id: "kgd_encirclement",     nationId: "kgd", name: "包囲戦術",     description: "自州すべての攻撃DPS+20%（45秒）",                    needsTarget: false },
  { id: "kgd_mercenaries",      nationId: "kgd", name: "傭兵雇用",     description: "対象自州に+500兵力即時追加",                         needsTarget: true,  targetType: "own_state" },
  { id: "kgd_royal_pride",      nationId: "kgd", name: "王国の誇り",   description: "首都州からの攻撃DPS+30%（60秒）",                    needsTarget: false },
  { id: "kgd_conquest_will",    nationId: "kgd", name: "征服の意志",   description: "次に占領した州の収入を即座に自国に組み込む（120秒）", needsTarget: false },
  { id: "kgd_knights_oath",     nationId: "kgd", name: "騎士団の誓い", description: "攻撃+20%・防衛+10%（60秒）",                         needsTarget: false },
  { id: "kgd_divide",          nationId: "kgd", name: "分断戦術",     description: "敵の隣接州間の補給を90秒遮断",                       needsTarget: true,  targetType: "enemy_state" },
  { id: "kgd_triumph",          nationId: "kgd", name: "勝利の凱歌",   description: "州占領のたびに攻撃+5%累積（90秒）",                  needsTarget: false },

  // ===== 連邦 (fed) 機動特化 =====
  { id: "fed_strait_cross",     nationId: "fed", name: "海峡越え",     description: "海峡ルートでの攻撃が可能（60秒）",                   needsTarget: false },
  { id: "fed_swift_war",        nationId: "fed", name: "速戦即決",     description: "移動時の兵力損耗-100%（30秒）",                      needsTarget: false },
  { id: "fed_northern_folk",    nationId: "fed", name: "北の民",       description: "山岳地形の全自州の防衛+30%（60秒）",                 needsTarget: false },
  { id: "fed_fleet_deploy",     nationId: "fed", name: "艦隊展開",     description: "海峡越えの移動速度2倍（60秒）＋海峡使用可",          needsTarget: false },
  { id: "fed_amphibious",       nationId: "fed", name: "奇襲上陸",     description: "海峡越え攻撃時に敵防衛-20%（60秒）",                 needsTarget: false },
  { id: "fed_scout_network",    nationId: "fed", name: "斥候網",       description: "全国家の兵力数を60秒可視化",                         needsTarget: false },
  { id: "fed_guerrilla",        nationId: "fed", name: "遊撃戦術",     description: "少数時でも損耗率-20%（60秒）",                       needsTarget: false },
  { id: "fed_north_sea",        nationId: "fed", name: "北海の覇者",   description: "海岸州の生産速度2倍（45秒）",                        needsTarget: false },
  { id: "fed_pillage",          nationId: "fed", name: "略奪",         description: "次の占領時に金貨+300獲得",                           needsTarget: false },
  { id: "fed_iron_fleet",       nationId: "fed", name: "鉄の船団",     description: "海峡越え使用可＋全海岸州攻撃+15%（60秒）",           needsTarget: false },
  { id: "fed_retreat",          nationId: "fed", name: "撤退戦術",     description: "攻撃中の自軍を即座に撤退（損耗-50%）",               needsTarget: true,  targetType: "own_state" },
  { id: "fed_alliance_shield",  nationId: "fed", name: "同盟の盾",     description: "同盟国の全海岸州に防衛+30%（60秒）",                 needsTarget: false },

  // ===== 共和国 (rep) 経済特化 =====
  { id: "rep_trade_route",      nationId: "rep", name: "交易路開設",   description: "全自州の金貨収入+50%（60秒）",                       needsTarget: false },
  { id: "rep_banking",          nationId: "rep", name: "銀行制度",     description: "州開発コスト-25%（120秒）",                          needsTarget: false },
  { id: "rep_mercenary_market", nationId: "rep", name: "傭兵市場",     description: "傭兵雇用コスト-50%（次の1回）",                      needsTarget: false },
  { id: "rep_commercial_net",   nationId: "rep", name: "商業ネット",   description: "占領州の生産力即座に+1Lv（60秒）",                   needsTarget: false },
  { id: "rep_investment",       nationId: "rep", name: "投資政策",     description: "自州を即時無料でLvUp",                               needsTarget: true,  targetType: "own_state" },
  { id: "rep_diplomacy",        nationId: "rep", name: "外交献金",     description: "資金+500獲得",                                       needsTarget: false },
  { id: "rep_spy_network",      nationId: "rep", name: "密偵網",       description: "全国家の金貨残高を60秒可視化",                       needsTarget: false },
  { id: "rep_blockade",         nationId: "rep", name: "経済封鎖",     description: "対象国の金貨収入を60秒停止",                         needsTarget: true,  targetType: "enemy_state" },
  { id: "rep_arms_industry",    nationId: "rep", name: "軍需産業",     description: "兵力生産+15%・攻撃+10%（45秒）",                     needsTarget: false },
  { id: "rep_harbor_city",      nationId: "rep", name: "港湾都市",     description: "自海岸州の金貨収入+3/秒（永続）",                    needsTarget: true,  targetType: "own_state" },
  { id: "rep_militia",          nationId: "rep", name: "民兵動員",     description: "防衛中の自州に+300兵力即時",                         needsTarget: true,  targetType: "own_state" },
  { id: "rep_solidarity",       nationId: "rep", name: "共和国の結束", description: "州数が少ないほど防衛+最大40%（60秒）",               needsTarget: false },

  // ===== 聖王国 (hol) 地形防衛特化 =====
  { id: "hol_mountain_fort",    nationId: "hol", name: "山岳要塞",     description: "山岳州の防衛+40%（永続）",                           needsTarget: true,  targetType: "own_state" },
  { id: "hol_crusade",          nationId: "hol", name: "聖戦の布告",   description: "攻撃+20%（60秒）",                                   needsTarget: false },
  { id: "hol_terrain_mastery",  nationId: "hol", name: "地の利",       description: "全州の地形防衛ボーナス2倍（60秒）",                  needsTarget: false },
  { id: "hol_impregnable",      nationId: "hol", name: "難攻不落",     description: "首都州を60秒間攻撃不可にする",                       needsTarget: false },
  { id: "hol_religious_unity",  nationId: "hol", name: "宗教的結束",   description: "兵力損耗-20%（60秒）",                               needsTarget: false },
  { id: "hol_guerrilla",        nationId: "hol", name: "ゲリラ戦術",   description: "防衛失敗時も兵力の50%が残存（60秒）",                needsTarget: true,  targetType: "own_state" },
  { id: "hol_holy_defense",     nationId: "hol", name: "聖地防衛",     description: "首都州の防衛+100%（90秒）",                          needsTarget: false },
  { id: "hol_uprising",         nationId: "hol", name: "民衆蜂起",     description: "占領された州で敵兵力を毎秒削る（60秒）",             needsTarget: true,  targetType: "any_state" },
  { id: "hol_stronghold",       nationId: "hol", name: "要害の地",     description: "全自州の防衛+15%（60秒）",                           needsTarget: false },
  { id: "hol_divine_shield",    nationId: "hol", name: "神の加護",     description: "自州への攻撃を30秒間30%の確率で無効化",              needsTarget: true,  targetType: "own_state" },
  { id: "hol_holy_knights",     nationId: "hol", name: "聖騎士団",     description: "防衛+30%・攻撃+15%（60秒）",                         needsTarget: false },
  { id: "hol_tenacity",         nationId: "hol", name: "不屈の民",     description: "自州の兵力が10以下になると自動で+200（1回）",         needsTarget: true,  targetType: "own_state" },

  // ===== 公国 (dch) 奇襲特化 =====
  { id: "dch_night_raid",       nationId: "dch", name: "闇夜の襲撃",   description: "対象敵州の防衛-30%（60秒）",                         needsTarget: true,  targetType: "enemy_state" },
  { id: "dch_sabotage",         nationId: "dch", name: "破壊工作",     description: "対象州の生産力を90秒停止",                           needsTarget: true,  targetType: "enemy_state" },
  { id: "dch_infiltrate",       nationId: "dch", name: "間諜潜入",     description: "敵の国家方針カードを1枚無効化（ランダム）",           needsTarget: false },
  { id: "dch_nomadic",          nationId: "dch", name: "遊牧の民",     description: "攻撃+20%・損耗-10%（60秒）",                         needsTarget: false },
  { id: "dch_pillage_tactic",   nationId: "dch", name: "略奪戦術",     description: "次の占領時に兵力+300・金貨+200",                     needsTarget: false },
  { id: "dch_poison_arrow",     nationId: "dch", name: "毒の矢",       description: "対象州の兵力を毎秒3ずつ30秒間削る",                  needsTarget: true,  targetType: "enemy_state" },
  { id: "dch_divide_work",      nationId: "dch", name: "分断工作",     description: "対象国の進行中の攻撃を1件キャンセル",                needsTarget: false },
  { id: "dch_shadow_legion",    nationId: "dch", name: "影の軍団",     description: "攻撃+100%（ただし自州兵力の50%だけ適用60秒）",       needsTarget: false },
  { id: "dch_backstab",         nationId: "dch", name: "背後からの一刺し", description: "交戦中の敵州の兵力を40%即時削る",               needsTarget: true,  targetType: "enemy_state" },
  { id: "dch_terror",           nationId: "dch", name: "恐怖政治",     description: "占領州から敵兵を追い出し即座に生産開始（60秒）",     needsTarget: false },
  { id: "dch_desert_storm",     nationId: "dch", name: "砂漠の嵐",     description: "全敵海岸州の兵力を30%削る",                          needsTarget: false },
  { id: "dch_chaos",            nationId: "dch", name: "混乱の種",     description: "対象国のAIを60秒間混乱させ行動不能",                 needsTarget: false },
];

export const CARD_DEF_MAP: Record<string, CardDefinition> = Object.fromEntries(
  CARDS_DEF.map((c) => [c.id, c])
);

let _nextInstanceId = 0;
function nextInstanceId(): string {
  return `ci_${++_nextInstanceId}`;
}

export function getNationCardPool(nationId: string): CardDefinition[] {
  return CARDS_DEF.filter((c) => c.nationId === nationId);
}

function shuffleAndTake<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, n);
}

export function drawDraftChoices(game: GameState): CardInstance[] {
  const pool = getNationCardPool(game.playerNationId);
  const handDefIds = new Set(game.playerHand.map((c) => c.definitionId));
  const available = pool.filter((c) => !handDefIds.has(c.id));
  if (available.length === 0) return [];
  const chosen = shuffleAndTake(available, Math.min(DRAFT_CHOICES, available.length));
  return chosen.map((def) => ({ instanceId: nextInstanceId(), definitionId: def.id }));
}

export function selectDraftCard(game: GameState, instanceId: string): GameState {
  if (!game.cardDraftPending) return game;
  const choice = game.cardDraftChoices.find((c) => c.instanceId === instanceId);
  if (!choice) return game;
  if (game.playerHand.length >= HAND_SIZE) return game;

  const def = CARD_DEF_MAP[choice.definitionId];
  return {
    ...game,
    playerHand: [...game.playerHand, choice],
    cardDraftPending: false,
    cardDraftChoices: [],
    lastCardDraw: game.elapsedSeconds,
    eventLog: [`カード「${def?.name ?? choice.definitionId}」を選択！`, ...game.eventLog].slice(0, 30),
  };
}

export function skipDraft(game: GameState): GameState {
  if (!game.cardDraftPending) return game;
  return {
    ...game,
    cardDraftPending: false,
    cardDraftChoices: [],
    lastCardDraw: game.elapsedSeconds,
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
    // ===== 帝国 =====
    case "emp_iron_walls": {
      if (!targetStateId) break;
      effects = effects.filter((e) => !(e.type === "fortify" && e.stateId === targetStateId));
      effects.push({ type: "fortify", stateId: targetStateId, expiresAt: now + 60, multiplier: 1.5 });
      break;
    }
    case "emp_heavy_infantry":
      effects = effects.filter((e) => !(e.type === "blitzkrieg" && e.nationId === game.playerNationId));
      effects.push({ type: "blitzkrieg", nationId: game.playerNationId, usesLeft: 3 });
      break;
    case "emp_fortification": {
      if (!targetStateId) break;
      const s = states[targetStateId];
      if (!s || s.ownerId !== game.playerNationId) break;
      effects = effects.filter((e) => !(e.type === "terrain_upgrade" && e.stateId === targetStateId));
      effects.push({ type: "terrain_upgrade", stateId: targetStateId, permanentTerrain: "mountains" });
      break;
    }
    case "emp_supply_restore": {
      effects = effects.filter(
        (e) => !(e.type === "supply_cut" && game.states[e.stateId]?.ownerId === game.playerNationId)
      );
      break;
    }
    case "emp_conscription": {
      const nation = game.nations[game.playerNationId];
      if (!nation) break;
      const perState = Math.floor(500 / Math.max(1, nation.stateIds.length));
      for (const sid of nation.stateIds) {
        const s = states[sid];
        if (!s) continue;
        const def2 = STATE_DEF_MAP[sid];
        const isCapital = def2?.capitalOf !== undefined;
        const maxT = getMaxTroops(s.industryLevel, isCapital);
        states[sid] = { ...s, troops: Math.min(s.troops + perState, maxT) };
      }
      break;
    }
    case "emp_border_guard": {
      const playerNation = game.nations[game.playerNationId];
      if (!playerNation) break;
      const enemyAdjacentStates = new Set<string>();
      for (const sid of playerNation.stateIds) {
        const d = STATE_DEF_MAP[sid];
        if (!d) continue;
        for (const nid of d.neighbors) {
          const ns = states[nid];
          if (ns && ns.ownerId !== game.playerNationId && ns.ownerId !== "neutral") {
            // 自州に防衛ブースト
            effects = effects.filter((e) => !(e.type === "fortify" && e.stateId === sid));
            if (!enemyAdjacentStates.has(sid)) {
              effects.push({ type: "fortify", stateId: sid, expiresAt: now + 45, multiplier: 1.25 });
              enemyAdjacentStates.add(sid);
            }
          }
        }
      }
      break;
    }
    case "emp_alliance_support": {
      const allies = Object.values(game.diplomaticRelations)
        .filter((r) => r.status === "ally" && (r.nationA === game.playerNationId || r.nationB === game.playerNationId))
        .map((r) => (r.nationA === game.playerNationId ? r.nationB : r.nationA));
      for (const allyId of allies) {
        const allyNation = game.nations[allyId];
        if (!allyNation) continue;
        for (const sid of allyNation.stateIds) {
          effects = effects.filter((e) => !(e.type === "fortify" && e.stateId === sid));
          effects.push({ type: "fortify", stateId: sid, expiresAt: now + 45, multiplier: 1.2 });
        }
      }
      break;
    }
    case "emp_elite_guard": {
      const nation = game.nations[game.playerNationId];
      if (!nation) break;
      const capitalDef = STATE_DEF_MAP[`emp_capital`];
      const capitalId = nation.stateIds.find((sid) => STATE_DEF_MAP[sid]?.capitalOf === game.playerNationId);
      if (!capitalId) break;
      effects = effects.filter((e) => !(e.type === "fortify" && e.stateId === capitalId));
      effects.push({ type: "fortify", stateId: capitalId, expiresAt: now + 60, multiplier: 2.0 });
      break;
    }
    case "emp_logistics":
      effects = effects.filter((e) => !(e.type === "mobilization" && e.nationId === `__upgrade_speed_${game.playerNationId}`));
      effects.push({ type: "mobilization", nationId: `__upgrade_speed_${game.playerNationId}`, expiresAt: now + 120, bonus: 0 });
      break;
    case "emp_discipline":
      effects = effects.filter((e) => !(e.type === "mobilization" && e.nationId === game.playerNationId));
      effects.push({ type: "mobilization", nationId: game.playerNationId, expiresAt: now + 30, bonus: 5 });
      break;
    case "emp_scorched_earth": {
      if (!targetStateId) break;
      const s = states[targetStateId];
      if (!s || s.ownerId !== game.playerNationId) break;
      states[targetStateId] = { ...s, troops: 0 };
      // 対象周囲の敵州を補給遮断
      const d = STATE_DEF_MAP[targetStateId];
      if (d) {
        for (const nid of d.neighbors) {
          const ns = states[nid];
          if (ns && ns.ownerId !== game.playerNationId) {
            effects.push({ type: "supply_cut", stateId: nid, expiresAt: now + 90 });
          }
        }
      }
      break;
    }
    case "emp_prestige":
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 60, multiplier: 1.2 });
      break;

    // ===== 王国 =====
    case "kgd_cavalry_charge":
      effects = effects.filter((e) => !(e.type === "attack_boost" && e.nationId === game.playerNationId));
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 60, multiplier: 1.25 });
      break;
    case "kgd_blitzkrieg":
      effects = effects.filter((e) => !(e.type === "blitzkrieg" && e.nationId === game.playerNationId));
      effects.push({ type: "blitzkrieg", nationId: game.playerNationId, usesLeft: 1 });
      break;
    case "kgd_royal_decree":
      effects = effects.filter((e) => !(e.type === "attack_boost" && e.nationId === game.playerNationId));
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 60, multiplier: 1.3 });
      break;
    case "kgd_expedition":
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 60, multiplier: 1.1 });
      break;
    case "kgd_frontline_supply": {
      if (!targetStateId) break;
      const s = states[targetStateId];
      if (!s || s.ownerId !== game.playerNationId) break;
      const d = STATE_DEF_MAP[targetStateId];
      const isCapital = d?.capitalOf !== undefined;
      const maxT = getMaxTroops(s.industryLevel, isCapital);
      states[targetStateId] = { ...s, troops: Math.min(s.troops + 300, maxT) };
      break;
    }
    case "kgd_encirclement":
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 45, multiplier: 1.2 });
      break;
    case "kgd_mercenaries": {
      if (!targetStateId) break;
      const s = states[targetStateId];
      if (!s || s.ownerId !== game.playerNationId) break;
      const d = STATE_DEF_MAP[targetStateId];
      const isCapital = d?.capitalOf !== undefined;
      const maxT = getMaxTroops(s.industryLevel, isCapital);
      states[targetStateId] = { ...s, troops: Math.min(s.troops + 500, maxT) };
      break;
    }
    case "kgd_royal_pride":
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 60, multiplier: 1.3 });
      break;
    case "kgd_conquest_will":
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 120, multiplier: 1.0 });
      break;
    case "kgd_knights_oath":
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 60, multiplier: 1.2 });
      break;
    case "kgd_divide": {
      if (!targetStateId) break;
      const t = states[targetStateId];
      if (!t) break;
      const d = STATE_DEF_MAP[targetStateId];
      if (d) {
        for (const nid of d.neighbors) {
          const ns = states[nid];
          if (ns && ns.ownerId === t.ownerId) {
            effects.push({ type: "supply_cut", stateId: nid, expiresAt: now + 90 });
          }
        }
      }
      break;
    }
    case "kgd_triumph":
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 90, multiplier: 1.05 });
      break;

    // ===== 連邦 =====
    case "fed_strait_cross":
      effects = effects.filter((e) => !(e.type === "strait_crossing_enabled" && e.nationId === game.playerNationId));
      effects.push({ type: "strait_crossing_enabled", nationId: game.playerNationId, expiresAt: now + 60 });
      break;
    case "fed_swift_war":
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 30, multiplier: 1.0 });
      break;
    case "fed_northern_folk": {
      const nation = game.nations[game.playerNationId];
      if (!nation) break;
      for (const sid of nation.stateIds) {
        const d = STATE_DEF_MAP[sid];
        if (d?.terrain === "mountains") {
          effects.push({ type: "fortify", stateId: sid, expiresAt: now + 60, multiplier: 1.3 });
        }
      }
      break;
    }
    case "fed_fleet_deploy":
      effects.push({ type: "strait_crossing_enabled", nationId: game.playerNationId, expiresAt: now + 60 });
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 60, multiplier: 1.1 });
      break;
    case "fed_amphibious":
      effects.push({ type: "strait_crossing_enabled", nationId: game.playerNationId, expiresAt: now + 60 });
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 60, multiplier: 1.2 });
      break;
    case "fed_scout_network":
      // UI側で全国家の兵力可視化（エフェクト記録）
      effects.push({ type: "mobilization", nationId: `__scout_${game.playerNationId}`, expiresAt: now + 60, bonus: 0 });
      break;
    case "fed_guerrilla":
      effects.push({ type: "mobilization", nationId: game.playerNationId, expiresAt: now + 60, bonus: 2 });
      break;
    case "fed_north_sea": {
      const nation = game.nations[game.playerNationId];
      if (!nation) break;
      for (const sid of nation.stateIds) {
        const d = STATE_DEF_MAP[sid];
        if (d?.terrain === "coast") {
          effects.push({ type: "mobilization", nationId: `__state_${sid}`, expiresAt: now + 45, bonus: 5 });
        }
      }
      break;
    }
    case "fed_pillage":
      playerFunds += 300; // 次の占領時付与の簡易実装として即時付与
      break;
    case "fed_iron_fleet":
      effects.push({ type: "strait_crossing_enabled", nationId: game.playerNationId, expiresAt: now + 60 });
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 60, multiplier: 1.15 });
      break;
    case "fed_retreat": {
      if (!targetStateId) break;
      // 対象自州への攻撃をキャンセル
      const attackOnTarget = attacks.find((a) => a.sourceStateId === targetStateId);
      if (attackOnTarget) {
        const tgt = states[attackOnTarget.targetStateId];
        if (tgt) states[attackOnTarget.targetStateId] = { ...tgt, underAttack: false, attackerId: null };
        attacks = attacks.filter((a) => a.sourceStateId !== targetStateId);
      }
      break;
    }
    case "fed_alliance_shield": {
      const allies = Object.values(game.diplomaticRelations)
        .filter((r) => r.status === "ally" && (r.nationA === game.playerNationId || r.nationB === game.playerNationId))
        .map((r) => (r.nationA === game.playerNationId ? r.nationB : r.nationA));
      for (const allyId of allies) {
        const allyNation = game.nations[allyId];
        if (!allyNation) continue;
        for (const sid of allyNation.stateIds) {
          const d = STATE_DEF_MAP[sid];
          if (d?.terrain === "coast") {
            effects.push({ type: "fortify", stateId: sid, expiresAt: now + 60, multiplier: 1.3 });
          }
        }
      }
      break;
    }

    // ===== 共和国 =====
    case "rep_trade_route":
      effects.push({ type: "mobilization", nationId: `__gold_boost_${game.playerNationId}`, expiresAt: now + 60, bonus: 0 });
      playerFunds += game.nations[game.playerNationId]?.stateIds.length ?? 0;
      break;
    case "rep_banking":
      effects.push({ type: "mobilization", nationId: `__discount_${game.playerNationId}`, expiresAt: now + 120, bonus: 0 });
      break;
    case "rep_mercenary_market":
      playerFunds += 200;
      break;
    case "rep_commercial_net":
      effects.push({ type: "mobilization", nationId: `__commercial_${game.playerNationId}`, expiresAt: now + 60, bonus: 0 });
      break;
    case "rep_investment": {
      if (!targetStateId) break;
      const s = states[targetStateId];
      if (!s || s.ownerId !== game.playerNationId || s.industryLevel >= 5 || s.upgradeInProgress) break;
      states[targetStateId] = { ...s, industryLevel: s.industryLevel + 1 };
      break;
    }
    case "rep_diplomacy":
      playerFunds += 500;
      break;
    case "rep_spy_network":
      effects.push({ type: "mobilization", nationId: `__spy_net_${game.playerNationId}`, expiresAt: now + 60, bonus: 0 });
      break;
    case "rep_blockade": {
      if (!targetStateId) break;
      const t = states[targetStateId];
      if (!t || t.ownerId === game.playerNationId) break;
      effects.push({ type: "economic_blockade", nationId: t.ownerId, expiresAt: now + 60 });
      break;
    }
    case "rep_arms_industry":
      effects.push({ type: "mobilization", nationId: game.playerNationId, expiresAt: now + 45, bonus: 3 });
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 45, multiplier: 1.1 });
      break;
    case "rep_harbor_city": {
      if (!targetStateId) break;
      const s = states[targetStateId];
      if (!s || s.ownerId !== game.playerNationId) break;
      const d = STATE_DEF_MAP[targetStateId];
      if (d?.terrain !== "coast") break;
      // 永続的な収入ブースト（mobilizationの__gold_state_ prefix使用）
      effects.push({ type: "mobilization", nationId: `__gold_state_${targetStateId}`, expiresAt: now + 86400, bonus: 3 });
      break;
    }
    case "rep_militia": {
      if (!targetStateId) break;
      const s = states[targetStateId];
      if (!s || s.ownerId !== game.playerNationId) break;
      const d = STATE_DEF_MAP[targetStateId];
      const isCapital = d?.capitalOf !== undefined;
      const maxT = getMaxTroops(s.industryLevel, isCapital);
      states[targetStateId] = { ...s, troops: Math.min(s.troops + 300, maxT) };
      break;
    }
    case "rep_solidarity": {
      const nation = game.nations[game.playerNationId];
      if (!nation) break;
      const totalStates = Object.keys(game.states).length;
      const ratio = 1 - (nation.stateIds.length / totalStates);
      const bonus = Math.min(0.4, ratio * 0.8);
      for (const sid of nation.stateIds) {
        effects.push({ type: "fortify", stateId: sid, expiresAt: now + 60, multiplier: 1 + bonus });
      }
      break;
    }

    // ===== 聖王国 =====
    case "hol_mountain_fort": {
      if (!targetStateId) break;
      const s = states[targetStateId];
      if (!s || s.ownerId !== game.playerNationId) break;
      const d = STATE_DEF_MAP[targetStateId];
      if (d?.terrain !== "mountains" && d?.terrain !== "capital") {
        effects.push({ type: "terrain_upgrade", stateId: targetStateId, permanentTerrain: "mountains" });
      }
      effects.push({ type: "fortify", stateId: targetStateId, expiresAt: now + 86400, multiplier: 1.4 });
      break;
    }
    case "hol_crusade":
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 60, multiplier: 1.2 });
      break;
    case "hol_terrain_mastery": {
      const nation = game.nations[game.playerNationId];
      if (!nation) break;
      for (const sid of nation.stateIds) {
        effects.push({ type: "fortify", stateId: sid, expiresAt: now + 60, multiplier: 1.3 });
      }
      break;
    }
    case "hol_impregnable": {
      const nation = game.nations[game.playerNationId];
      const capitalId = nation?.stateIds.find((sid) => STATE_DEF_MAP[sid]?.capitalOf === game.playerNationId);
      if (!capitalId) break;
      effects.push({ type: "fortify", stateId: capitalId, expiresAt: now + 60, multiplier: 3.0 });
      break;
    }
    case "hol_religious_unity": {
      const nation = game.nations[game.playerNationId];
      if (!nation) break;
      for (const sid of nation.stateIds) {
        effects.push({ type: "fortify", stateId: sid, expiresAt: now + 60, multiplier: 1.2 });
      }
      break;
    }
    case "hol_guerrilla": {
      if (!targetStateId) break;
      effects.push({ type: "fortify", stateId: targetStateId, expiresAt: now + 60, multiplier: 1.5 });
      break;
    }
    case "hol_holy_defense": {
      const nation = game.nations[game.playerNationId];
      const capitalId = nation?.stateIds.find((sid) => STATE_DEF_MAP[sid]?.capitalOf === game.playerNationId);
      if (!capitalId) break;
      effects.push({ type: "holy_defense_trigger", stateId: capitalId, expiresAt: now + 90 });
      effects.push({ type: "fortify", stateId: capitalId, expiresAt: now + 90, multiplier: 2.0 });
      break;
    }
    case "hol_uprising": {
      if (!targetStateId) break;
      effects.push({ type: "poison_dot", stateId: targetStateId, expiresAt: now + 60, dpsPerSecond: 2 });
      break;
    }
    case "hol_stronghold": {
      const nation = game.nations[game.playerNationId];
      if (!nation) break;
      for (const sid of nation.stateIds) {
        effects.push({ type: "fortify", stateId: sid, expiresAt: now + 60, multiplier: 1.15 });
      }
      break;
    }
    case "hol_divine_shield": {
      if (!targetStateId) break;
      effects.push({ type: "fortify", stateId: targetStateId, expiresAt: now + 30, multiplier: 1.3 });
      break;
    }
    case "hol_holy_knights":
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 60, multiplier: 1.15 });
      effects.push({ type: "mobilization", nationId: game.playerNationId, expiresAt: now + 60, bonus: 3 });
      break;
    case "hol_tenacity": {
      if (!targetStateId) break;
      const s = states[targetStateId];
      if (!s || s.ownerId !== game.playerNationId) break;
      if (s.troops <= 10) {
        const d = STATE_DEF_MAP[targetStateId];
        const isCapital = d?.capitalOf !== undefined;
        const maxT = getMaxTroops(s.industryLevel, isCapital);
        states[targetStateId] = { ...s, troops: Math.min(s.troops + 200, maxT) };
      }
      break;
    }

    // ===== 公国 =====
    case "dch_night_raid": {
      if (!targetStateId) break;
      effects.push({ type: "fortify", stateId: targetStateId, expiresAt: now + 60, multiplier: 0.7 });
      break;
    }
    case "dch_sabotage": {
      if (!targetStateId) break;
      effects.push({ type: "supply_cut", stateId: targetStateId, expiresAt: now + 90 });
      break;
    }
    case "dch_infiltrate": {
      // AIの手札をランダムに1枚削除（簡易実装: 敵国のアクティブエフェクトを1件削除）
      const enemyNations = Object.values(game.nations).filter(
        (n) => n.id !== game.playerNationId && n.isAlive
      );
      if (enemyNations.length > 0) {
        const target2 = enemyNations[Math.floor(Math.random() * enemyNations.length)];
        const targetEffect = effects.find((e) => "nationId" in e && (e as { nationId: string }).nationId === target2?.id);
        if (targetEffect) {
          effects = effects.filter((e) => e !== targetEffect);
        }
      }
      break;
    }
    case "dch_nomadic":
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 60, multiplier: 1.2 });
      break;
    case "dch_pillage_tactic":
      playerFunds += 200;
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 60, multiplier: 1.0 });
      break;
    case "dch_poison_arrow": {
      if (!targetStateId) break;
      effects.push({ type: "poison_dot", stateId: targetStateId, expiresAt: now + 30, dpsPerSecond: 3 });
      break;
    }
    case "dch_divide_work": {
      const enemyAttacks = attacks.filter((a) => a.attackerId !== game.playerNationId);
      if (enemyAttacks.length > 0) {
        const cancelTarget = enemyAttacks[Math.floor(Math.random() * enemyAttacks.length)]!;
        const t = states[cancelTarget.targetStateId];
        if (t) states[cancelTarget.targetStateId] = { ...t, underAttack: false, attackerId: null };
        attacks = attacks.filter((a) => a !== cancelTarget);
      }
      break;
    }
    case "dch_shadow_legion":
      effects.push({ type: "attack_boost", nationId: game.playerNationId, expiresAt: now + 60, multiplier: 2.0 });
      break;
    case "dch_backstab": {
      if (!targetStateId) break;
      const t = states[targetStateId];
      if (!t || t.ownerId === game.playerNationId) break;
      const isUnderAttack = attacks.some((a) => a.targetStateId === targetStateId);
      const multiplier = isUnderAttack ? 0.4 : 0.2;
      states[targetStateId] = { ...t, troops: Math.max(1, t.troops * (1 - multiplier)) };
      break;
    }
    case "dch_terror":
      effects.push({ type: "mobilization", nationId: game.playerNationId, expiresAt: now + 60, bonus: 3 });
      break;
    case "dch_desert_storm": {
      for (const [sid, s] of Object.entries(states)) {
        if (s.ownerId === game.playerNationId) continue;
        const d = STATE_DEF_MAP[sid];
        if (d?.terrain === "coast") {
          states[sid] = { ...s, troops: s.troops * 0.7 };
        }
      }
      break;
    }
    case "dch_chaos": {
      const enemyNationIds = Object.values(game.nations)
        .filter((n) => n.id !== game.playerNationId && n.isAlive)
        .map((n) => n.id);
      if (enemyNationIds.length > 0) {
        const targetNationId = enemyNationIds[Math.floor(Math.random() * enemyNationIds.length)]!;
        effects.push({ type: "chaos", targetNationId, expiresAt: now + 60 });
      }
      break;
    }

    default:
      break;
  }

  return { ...game, states, activeEffects: effects, playerFunds, ongoingAttacks: attacks };
}
