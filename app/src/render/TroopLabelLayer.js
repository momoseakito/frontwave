// Renders troop counts as HTML <span> elements overlaid on the map canvas.
// Because labels live in the DOM (not the PIXI canvas), they are always
// rendered at full device resolution regardless of RENDER_RESOLUTION.

const MIN_SCREEN_SIZE = 18; // hide label if province bbox screen-size < this px

export class TroopLabelLayer {
  constructor(_PIXI, mapData, gameState, options = {}) {
    this.data = mapData;
    this.state = gameState;
    // Dummy container so PixiMapApp doesn't need to special-case this layer.
    this.container = { visible: false };

    this._el = options.troopLabelContainer ?? document.getElementById("troop-labels");
    // featureId -> { span, worldX, worldY, bboxW, bboxH }
    this._entries = new Map();

    for (const rec of mapData.features) {
      if (!rec.centroid) continue;
      const span = document.createElement("span");
      this._el.appendChild(span);
      this._entries.set(rec.id, {
        span,
        worldX: rec.centroid[0],
        worldY: rec.centroid[1],
        bboxW: rec.bbox[2],
        bboxH: rec.bbox[3],
      });
    }
  }

  syncToCamera(camera) {
    for (const { span, worldX, worldY, bboxW, bboxH } of this._entries.values()) {
      const screenSize = Math.min(bboxW, bboxH) * camera.scale;
      if (screenSize < MIN_SCREEN_SIZE) {
        span.style.display = "none";
        continue;
      }
      span.style.display = "";
      span.style.left = (camera.tx + worldX * camera.scale) + "px";
      span.style.top  = (camera.ty + worldY * camera.scale) + "px";
    }
  }

  syncToScale(_scale) {}

  refresh() {
    for (const rec of this.data.features) {
      const entry = this._entries.get(rec.id);
      if (!entry) continue;
      const info = this.state.getProvinceInfo(rec.id);
      entry.span.textContent = info ? _formatTroops(info.troops) : "";
    }
  }
}

function _formatTroops(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}
