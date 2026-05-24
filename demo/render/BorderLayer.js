// Province + national borders as PIXI.Graphics polylines. Line width is in
// world units; we rebuild only when the camera scale changes by more than a
// small threshold so that strokes stay ~1 screen pixel thin regardless of
// zoom without paying the rebuild cost every frame.
//
// Geometry is the same closed ring data MapData produced; the national stroke
// is the union of all rings belonging to a single nation drawn at a heavier
// width.

const PROVINCE_STROKE = 0x000000;
const PROVINCE_STROKE_ALPHA = 0.35;
const NATION_STROKE = 0x000000;
const NATION_STROKE_ALPHA = 0.85;

const SCALE_REBUILD_THRESHOLD = 0.08; // 8% scale change triggers a rebuild

export class BorderLayer {
  constructor(PIXI, mapData) {
    this.PIXI = PIXI;
    this.data = mapData;
    this.container = new PIXI.Container();
    this.provinceG = new PIXI.Graphics();
    this.nationG = new PIXI.Graphics();
    this.container.addChild(this.provinceG, this.nationG);
    this._lastScale = 0;

    this._nationGroups = new Map(); // nation -> rec[]
    for (const rec of mapData.features) {
      let list = this._nationGroups.get(rec.nation);
      if (!list) {
        list = [];
        this._nationGroups.set(rec.nation, list);
      }
      list.push(rec);
    }
  }

  // Called by the render loop with the current camera scale (world→screen).
  syncToScale(scale) {
    if (this._lastScale > 0
        && Math.abs(scale - this._lastScale) / this._lastScale < SCALE_REBUILD_THRESHOLD) {
      return;
    }
    this._lastScale = scale;
    const thin = 1 / scale;
    const thick = 2 / scale;

    this.provinceG.clear();
    for (const rec of this.data.features) tracePolylines(this.provinceG, rec.polygons);
    this.provinceG.stroke({
      color: PROVINCE_STROKE,
      alpha: PROVINCE_STROKE_ALPHA,
      width: thin,
      cap: "round",
      join: "round",
    });

    this.nationG.clear();
    for (const list of this._nationGroups.values()) {
      for (const rec of list) tracePolylines(this.nationG, rec.polygons);
    }
    this.nationG.stroke({
      color: NATION_STROKE,
      alpha: NATION_STROKE_ALPHA,
      width: thick,
      cap: "round",
      join: "round",
    });
  }
}

function tracePolylines(g, polygons) {
  for (const poly of polygons) {
    for (const ring of poly) {
      if (ring.length < 2) continue;
      g.moveTo(ring[0][0], ring[0][1]);
      for (let i = 1; i < ring.length; i++) g.lineTo(ring[i][0], ring[i][1]);
      g.lineTo(ring[0][0], ring[0][1]);
    }
  }
}
