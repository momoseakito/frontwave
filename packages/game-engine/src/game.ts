import {
  NATIONS_DEF,
  STATES_DEF,
  INITIAL_STATE_OWNERS,
  STATE_DEF_MAP,
} from "./map.js";
import {
  CASUAL_TIMER_DEFAULT,
  INITIAL_FUNDS,
  INITIAL_TROOPS_BY_TERRAIN,
  UPGRADE_COSTS,
  TROOP_MAX_BY_LEVEL,
  CAPITAL_BONUS_MULTIPLIER,
  PEACE_PERIOD_SECONDS,
  type Terrain,
} from "./constants.js";
import { getRelationStatus, isDiplomaticPair } from "./diplomacy.js";
import { canCrossStrait } from "./sealanes.js";

// ---- State (province equivalent) ----

export interface StateStatus {
  stateId: string;
  ownerId: string;
  troops: number;
  industryLevel: number;
  underAttack: boolean;
  attackerId: string | null;
  neutralizedUntil: number;
  upgradeInProgress: boolean;
  upgradeCompletesAt: number;
}

// ---- Nation ----

export interface NationState {
  id: string;
  stateIds: string[];
  totalTroops: number;
  isAlive: boolean;
}

// ---- Attack ----

export interface OngoingAttack {
  attackerId: string;
  targetStateId: string;
  sourceStateId: string;
}

// ---- Cards ----

export interface CardInstance {
  instanceId: string;
  definitionId: string;
}

// ---- Diplomacy ----

export type DiplomaticStatus = "peaceful" | "war" | "ally";

export interface DiplomaticRelation {
  nationA: string;
  nationB: string;
  status: DiplomaticStatus;
}

export interface AllianceProposal {
  id: string;
  from: string;
  to: string;
  createdAt: number;
}

// ---- Active Effects ----

export type ActiveEffect =
  | { type: "total_war"; nationId: string; expiresAt: number }
  | { type: "revolution_export"; stateId: string; expiresAt: number }
  | { type: "supply_cut"; stateId: string; expiresAt: number }
  | { type: "fortify"; stateId: string; expiresAt: number; multiplier: number }
  | { type: "terrain_override"; stateId: string; expiresAt: number; terrain: Terrain }
  | { type: "mobilization"; nationId: string; expiresAt: number; bonus: number }
  | { type: "blitzkrieg"; nationId: string; usesLeft: number }
  | { type: "attack_boost"; nationId: string; expiresAt: number; multiplier: number }
  | { type: "terrain_upgrade"; stateId: string; permanentTerrain: Terrain }
  | { type: "economic_blockade"; nationId: string; expiresAt: number }
  | { type: "strait_crossing_enabled"; nationId: string; expiresAt: number }
  | { type: "alliance_break_penalty"; nationId: string; expiresAt: number }
  | { type: "poison_dot"; stateId: string; expiresAt: number; dpsPerSecond: number }
  | { type: "holy_defense_trigger"; stateId: string; expiresAt: number }
  | { type: "chaos"; targetNationId: string; expiresAt: number };

// ---- Top-level Game State ----

export interface GameState {
  states: Record<string, StateStatus>;
  nations: Record<string, NationState>;
  ongoingAttacks: OngoingAttack[];

  elapsedSeconds: number;
  timerLimit: number;
  gameMode: "casual" | "strategy";
  lastAiTick: number;
  lastCardDraw: number;

  phase: "playing" | "finished";
  playerNationId: string;
  winner: string | null;

  playerHand: CardInstance[];
  cardDraftPending: boolean;
  cardDraftChoices: CardInstance[];
  activeEffects: ActiveEffect[];
  playerFunds: number;

  diplomaticRelations: Record<string, DiplomaticRelation>;
  pendingAllianceProposals: AllianceProposal[];
  aiLastWarDecisionAt: Record<string, number>;

  selectedStateId: string | null;
  eventLog: string[];
}

// ---- Helper ----

