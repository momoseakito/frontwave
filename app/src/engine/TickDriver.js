import { gameTick, TICK_MS } from 'frontwave-engine';

export class TickDriver {
  constructor(gameState, app, callbacks = {}) {
    this.state = gameState;
    this.app = app;
    this.onTick = callbacks.onTick ?? (() => {});
    this._timer = 0;
    this._paused = false;
    this._speed = 1;
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

  setSpeed(n) {
    this._speed = n;
  }

  togglePause() {
    this._paused = !this._paused;
  }

  _step() {
    if (this._paused) return;

    let ownerChanged = false;
    let lastNext = this.state.engine;
    let lastPrev = this.state.engine;
    for (let i = 0; i < this._speed; i++) {
      const prev = this.state.engine;
      const next = gameTick(prev);
      this.state.setEngineState(next);
      if (!ownerChanged) {
        for (const id of Object.keys(next.states)) {
          if (prev.states[id]?.ownerId !== next.states[id]?.ownerId) {
            ownerChanged = true;
            break;
          }
        }
      }
      lastNext = next;
      lastPrev = prev;
    }

    if (ownerChanged) {
      this.app.invalidateOwners();
    } else {
      this.app.requestFrame();
    }

    this.onTick(lastNext, lastPrev);
  }
}
