// Pan/zoom state shared by all renderers. Same matrix model as the old
// Viewport (screen = world * scale + translation) but with a change listener
// so a PixiJS container can sync its transform without polling.
//
//   world  = projected pixel coordinates that MapData produced
//   screen = CSS pixels on the canvas

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function isFiniteNum(v) {
  return typeof v === "number" && Number.isFinite(v);
}

export class Camera {
  constructor(worldW, worldH) {
    this.worldW = worldW;
    this.worldH = worldH;
    this.scale = 1;
    this.tx = 0;
    this.ty = 0;
    this.minScale = 0.1;
    this.maxScale = 50;
    this.screenW = 0;
    this.screenH = 0;
    // World-space bbox of the actual map content (set by caller after loading)
    this.mapBounds = null; // { x, y, w, h }
    this._listeners = [];
  }

  onChange(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter((l) => l !== fn);
    };
  }

  _emit() {
    for (const fn of this._listeners) fn(this);
  }

  fitTo(screenW, screenH) {
    if (!isFiniteNum(screenW) || !isFiniteNum(screenH) || screenW <= 0 || screenH <= 0) return;
    this.screenW = screenW;
    this.screenH = screenH;
    const s = Math.min(screenW / this.worldW, screenH / this.worldH);
    this.minScale = s;
    this.scale = clamp(s, this.minScale, this.maxScale);
    this.tx = (screenW - this.worldW * this.scale) / 2;
    this.ty = (screenH - this.worldH * this.scale) / 2;
    this._emit();
  }

  zoomAt(screenX, screenY, factor) {
    if (!isFiniteNum(screenX) || !isFiniteNum(screenY) || !isFiniteNum(factor)) return;
    const ns = clamp(this.scale * factor, this.minScale, this.maxScale);
    const k = ns / this.scale;
    this.scale = ns;
    this.tx = screenX - (screenX - this.tx) * k;
    this.ty = screenY - (screenY - this.ty) * k;
    this._emit();
  }

  panBy(dx, dy) {
    if (!isFiniteNum(dx) || !isFiniteNum(dy)) return;
    this.tx += dx;
    this.ty += dy;
    this._emit();
  }

  screenToWorld(screenX, screenY) {
    return {
      x: (screenX - this.tx) / this.scale,
      y: (screenY - this.ty) / this.scale,
    };
  }
}
