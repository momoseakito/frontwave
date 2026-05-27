export type Terrain = "plains" | "mountains" | "coast" | "forest" | "capital";

export const TICK_MS = 100;
export const DELTA_SECONDS = TICK_MS / 1000;

// 戦闘係数（ランチェスターの法則）
export const ATTACKER_COEFFICIENT = 0.6;
export const DEFENDER_COEFFICIENT = 0.8;
export const CAPITAL_TROOP_MULTIPLIER = 2.0; // 首都攻略に必要な敵兵力比率

// 地形防衛倍率
export const TERRAIN_DEFENSE: Record<Terrain, number> = {
  plains: 1.0,
  forest: 1.2,
  coast: 1.0,
  mountains: 1.5,
  capital: 2.0,
};

// 兵力生産テーブル（Lv 0〜5）
export const TROOP_REGEN_BY_LEVEL = [0.5, 1, 2, 3.5, 5.5, 8] as const;
export const TROOP_MAX_BY_LEVEL = [500, 900, 1400, 2000, 2750, 3750] as const;
export const CAPITAL_BONUS_MULTIPLIER = 1.5; // 首都の生産・上限 +50%

// ゴールド収入テーブル（Lv 0〜5）
export const GOLD_INCOME_BY_LEVEL = [1, 2, 3, 5, 8, 12] as const;

// 州開発コスト [goldCost, timeSec]（Lv 1〜5）
export const UPGRADE_COSTS: [number, number][] = [
  [100, 30],
  [250, 60],
  [500, 120],
  [900, 210],
  [1500, 300],
];

// カードシステム
export const CARD_DRAW_INTERVAL = 60; // 1分ごとにドラフト
export const HAND_SIZE = 5;           // 手札上限
export const DRAFT_CHOICES = 3;       // ドラフト提示枚数

// ゲームモード
export const CASUAL_TIMER_DEFAULT = 1200; // 20分（カジュアルモードデフォルト）

// 同盟
export const MAX_ALLIANCES = 2;
export const ALLIANCE_BREAK_PENALTY_SEC = 180; // 3分
export const ALLIANCE_BREAK_ATTACK_MULT = 0.7; // 攻撃力 -30%

// その他
export const INITIAL_FUNDS = 200;
export const AI_TICK_INTERVAL = 2;
export const PEACE_PERIOD_SECONDS = 0;
export const ALLIANCE_PROPOSAL_TTL = 20;
export const AI_WAR_DECISION_INTERVAL = 8;

export const INITIAL_TROOPS_BY_TERRAIN: Record<Terrain, number> = {
  plains: 100,
  mountains: 150,
  coast: 75,
  forest: 125,
  capital: 250,
};
