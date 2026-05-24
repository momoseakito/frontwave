// Drives the engine's pure gameTick() on a fixed 100ms cadence (TICK_MS).
// Each tick advances engine.elapsedSeconds by DELTA_SECONDS (=0.1s). When
// ownership changes we tell the renderer to repaint owner colors; otherwise
// the existing rAF + per-tick HUD callback handle reflection.

import { gameTick, TICK_MS } from "../packages/game-engine/dist/index.js";

export class TickDriver {
  constructor(gameState, app, callbacks = {}) {
    this.state = gameState;
    this.app = app;
    this.onTick = callbacks.onTick ?? (() => {});
    this._timer = 0;
    this._paused = false;
  }

  start() {
    if (this._timer) return;
    this._timer = setInterval(() => this._step(), TICK_MS);
  }

  stop() {
    if (!this._timer) return;
    clearInterval(this._timer);
    this._timer = 0;
  }

  setPaused(paused) {
    this._paused = paused;
  }

  _step() {
    if (this._paused) return;
    const prev = this.state.engine;
    const next = gameTick(prev);
    this.state.setEngineState(next);

    // Cheap owner-change check: compare the per-state ownerId. ~80 entries so
    // this is sub-millisecond. If anything moved, repaint fills; selection /
    // borders / HUD update via the normal frame path.
    let ownerChanged = false;
    for (const id of Object.keys(next.states)) {
      if (prev.states[id]?.ownerId !== next.states[id]?.ownerId) {
        ownerChanged = true;
        break;
      }
    }
    if (ownerChanged) {
      this.app.invalidateOwners();
    } else {
      this.app.requestFrame();
    }

    this.onTick(next, prev);
  }
}
