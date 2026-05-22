import type { Terrain } from "./constants.js";

export interface StateDefinition {
  id: string;
  name: string;
  terrain: Terrain;
  neighbors: string[];
  capitalOf?: string;
}

export interface NationDefinition {
  id: string;
  name: string;
  color: string;
  capitalStateId: string;
}

export interface NationConfig {
  id: string;
  name: string;
  color: string;
  capitalStateId: string;
  states: StateDefinition[];
}

import { germany } from "./nations/de.js";
import { france } from "./nations/fr.js";
import { britain } from "./nations/gb.js";
import { italy } from "./nations/it.js";
import { spain } from "./nations/es.js";

const ALL_NATIONS: NationConfig[] = [
  germany,
  france,
  britain,
  italy,
  spain,
];

export const NATIONS_DEF: NationDefinition[] = ALL_NATIONS.map(
  ({ id, name, color, capitalStateId }) => ({ id, name, color, capitalStateId })
);

export const NATION_DEF_MAP: Record<string, NationDefinition> = Object.fromEntries(
  NATIONS_DEF.map((n) => [n.id, n])
);

export const STATES_DEF: StateDefinition[] = ALL_NATIONS.flatMap((n) => n.states);

export const STATE_DEF_MAP: Record<string, StateDefinition> = Object.fromEntries(
  STATES_DEF.map((s) => [s.id, s])
);

export const INITIAL_STATE_OWNERS: Record<string, string> = Object.fromEntries(
  ALL_NATIONS.flatMap((n) => n.states.map((s) => [s.id, n.id]))
);