export function getMaxTroops(industryLevel: number, isCapital: boolean): number {
  const base = TROOP_MAX_BY_LEVEL[Math.min(industryLevel, 5) as 0 | 1 | 2 | 3 | 4 | 5] ?? TROOP_MAX_BY_LEVEL[0];
  return isCapital ? Math.floor(base * CAPITAL_BONUS_MULTIPLIER) : base;
}

// ---- Initial State Creation ----

function buildNationStates(
  states: Record<string, StateStatus>
): Record<string, NationState> {
  const nations: Record<string, NationState> = {};

  for (const n of NATIONS_DEF) {
    nations[n.id] = {
      id: n.id,
      stateIds: [],
      totalTroops: 0,
      isAlive: true,
    };
  }

  for (const s of Object.values(states)) {
    if (nations[s.ownerId]) {
      nations[s.ownerId].stateIds.push(s.stateId);
      nations[s.ownerId].totalTroops += s.troops;
    }
  }

  for (const n of Object.values(nations)) {
    n.isAlive = n.stateIds.length > 0;
  }

  return nations;
}

export function createInitialState(
  playerNationId: string,
  gameMode: "casual" | "strategy" = "casual",
  timerLimit?: number
): GameState {
  const states: Record<string, StateStatus> = {};

  for (const def of STATES_DEF) {
    const ownerId = INITIAL_STATE_OWNERS[def.id] ?? "neutral";
    const terrain = (def.capitalOf ? "capital" : def.terrain) as Terrain;
    const isCapital = terrain === "capital";
    const industryLevel = isCapital ? 3 : terrain === "mountains" ? 2 : 1;
    states[def.id] = {
      stateId: def.id,
      ownerId,
      troops: INITIAL_TROOPS_BY_TERRAIN[terrain],
      industryLevel,
      underAttack: false,
      attackerId: null,
      neutralizedUntil: 0,
      upgradeInProgress: false,
      upgradeCompletesAt: 0,
    };
  }

  const nations = buildNationStates(states);

  return {
    states,
    nations,
    ongoingAttacks: [],
    elapsedSeconds: 0,
    timerLimit: timerLimit ?? CASUAL_TIMER_DEFAULT,
    gameMode,
    lastAiTick: 0,
    lastCardDraw: 0,
    phase: "playing",
    playerNationId,
    winner: null,
    playerHand: [],
    cardDraftPending: false,
    cardDraftChoices: [],
    activeEffects: [],
    playerFunds: INITIAL_FUNDS,
    diplomaticRelations: {},
    pendingAllianceProposals: [],
    aiLastWarDecisionAt: {},
    selectedStateId: null,
    eventLog: [],
  };
}

export function rebuildNations(game: GameState): GameState {
  const nations: Record<string, NationState> = {};

  for (const n of NATIONS_DEF) {
    nations[n.id] = { id: n.id, stateIds: [], totalTroops: 0, isAlive: false };
  }

  for (const s of Object.values(game.states)) {
    if (nations[s.ownerId]) {
      nations[s.ownerId].stateIds.push(s.stateId);
      nations[s.ownerId].totalTroops += Math.floor(s.troops);
    }
  }

  for (const n of Object.values(nations)) {
    n.isAlive = n.stateIds.length > 0;
  }

  return { ...game, nations };
}

// ---- Pure Action Helpers ----

export function selectState(game: GameState, stateId: string | null): GameState {
  return { ...game, selectedStateId: stateId };
}

