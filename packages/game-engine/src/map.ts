import type { Terrain } from "./constants.js";

export type NationSpecialty = "defense" | "attack" | "mobility" | "economy" | "terrain" | "ambush";

export interface StateDefinition {
  id: string;
  name: string;
  terrain: Terrain;
  neighbors: string[];
  capitalOf?: string;
  isNeutral?: boolean;
  straitTo?: string[];
}

export interface NationDefinition {
  id: string;
  name: string;
  color: string;
  capitalStateId: string;
  specialty: NationSpecialty;
}

export interface NationConfig {
  id: string;
  name: string;
  color: string;
  capitalStateId: string;
  specialty: NationSpecialty;
  states: StateDefinition[];
}

import { empire } from "./nations/empire.js";
import { kingdom } from "./nations/kingdom.js";
import { federation } from "./nations/federation.js";
import { republic } from "./nations/republic.js";
import { holykingdom } from "./nations/holykingdom.js";
import { duchy } from "./nations/duchy.js";

const ALL_NATIONS: NationConfig[] = [
  empire,
  kingdom,
  federation,
  republic,
  holykingdom,
  duchy,
];

// 中立州（10州）: 各国境の要衝に配置
const NEUTRAL_STATES: StateDefinition[] = [
  { id: "neu_rhine",    name: "ライン回廊",     terrain: "plains",    isNeutral: true, neighbors: ["emp_westmark", "kgd_lorraine", "kgd_burgundy"] },
  { id: "neu_alps",     name: "アルプス山中",   terrain: "mountains", isNeutral: true, neighbors: ["emp_swabia", "rep_piedmont", "hol_aragon"] },
  { id: "neu_flanders", name: "フランドル",     terrain: "coast",     isNeutral: true, neighbors: ["emp_brabant", "kgd_artois"] },
  { id: "neu_baltic",   name: "バルト沿岸",     terrain: "coast",     isNeutral: true, neighbors: ["emp_prussia", "fed_gothland"], straitTo: ["fed_denmark"] },
  { id: "neu_adriatic", name: "アドリア海岸",   terrain: "coast",     isNeutral: true, neighbors: ["rep_venice", "dch_ragusa"], straitTo: ["dch_albania"] },
  { id: "neu_pyrenees", name: "ピレネー",       terrain: "mountains", isNeutral: true, neighbors: ["kgd_gascony", "hol_navarre"] },
  { id: "neu_bohemia",  name: "ボヘミア",       terrain: "mountains", isNeutral: true, neighbors: ["emp_saxony", "emp_austria", "dch_moravia"] },
  { id: "neu_danube",   name: "ドナウ平原",     terrain: "plains",    isNeutral: true, neighbors: ["emp_austria", "dch_hungary", "dch_moravia"] },
  { id: "neu_corsica",  name: "コルシカ",       terrain: "coast",     isNeutral: true, neighbors: [], straitTo: ["rep_genoa", "hol_sardinia"] },
];

export const NATIONS_DEF: NationDefinition[] = ALL_NATIONS.map(
  ({ id, name, color, capitalStateId, specialty }) => ({ id, name, color, capitalStateId, specialty })
);

export const NATION_DEF_MAP: Record<string, NationDefinition> = Object.fromEntries(
  NATIONS_DEF.map((n) => [n.id, n])
);

export const STATES_DEF: StateDefinition[] = [
  ...ALL_NATIONS.flatMap((n) => n.states),
  ...NEUTRAL_STATES,
];

export const STATE_DEF_MAP: Record<string, StateDefinition> = Object.fromEntries(
  STATES_DEF.map((s) => [s.id, s])
);

// 画像 (1900年代六大国体制) に合わせた中立州の塗り分け。
// state ID と isNeutral 自体は温存しつつ、見た目だけ各国に編入する。
const NEUTRAL_OWNER_OVERRIDES: Record<string, string> = {
  neu_rhine:    "kgd",  // ベネルクス → Iberia-France 領
  neu_alps:     "rep",  // スイス → German-Austrian 領
  neu_flanders: "fed",  // ウェールズ → British-Nordic 領
  neu_baltic:   "emp",  // バルト三国 → Russian 領
  neu_adriatic: "hol",  // ボスニア → Österreichisches Reich 領
  neu_pyrenees: "fed",  // 英国北部+スコットランド+北アイルランド → British-Nordic 領
  neu_bohemia:  "emp",  // ポーランド+ベラルーシ → Russian 領
  neu_danube:   "emp",  // スロバキア+ウクライナ → Russian 領
  neu_corsica:  "kgd",  // コルシカ → Iberia-France 領
};

export const INITIAL_STATE_OWNERS: Record<string, string> = {
  ...Object.fromEntries(ALL_NATIONS.flatMap((n) => n.states.map((s) => [s.id, n.id]))),
  ...Object.fromEntries(NEUTRAL_STATES.map((s) => [s.id, NEUTRAL_OWNER_OVERRIDES[s.id] ?? "neutral"])),
};

// 隣接グラフの双方向整合性を検証するユーティリティ（開発用）
export function validateNeighborGraph(): string[] {
  const errors: string[] = [];
  for (const state of STATES_DEF) {
    for (const neighborId of state.neighbors) {
      const neighbor = STATE_DEF_MAP[neighborId];
      if (!neighbor) {
        errors.push(`${state.id}: neighbor "${neighborId}" が存在しません`);
        continue;
      }
      if (!neighbor.neighbors.includes(state.id)) {
        errors.push(`${state.id} → ${neighborId} は一方向のみ（${neighborId} に ${state.id} がない）`);
      }
    }
  }
  return errors;
}
