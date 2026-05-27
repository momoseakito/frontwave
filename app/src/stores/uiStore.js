import { writable, get } from 'svelte/store';
import { driverRef } from './mapStore.js';

export const selectedProvinceId = writable(null);
export const tooltipState = writable({ visible: false, x: 0, y: 0, text: '' });
export const speedState = writable({ paused: false, speed: 1 });
export const gamePhase = writable('start');

export function handleKeydown(e) {
  const driver = get(driverRef);
  if (!driver) return;
  if (e.code === 'Space') {
    e.preventDefault();
    const cur = get(speedState);
    const paused = !cur.paused;
    driver.setPaused(paused);
    speedState.set({ ...cur, paused });
  } else if (e.key === '1') {
    setSpeed(1);
  } else if (e.key === '2') {
    setSpeed(2);
  } else if (e.key === '3') {
    setSpeed(4);
  }
}

export function setSpeed(s) {
  const driver = get(driverRef);
  if (!driver) return;
  if (s === 0) {
    driver.setPaused(true);
    speedState.update(cur => ({ ...cur, paused: true }));
  } else {
    driver.setPaused(false);
    driver.setSpeed(s);
    speedState.set({ paused: false, speed: s });
  }
}
