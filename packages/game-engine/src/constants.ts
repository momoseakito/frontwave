export type Terrain = "plains" | "mountains" | "coast" | "forest" | "capital";

export const TICK_MS = 100;
export const DELTA_SECONDS = TICK_MS / 1000;

export const ATTACKER_PENALTY = 0.75;

// 戦闘DPSのスケール係数。小さいほど戦闘が長引く
// 60兵力平野同士で約90秒かかる設定
export const COMBAT_DPS_SCALE = 0.08;

export const TERRAIN_DEFENSE: Record<Terrain, number> = {
  plains: 1.0,
  forest: 1.2,
  coast: 1.0,
  mountains: 1.5,
  capital: 2.0,
};

export const TROOP_REGEN_BASE = 1.5;
export const TROOP_REGEN_PER_LEVEL = 0.8;
export const MAX_TROOPS = 500;

export const INVEST_COSTS = [0, 0, 100, 250, 500, 1000] as const;

export const CARD_DRAW_INTERVAL = 30;
export const TIMER_LIMIT = 600;
export const HAND_SIZE = 3;

export const INITIAL_FUNDS = 80;
export const FUNDS_PER_STATE_PER_SECOND = 0.4;

export const AI_TICK_INTERVAL = 2;

// 序盤の不可侵期間（秒）。開始からこの秒数までは宣戦布告・同盟提案不可
export const PEACE_PERIOD_SECONDS = 30;

// 同盟提案の有効期限（秒）。これを超えると自動で消滅
export const ALLIANCE_PROPOSAL_TTL = 20;

// AIの宣戦布告判定の間隔（秒）。各AIはこの間隔で1回判定
export const AI_WAR_DECISION_INTERVAL = 8;

export const INITIAL_TROOPS_BY_TERRAIN: Record<Terrain, number> = {
  plains: 30,
  mountains: 45,
  coast: 25,
  forest: 35,
  capital: 60,
};
