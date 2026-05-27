// Red pulsing outline for any province currently marked underAttack by the
// engine. The pulse is driven by elapsed wall time so the layer needs to
// repaint each frame while there are active attacks; PixiMapApp keeps itself
// dirty in that case.

const ATTACK_STROKE = 0xef4444;

export class AttackLayer {
  constructor(PIXI, mapData) {
    this.PIXI = PIXI;
    this.data = mapData;
    this.graphic = new PIXI.Graphics();
    this.container = this.graphic;
    this._ids = new Set();
    this._scale = 0;
  }

  // ids: iterable of feature numeric ids that are under attack right now.
  setUnderAttack(ids) {
    const next = new Set(ids);
    if (sameSet(this._ids, next)) return false;
    this._ids = next;
    return true;
  }

  hasActive() {
    return this._ids.size > 0;
  }

  syncToScale(scale) {
    this._scale = scale;
  }

  // Repaint with a pulse alpha derived from elapsed ms. Called every frame
  // while hasActive() is true so the stroke breathes.
  render(nowMs) {
    this.graphic.clear();
    if (this._ids.size === 0 || this._scale <= 0) return;
    const pulse = 0.55 + 0.45 * Math.sin(nowMs / 220);
    for (const id of this._ids) {
      const rec = this.data.features.find((f) => f.id === id);
      if (!rec) continue;
      for (const poly of rec.polygons) {
        for (const ring of poly) {
          if (ring.length < 2) continue;
          this.graphic.moveTo(ring[0][0], ring[0][1]);
          for (let i = 1; i < ring.length; i++) this.graphic.lineTo(ring[i][0], ring[i][1]);
          this.graphic.lineTo(ring[0][0], ring[0][1]);
        }
      }
    }
    this.graphic.stroke({
      color: ATTACK_STROKE,
      alpha: pulse,
      width: 3 / this._scale,
      cap: "round",
      join: "round",
    });
  }
}

function sameSet(a, b) {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}