export function executeAttack(
  game: GameState,
  sourceStateId: string,
  targetStateId: string
): GameState {
  if (game.elapsedSeconds < PEACE_PERIOD_SECONDS) return game;

  const source = game.states[sourceStateId];
  const target = game.states[targetStateId];
  if (!source || !target) return game;
  if (source.ownerId !== game.playerNationId) return game;
  if (target.ownerId === game.playerNationId) return game;
  if (source.troops < 20) return game;

  // 戦争状態が必須
  if (
    target.ownerId !== "neutral" &&
    isDiplomaticPair(game.playerNationId, target.ownerId) &&
    getRelationStatus(game, game.playerNationId, target.ownerId) !== "war"
  ) {
    return game;
  }

  const sourceDef = STATE_DEF_MAP[sourceStateId];
  const isAdjacent = sourceDef?.neighbors.includes(targetStateId) ?? false;
  const isStraitCrossing = canCrossStrait(game, game.playerNationId, sourceStateId, targetStateId);
  if (!isAdjacent && !isStraitCrossing) return game;

  const alreadyAttacking = game.ongoingAttacks.some(
    (a) => a.targetStateId === targetStateId
  );
  if (alreadyAttacking) return game;

  const attack: OngoingAttack = {
    attackerId: game.playerNationId,
    targetStateId,
    sourceStateId,
  };

  return {
    ...game,
    ongoingAttacks: [...game.ongoingAttacks, attack],
    states: {
      ...game.states,
      [targetStateId]: { ...target, underAttack: true, attackerId: game.playerNationId },
    },
  };
}

export function cancelAttack(game: GameState, targetStateId: string): GameState {
  const target = game.states[targetStateId];
  return {
    ...game,
    ongoingAttacks: game.ongoingAttacks.filter((a) => a.targetStateId !== targetStateId),
    states: target
      ? {
          ...game.states,
          [targetStateId]: { ...target, underAttack: false, attackerId: null },
        }
      : game.states,
  };
}

export function transferTroops(
  game: GameState,
  fromStateId: string,
  toStateId: string,
  amount: number
): GameState {
  const from = game.states[fromStateId];
  const to = game.states[toStateId];
  if (!from || !to) return game;
  if (from.ownerId !== game.playerNationId) return game;

  const isOwnState = to.ownerId === game.playerNationId;
  const isAllyState =
    isDiplomaticPair(game.playerNationId, to.ownerId) &&
    getRelationStatus(game, game.playerNationId, to.ownerId) === "ally";
  if (!isOwnState && !isAllyState) return game;

  const sourceDef = STATE_DEF_MAP[fromStateId];
  if (!sourceDef?.neighbors.includes(toStateId)) return game;

  const actualAmount = Math.min(amount, Math.floor(from.troops) - 1);
  if (actualAmount <= 0) return game;

  const toDef = STATE_DEF_MAP[toStateId];
  const toIsCapital = toDef?.capitalOf !== undefined;
  const maxTo = getMaxTroops(to.industryLevel, toIsCapital);

  return {
    ...game,
    states: {
      ...game.states,
      [fromStateId]: { ...from, troops: from.troops - actualAmount },
      [toStateId]: { ...to, troops: Math.min(to.troops + actualAmount, maxTo) },
    },
  };
}

export function startUpgrade(game: GameState, stateId: string): GameState {
  const state = game.states[stateId];
  if (!state) return game;
  if (state.ownerId !== game.playerNationId) return game;
  if (state.industryLevel >= 5) return game;
  if (state.upgradeInProgress) return game;

  const nextLevel = state.industryLevel + 1;
  const [goldCost, timeSec] = UPGRADE_COSTS[nextLevel - 1]!;
  if (game.playerFunds < goldCost) return game;

  return {
    ...game,
    playerFunds: game.playerFunds - goldCost,
    states: {
      ...game.states,
      [stateId]: {
        ...state,
        upgradeInProgress: true,
        upgradeCompletesAt: game.elapsedSeconds + timeSec,
      },
    },
  };
}

// 降伏処理: 降伏国の全州を中立化し isAlive = false
export function triggerNationSurrender(
  game: GameState,
  surrenderedNationId: string,
  captorNationId: string
): GameState {
  const states = { ...game.states };
  for (const [id, s] of Object.entries(states)) {
    if (s.ownerId === surrenderedNationId) {
      states[id] = { ...s, ownerId: captorNationId };
    }
  }

  const log = [...game.eventLog, `${surrenderedNationId} が降伏しました`];
  let g: GameState = { ...game, states, eventLog: log };
  const { rebuildNations: _rebuild } = { rebuildNations };
  g = rebuildNations(g);
  return g;
}
