// Orange outline for all attack-eligible neighbor provinces during a long-press
// attack gesture. Mirrors HighlightLayer's two-pass stroke pattern but accepts
// an array of feature ids instead of a single selection.

const NEIGHBOR_STROKE = 0xff7700;

export class NeighborHighlightLayer {
  constructor(PIXI, mapData) {
    this.PIXI = PIXI;
    this.data = mapData;
    this.graphic = new PIXI.Graphics();
    this.container = this.graphic;
    this._ids = [];
    this._scale = 0;
  }

  setNeighbors(ids) {
    const changed =
      ids.length !== this._ids.length ||
      ids.some((v, i) => v !== this._ids[i]);
    if (!changed) return false;
    this._ids = ids.slice();
    this._redraw();
    return true;
  }

  syncToScale(scale) {
    if (this._scale === scale) return;
    this._scale = scale;
    this._redraw();
  }

  _redraw() {
    this.graphic.clear();
    if (this._ids.length === 0 || this._scale <= 0) return;
    for (const id of this._ids) {
      const rec = this.data.features.find((f) => f.id === id);
      if (!rec) continue;
      this._tracePath(rec);
      this.graphic.stroke({
        color: NEIGHBOR_STROKE,
        alpha: 0.30,
        width: 10 / this._scale,
        cap: "round",
        join: "round",
      });
      this._tracePath(rec);
      this.graphic.stroke({
        color: NEIGHBOR_STROKE,
        alpha: 0.85,
        width: 2.5 / this._scale,
        cap: "round",
        join: "round",
      });
    }
  }

  _tracePath(rec) {
    for (const poly of rec.polygons) {
      for (const ring of poly) {
        if (ring.length < 2) continue;
        this.graphic.moveTo(ring[0][0], ring[0][1]);
        for (let i = 1; i < ring.length; i++) this.graphic.lineTo(ring[i][0], ring[i][1]);
        this.graphic.lineTo(ring[0][0], ring[0][1]);
      }
    }
  }
}
