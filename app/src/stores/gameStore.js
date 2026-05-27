import { writable, derived, get } from 'svelte/store';

export const gameBridge = writable(null);

export const engineState = derived(gameBridge, ($b) => $b?.engine ?? null);

export function notifyEngineUpdate(bridge) {
  gameBridge.update(() => bridge);
}

export function doStartUpgrade(featureId) {
  const b = get(gameBridge);
  if (!b) return false;
  const ok = b.tryStartUpgrade(featureId);
  if (ok) notifyEngineUpdate(b);
  return ok;
}

export function doAttack(sourceFeatureId, targetFeatureId) {
  const b = get(gameBridge);
  if (!b) return false;
  const ok = b.tryAttack(sourceFeatureId, targetFeatureId);
  if (ok) notifyEngineUpdate(b);
  return ok;
}

export function doDeclareWar(targetId) {
  const b = get(gameBridge);
  if (!b) return false;
  const ok = b.tryDeclareWar(targetId);
  if (ok) notifyEngineUpdate(b);
  return ok;
}

export function doProposeAlliance(targetId) {
  const b = get(gameBridge);
  if (!b) return false;
  const ok = b.tryProposeAlliance(targetId);
  if (ok) notifyEngineUpdate(b);
  return ok;
}

export function doAcceptAlliance(fromId) {
  const b = get(gameBridge);
  if (!b) return false;
  const ok = b.tryAcceptAlliance(fromId);
  if (ok) notifyEngineUpdate(b);
  return ok;
}

export function doRejectAlliance(fromId) {
  const b = get(gameBridge);
  if (!b) return false;
  const ok = b.tryRejectAlliance(fromId);
  if (ok) notifyEngineUpdate(b);
  return ok;
}

export function doBreakAlliance(targetId) {
  const b = get(gameBridge);
  if (!b) return false;
  const ok = b.tryBreakAlliance(targetId);
  if (ok) notifyEngineUpdate(b);
  return ok;
}
