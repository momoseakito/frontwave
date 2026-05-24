// Yellow outline of the currently-selected province. Cheap to rebuild because
// it's at most one feature; we redo it whenever selection or scale changes.

const SELECTED_STROKE = 0xfacc15;

export class HighlightLayer {
  constructor(PIXI, mapData) {
    this.PIXI = PIXI;
    this.data = mapData;
    this.graphic = new PIXI.Graphics();
    this.container = this.graphic;
    this._selectedId = null;
    this._scale = 0;
  }

  setSelected(id) {
    if (this._selectedId === id) return;
    this._selectedId = id;
    this._redraw();
  }

  syncToScale(scale) {
    if (this._scale === scale) return;
    this._scale = scale;
    this._redraw();
  }

  _redraw() {
    this.graphic.clear();
    if (this._selectedId == null || this._scale <= 0) return;
    const rec = this.data.features.find((f) => f.id === this._selectedId);
    if (!rec) return;
    // Underlay: thick low-alpha stroke for a soft glow halo (cheap fake bloom
    // — a real PIXI Filter would cost a render pass we don't need).
    this._tracePath(rec);
    this.graphic.stroke({
      color: SELECTED_STROKE,
      alpha: 0.35,
      width: 8 / this._scale,
      cap: "round",
      join: "round",
    });
    // Overlay: crisp outline so the edge stays sharp at any zoom.
    this._tracePath(rec);
    this.graphic.stroke({
      color: SELECTED_STROKE,
      width: 2.5 / this._scale,
      cap: "round",
      join: "round",
    });
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
