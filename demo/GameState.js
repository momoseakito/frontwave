// Bridge between the engine's pure GameState (packages/game-engine) and the
// PixiJS-driven map UI. The engine owns province ownership / troops / phases;
// this class just holds the latest snapshot and exposes the lookups the map
// renderer needs (color by owner, name by id, hover/click selection).

import {
  createInitialState,
  executeAttack,
  STATE_DEF_MAP,
  NATION_DEF_MAP,
} from "../packages/game-engine/dist/index.js";

let nationDefs = {};

export async function loadNationDefs(url = "../assets/nation-defs.json") {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  nationDefs = await res.json();
  return nationDefs;
}

export class GameState {
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
