import type { Terrain } from "./constants.js";

export type NationSpecialty = "defense" | "attack" | "mobility" | "economy" | "terrain" | "ambush";

export interface StateDefinition {
  id: string;
  name: string;
  terrain: Terrain;
  neighbors: string[];
  capitalOf?: string;
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

export const NATIONS_DEF: NationDefinition[] = ALL_NATIONS.map(
  ({ id, name, color, capitalStateId, specialty }) => ({ id, name, color, capitalStateId, specialty })
);

export const NATION_DEF_MAP: Record<string, NationDefinition> = Object.fromEntries(
  NATIONS_DEF.map((n) => [n.id, n])
);

export const STATES_DEF: StateDefinition[] = ALL_NATIONS.flatMap((n) => n.states);

export const STATE_DEF_MAP: Record<string, StateDefinition> = Object.fromEntries(
  STATES_DEF.map((s) => [s.id, s])
);

export const INITIAL_STATE_OWNERS: Record<string, string> = Object.fromEntries(
  ALL_NATIONS.flatMap((n) => n.states.map((s) => [s.id, n.id])),
);

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
