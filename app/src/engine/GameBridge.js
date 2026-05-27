// Bridge between the engine's pure GameState (packages/game-engine) and the
// PixiJS-driven map UI. The engine owns province ownership / troops / phases;
// this class just holds the latest snapshot and exposes the lookups the map
// renderer needs (color by owner, name by id, hover/click selection).

import {
  createInitialState,
  executeAttack,
  startUpgrade,
  getMaxTroops,
  getRelationStatus,
  proposeAlliance,
  acceptAlliance,
  rejectAlliance,
  breakAlliance,
  declareWar,
  STATE_DEF_MAP,
  NATION_DEF_MAP,
  NATIONS_DEF,
  UPGRADE_COSTS,
} from "frontwave-engine";

let nationDefs = {};

export async function loadNationDefs(url = "../assets/nation-defs.json") {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  nationDefs = await res.json();
  return nationDefs;
}

export class GameBridge {
  constructor(playerNationId = "emp") {
    this.engine = createInitialState(playerNationId);
    // Lookups keyed by the numeric feature.id assigned by MapData.
    // featureIdToStateId: numericId -> "emp_capital" etc.
    // stateIdToFeatureId: reverse, for engine-driven highlight.
    this.featureIdToStateId = new Map();
    this.stateIdToFeatureId = new Map();
    this.selectedProvince = null;
  }

  // Called once after buildMapData; binds numeric feature ids to engine state ids
  // by reading each feature's `properties.id` from the source GeoJSON.
  initFromGeoJSON(geoJSON) {
    geoJSON.features.forEach((f, i) => {
      const numericId = i + 1;
      const stateId = f.properties.id;
      this.featureIdToStateId.set(numericId, stateId);
      this.stateIdToFeatureId.set(stateId, numericId);
    });
  }

  // Returns engine state record (StateStatus) or null.
  getStateByFeatureId(numericId) {
    const sid = this.featureIdToStateId.get(numericId);
    return sid ? this.engine.states[sid] ?? null : null;
  }

  getOwner(numericId) {
    return this.getStateByFeatureId(numericId)?.ownerId ?? null;
  }

  selectProvince(numericId) {
    this.selectedProvince = this.selectedProvince === numericId ? null : numericId;
  }

  getCountryColorHex(ownerId) {
    if (!ownerId) return "#64748b";
    return nationDefs[ownerId]?.color ?? NATION_DEF_MAP[ownerId]?.color ?? "#64748b";
  }

  getCountryName(ownerId) {
    if (!ownerId) return "—";
    return nationDefs[ownerId]?.name ?? NATION_DEF_MAP[ownerId]?.name ?? ownerId;
  }

  // Returns the engine StateDefinition for a feature id (terrain, neighbors, etc).
  getStateDef(numericId) {
    const sid = this.featureIdToStateId.get(numericId);
    return sid ? STATE_DEF_MAP[sid] ?? null : null;
  }

  // Replace the engine snapshot wholesale. Callers (the tick driver) supply the
  // post-tick GameState; the UI re-reads on the next frame.
  setEngineState(next) {
    this.engine = next;
  }

  // Current player's nation id (used by command/attack code in later stages).
  getPlayerNationId() {
    return this.engine.playerNationId;
  }

