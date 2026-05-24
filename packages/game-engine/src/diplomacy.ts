import type { GameState, DiplomaticStatus, AllianceProposal, ActiveEffect } from "./game.js";
import { NATION_DEF_MAP } from "./map.js";
import { addEvent } from "./events.js";
import {
  PEACE_PERIOD_SECONDS,
  ALLIANCE_PROPOSAL_TTL,
  MAX_ALLIANCES,
  ALLIANCE_BREAK_PENALTY_SEC,
} from "./constants.js";

export function relationKey(a: string, b: string): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

export function isDiplomaticPair(a: string, b: string): boolean {
  if (a === b) return false;
  if (a === "neutral" || b === "neutral") return false;
  if (!NATION_DEF_MAP[a] || !NATION_DEF_MAP[b]) return false;
  return true;
}

export function getRelationStatus(
  game: GameState,
  a: string,
  b: string
): DiplomaticStatus {
  if (!isDiplomaticPair(a, b)) return "peaceful";
  const rel = game.diplomaticRelations[relationKey(a, b)];
  return rel?.status ?? "peaceful";
}

export function isPeacePeriod(game: GameState): boolean {
  return game.elapsedSeconds < PEACE_PERIOD_SECONDS;
}

function countAlliances(game: GameState, nationId: string): number {
  return Object.values(game.diplomaticRelations).filter(
    (r) => r.status === "ally" && (r.nationA === nationId || r.nationB === nationId)
  ).length;
}

function setRelation(
  game: GameState,
  a: string,
  b: string,
  status: DiplomaticStatus
): GameState {
  const key = relationKey(a, b);
  const [nationA, nationB] = a < b ? [a, b] : [b, a];
  return {
    ...game,
    diplomaticRelations: {
      ...game.diplomaticRelations,
      [key]: { nationA, nationB, status },
    },
  };
}

function applyAllianceBreakPenalty(game: GameState, nationId: string): GameState {
  const penalty: ActiveEffect = {
    type: "alliance_break_penalty",
    nationId,
    expiresAt: game.elapsedSeconds + ALLIANCE_BREAK_PENALTY_SEC,
  };
  return {
    ...game,
    activeEffects: [...game.activeEffects, penalty],
  };
}

export function declareWar(
  game: GameState,
  aggressorId: string,
  defenderId: string
): GameState {
  if (!isDiplomaticPair(aggressorId, defenderId)) return game;
  if (isPeacePeriod(game)) return game;
  const current = getRelationStatus(game, aggressorId, defenderId);
  if (current === "war") return game;

  let working: GameState = game;

  // 同盟関係から戦争に遷移する場合: 同盟破棄ペナルティを付与
  if (current === "ally") {
    const atkName = NATION_DEF_MAP[aggressorId]?.name ?? aggressorId;
    const defName = NATION_DEF_MAP[defenderId]?.name ?? defenderId;
    working = addEvent(working, `${atkName}が${defName}との同盟を破棄`);
    working = applyAllianceBreakPenalty(working, aggressorId);
  }

  working = {
    ...working,
    pendingAllianceProposals: working.pendingAllianceProposals.filter(
      (p) =>
        !(
          (p.from === aggressorId && p.to === defenderId) ||
          (p.from === defenderId && p.to === aggressorId)
        )
    ),
  };

  const next = setRelation(working, aggressorId, defenderId, "war");
  const atk = NATION_DEF_MAP[aggressorId]?.name ?? aggressorId;
  const def = NATION_DEF_MAP[defenderId]?.name ?? defenderId;
  return addEvent(next, `${atk}が${def}に宣戦布告！`);
}

export function escalateRelation(
  game: GameState,
  a: string,
  b: string
): GameState {
  if (!isDiplomaticPair(a, b)) return game;
  return declareWar(game, a, b);
}

function newProposalId(game: GameState): string {
  return `prop_${Math.floor(game.elapsedSeconds * 1000)}_${game.pendingAllianceProposals.length}`;
}

export function proposeAlliance(
  game: GameState,
  fromId: string,
  toId: string
): GameState {
  if (!isDiplomaticPair(fromId, toId)) return game;
  if (isPeacePeriod(game)) return game;
  const current = getRelationStatus(game, fromId, toId);
  if (current === "war" || current === "ally") return game;

  // 同盟上限チェック
  if (countAlliances(game, fromId) >= MAX_ALLIANCES) return game;
  if (countAlliances(game, toId) >= MAX_ALLIANCES) return game;

  const existing = game.pendingAllianceProposals.find(
    (p) =>
      (p.from === fromId && p.to === toId) ||
      (p.from === toId && p.to === fromId)
  );
  if (existing) return game;

  const proposal: AllianceProposal = {
    id: newProposalId(game),
    from: fromId,
    to: toId,
    createdAt: game.elapsedSeconds,
  };

  const fromName = NATION_DEF_MAP[fromId]?.name ?? fromId;
  const toName = NATION_DEF_MAP[toId]?.name ?? toId;
  return addEvent(
    {
      ...game,
      pendingAllianceProposals: [...game.pendingAllianceProposals, proposal],
    },
    `${fromName}が${toName}に同盟を提案`
  );
}

export function acceptAlliance(
  game: GameState,
  fromId: string,
  toId: string
): GameState {
  const proposal = game.pendingAllianceProposals.find(
    (p) => p.from === fromId && p.to === toId
  );
  if (!proposal) return game;

  // 受諾時点でも上限チェック
  if (countAlliances(game, fromId) >= MAX_ALLIANCES) return game;
  if (countAlliances(game, toId) >= MAX_ALLIANCES) return game;

  const cleaned: GameState = {
    ...game,
    pendingAllianceProposals: game.pendingAllianceProposals.filter(
      (p) => p.id !== proposal.id
    ),
  };
  const next = setRelation(cleaned, fromId, toId, "ally");
  const fromName = NATION_DEF_MAP[fromId]?.name ?? fromId;
  const toName = NATION_DEF_MAP[toId]?.name ?? toId;
  return addEvent(next, `${toName}は${fromName}の同盟提案を受諾！`);
}

export function rejectAlliance(
  game: GameState,
  fromId: string,
  toId: string
): GameState {
  const proposal = game.pendingAllianceProposals.find(
    (p) => p.from === fromId && p.to === toId
  );
  if (!proposal) return game;

  const cleaned: GameState = {
    ...game,
    pendingAllianceProposals: game.pendingAllianceProposals.filter(
      (p) => p.id !== proposal.id
    ),
  };
  const fromName = NATION_DEF_MAP[fromId]?.name ?? fromId;
  const toName = NATION_DEF_MAP[toId]?.name ?? toId;
  return addEvent(cleaned, `${toName}は${fromName}の同盟提案を拒否`);
}

export function breakAlliance(
  game: GameState,
  a: string,
  b: string
): GameState {
  if (!isDiplomaticPair(a, b)) return game;
  if (getRelationStatus(game, a, b) !== "ally") return game;

  let next = setRelation(game, a, b, "peaceful");
  next = applyAllianceBreakPenalty(next, a);

  const aName = NATION_DEF_MAP[a]?.name ?? a;
  const bName = NATION_DEF_MAP[b]?.name ?? b;
  return addEvent(next, `${aName}が${bName}との同盟を破棄`);
}

export function expireProposals(game: GameState): GameState {
  const before = game.pendingAllianceProposals.length;
  const remaining = game.pendingAllianceProposals.filter(
    (p) => game.elapsedSeconds - p.createdAt < ALLIANCE_PROPOSAL_TTL
  );
  if (remaining.length === before) return game;
  return { ...game, pendingAllianceProposals: remaining };
}
