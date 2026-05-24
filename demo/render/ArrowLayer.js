// Draws an arrow from source.centroid to target.centroid for each ongoing
// engine attack. Color follows the attacker's nation. Stays cheap because the
// arrow set rebuilds only when the list of (source,target,attacker) tuples
// changes — not every animation frame.

export class ArrowLayer {
  constructor(PIXI, mapData) {
    this.PIXI = PIXI;
    this.data = mapData;
    this.graphic = new PIXI.Graphics();
    this.container = this.graphic;
    this._key = "";
    this._items = [];
    this._scale = 0;
  }

  // items: [{ sourceFeatureId, targetFeatureId, color: 0xRRGGBB }, ...]
  setArrows(items) {
    const key = items
      .map((it) => `${it.sourceFeatureId}>${it.targetFeatureId}:${it.color}`)
      .sort()
      .join("|");
    if (key === this._key) return false;
    this._key = key;
    this._items = items;
    this._redraw();
    return true;
  }

  syncToScale(scale) {
    if (this._scale === scale) return;
    this._scale = scale;
    this._redraw();
  }

  _centroidOf(featureId) {
    const rec = this.data.features.find((f) => f.id === featureId);
    return rec?.centroid ?? null;
  }

  _redraw() {
    this.graphic.clear();
    if (this._items.length === 0 || this._scale <= 0) return;
    const w = 2 / this._scale;
    const headLen = 14 / this._scale;
    const headHalfW = 7 / this._scale;
    for (const it of this._items) {
      const a = this._centroidOf(it.sourceFeatureId);
      const b = this._centroidOf(it.targetFeatureId);
      if (!a || !b) continue;
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len = Math.hypot(dx, dy);
      if (len < 1) continue;
      const ux = dx / len;
      const uy = dy / len;
      // Stop the shaft before the arrowhead so the tip caps cleanly.
      const tipX = b[0];
      const tipY = b[1];
      const shaftEndX = tipX - ux * headLen;
      const shaftEndY = tipY - uy * headLen;

      this.graphic.moveTo(a[0], a[1]);
      this.graphic.lineTo(shaftEndX, shaftEndY);
      this.graphic.stroke({ color: it.color, alpha: 0.9, width: w, cap: "round", join: "round" });

      // Arrow head as a filled triangle.
      const leftX = shaftEndX + uy * headHalfW;
      const leftY = shaftEndY - ux * headHalfW;
      const rightX = shaftEndX - uy * headHalfW;
      const rightY = shaftEndY + ux * headHalfW;
      this.graphic.moveTo(tipX, tipY);
      this.graphic.lineTo(leftX, leftY);
      this.graphic.lineTo(rightX, rightY);
      this.graphic.lineTo(tipX, tipY);
      this.graphic.fill({ color: it.color, alpha: 0.9 });
    }
  }
}
