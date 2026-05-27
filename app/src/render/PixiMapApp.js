// Wraps a PIXI.Application and exposes the same surface area that main.js
// used to drive the Canvas2D Renderer:
//   setMode(mode)           — political / province
//   invalidateOwners()      — owner colors changed
//   requestFrame()          — selection or other state changed
//   setRequestFrame(fn)     — InputController calls this to wake the loop
//   draw()                  — synchronous frame, called from pointermove for
//                             zero-latency drag
//   ctx (compat shim)       — InputController's old hit-test path expected
//                             a CanvasRenderingContext2D; not used anymore
//                             but kept as `null` for safety
//   lastFrameMs, quality    — HUD readouts; quality is always "vector" now
//
// No raster fallback. With ~100 polygons on the GPU we hold 60fps during
// pan/zoom without any quality switch.

import * as PIXI from 'pixi.js';
import { ProvinceLayer } from "./ProvinceLayer.js";
import { BorderLayer } from "./BorderLayer.js";
import { HighlightLayer } from "./HighlightLayer.js";
import { AttackLayer } from "./AttackLayer.js";
import { ArrowLayer } from "./ArrowLayer.js";
import { TroopLabelLayer } from "./TroopLabelLayer.js";

const SEA_COLOR = 0x0f172a;

export class PixiMapApp {
  constructor(canvas, camera, mapData, gameState, options = {}) {
    this.canvas = canvas;
    this.camera = camera;
    this.data = mapData;
    this.state = gameState;
    this.mode = "political";
    this.quality = "vector";
    this.lastFrameMs = 0;
    this.dirty = true;
    this.ctx = null;
    this._kick = null;
    this._app = null;
    this._world = null;
    this._provinces = null;
    this._borders = null;
    this._highlight = null;
    this._attack = null;
    this._arrows = null;
    this._troopLabels = null;
    this._initPromise = null;
    this._resolution = options.resolution ?? (window.devicePixelRatio || 1);
    this._troopLabelContainer = options.troopLabelContainer ?? null;
  }

  async init() {
    if (this._initPromise) return this._initPromise;
    this._initPromise = (async () => {
      this._app = new PIXI.Application();
      await this._app.init({
        canvas: this.canvas,
        background: SEA_COLOR,
        resolution: this._resolution,
        autoDensity: true,
        antialias: true,
        resizeTo: window,
      });
      // We drive frames ourselves from InputController; PIXI's built-in ticker
      // would render at 60Hz even when nothing changed, which we don't want.
      this._app.ticker.stop();

      this._world = new PIXI.Container();
      this._app.stage.addChild(this._world);

      this._provinces = new ProvinceLayer(PIXI, this.data, this.state);
      this._borders = new BorderLayer(PIXI, this.data);
      this._highlight = new HighlightLayer(PIXI, this.data);
      this._attack = new AttackLayer(PIXI, this.data);
      this._arrows = new ArrowLayer(PIXI, this.data);
      this._troopLabels = new TroopLabelLayer(PIXI, this.data, this.state, {
        troopLabelContainer: this._troopLabelContainer,
      });
      this._world.addChild(this._provinces.container);
      this._world.addChild(this._borders.container);
      this._world.addChild(this._highlight.container);
      this._world.addChild(this._attack.container);
      this._world.addChild(this._arrows.container);
      // TroopLabelLayer uses HTML <span> elements, not PIXI objects — no addChild needed.

      this._provinces.refreshFills();
      this._syncWorld();
      this._render();

      this.camera.onChange(() => {
        this.dirty = true;
        this._kick?.();
      });
    })();
    return this._initPromise;
  }

  setRequestFrame(fn) {
    this._kick = fn;
  }

  setMode(m) {
    if (this.mode === m) return;
    this.mode = m;
    this._provinces?.setMode(m);
    this.dirty = true;
    this._kick?.();
  }

  invalidateOwners() {
    this._provinces?.refreshFills();
    this.dirty = true;
    this._kick?.();
  }

  // Tick driver tells us which feature ids are currently underAttack.
  // Returns true if the set actually changed (so callers can decide to repaint).
  setUnderAttack(featureIds) {
    const changed = this._attack?.setUnderAttack(featureIds) ?? false;
    if (changed) {
      this.dirty = true;
      this._kick?.();
    }
    return changed;
  }

  // Tick driver supplies the current arrow list (source/target/color).
  setArrows(items) {
    const changed = this._arrows?.setArrows(items) ?? false;
    if (changed) {
      this.dirty = true;
      this._kick?.();
    }
    return changed;
  }

  // When attacks are in progress we keep ticking frames for the pulse anim.
  hasAttackAnimation() {
    return this._attack?.hasActive() ?? false;
  }

  requestFrame() {
    this.dirty = true;
    this._kick?.();
  }

  draw() {
    if (!this._app) return;            // init still pending; render() after init handles it
    // Attack pulse needs a frame even when nothing else dirtied us.
    if (!this.dirty && !this.hasAttackAnimation()) return;
    this.dirty = false;
    const t0 = performance.now();
    this._syncWorld();
    this._attack?.render(performance.now());
    this._render();
    this.lastFrameMs = performance.now() - t0;
    // Keep ticking while the pulse is active so InputController re-kicks rAF.
    if (this.hasAttackAnimation()) this.dirty = true;
  }

  _syncWorld() {
    const c = this.camera;
    this._world.scale.set(c.scale, c.scale);
    this._world.position.set(c.tx, c.ty);
    this._borders.syncToScale(c.scale);
    this._highlight.syncToScale(c.scale);
    this._highlight.setSelected(this.state.selectedProvince);
    this._attack.syncToScale(c.scale);
    this._arrows.syncToScale(c.scale);
    this._troopLabels?.syncToCamera(c);
    this._troopLabels?.refresh();
  }

  _render() {
    this._app.renderer.render(this._app.stage);
  }
}