  // Snapshot of everything the info panel cares about for a given feature.
  // Returns null if the feature has no engine state binding.
  getProvinceInfo(featureId) {
    const sid = this.featureIdToStateId.get(featureId);
    if (!sid) return null;
    const s = this.engine.states[sid];
    const def = STATE_DEF_MAP[sid];
    if (!s || !def) return null;
    const isCapital = def.capitalOf !== undefined;
    const terrain = isCapital ? "capital" : def.terrain;
    const max = getMaxTroops(s.industryLevel, isCapital);
    const upgradeRemain = s.upgradeInProgress
      ? Math.max(0, s.upgradeCompletesAt - this.engine.elapsedSeconds)
      : 0;
    // Next upgrade is to industryLevel+1; UPGRADE_COSTS is 0-indexed by
    // resulting level - 1 (i.e. UPGRADE_COSTS[0] is cost for Lv 1).
    const nextLevel = s.industryLevel + 1;
    const cost = nextLevel <= 5 ? UPGRADE_COSTS[nextLevel - 1] : null;
    const nextCost = cost ? cost[0] : null;
    const nextDuration = cost ? cost[1] : null;
    const upgradeProgress = s.upgradeInProgress && nextDuration
      ? Math.min(1, 1 - upgradeRemain / nextDuration)
      : 0;
    return {
      stateId: sid,
      name: def.name,
      ownerId: s.ownerId,
      troops: Math.floor(s.troops),
      maxTroops: max,
      terrain,
      isCapital,
      industryLevel: s.industryLevel,
      neighborCount: def.neighbors.length,
      underAttack: s.underAttack,
      attackerId: s.attackerId,
      upgradeInProgress: s.upgradeInProgress,
      upgradeRemain,
      upgradeProgress,
      nextLevel: nextLevel <= 5 ? nextLevel : null,
      nextCost,
      nextDuration,
    };
  }

  getPlayerFunds() {
    return Math.floor(this.engine.playerFunds);
  }

  // ---- Diplomacy ----

  // Returns a snapshot for the diplomacy panel: every other nation with its
  // relation status, whether the player can act, and any pending proposal
  // from that nation to the player.
  getDiplomacySnapshot() {
    const me = this.engine.playerNationId;
    const rows = [];
    for (const n of NATIONS_DEF) {
      if (n.id === me) continue;
      const status = getRelationStatus(this.engine, me, n.id);
      const incoming = this.engine.pendingAllianceProposals.find(
        (p) => p.from === n.id && p.to === me,
      );
      const outgoing = this.engine.pendingAllianceProposals.find(
        (p) => p.from === me && p.to === n.id,
      );
      rows.push({
        id: n.id,
        name: n.name,
        color: n.color,
        status,
        isAlive: this.engine.nations[n.id]?.isAlive ?? false,
        incomingProposalId: incoming?.id ?? null,
        outgoingProposalId: outgoing?.id ?? null,
      });
    }
    return rows;
  }

  tryProposeAlliance(targetId) {
    const me = this.engine.playerNationId;
    const before = this.engine;
    const after = proposeAlliance(before, me, targetId);
    if (after === before) return false;
    this.engine = after;
    return true;
  }

  tryAcceptAlliance(fromId) {
    const me = this.engine.playerNationId;
    const before = this.engine;
    const after = acceptAlliance(before, fromId, me);
    if (after === before) return false;
    this.engine = after;
    return true;
  }

  tryRejectAlliance(fromId) {
    const me = this.engine.playerNationId;
    const before = this.engine;
    const after = rejectAlliance(before, fromId, me);
    if (after === before) return false;
    this.engine = after;
    return true;
  }

  tryBreakAlliance(targetId) {
    const me = this.engine.playerNationId;
    const before = this.engine;
    const after = breakAlliance(before, me, targetId);
    if (after === before) return false;
    this.engine = after;
    return true;
  }

  tryDeclareWar(targetId) {
    const me = this.engine.playerNationId;
    const before = this.engine;
    const after = declareWar(before, me, targetId);
    if (after === before) return false;
    this.engine = after;
    return true;
  }

  // Returns true if startUpgrade actually moved the engine.
  tryStartUpgrade(featureId) {
    const sid = this.featureIdToStateId.get(featureId);
    if (!sid) return false;
    const before = this.engine;
    const after = startUpgrade(before, sid);
    if (after === before) return false;
    this.engine = after;
    return true;
  }

  // Issue an attack from one feature to another. Returns true if the engine
  // accepted the command (it can refuse for many reasons: peace period, not
  // owned, not adjacent, insufficient troops, wrong diplomatic status, etc).
  tryAttack(sourceFeatureId, targetFeatureId) {
    const sourceSid = this.featureIdToStateId.get(sourceFeatureId);
    const targetSid = this.featureIdToStateId.get(targetFeatureId);
    if (!sourceSid || !targetSid) return false;
    const before = this.engine;
    const after = executeAttack(before, sourceSid, targetSid);
    if (after === before) return false;
    this.engine = after;
    return true;
  }
}
