// One PIXI.Graphics per province polygon. Fill is rebuilt on owner / mode /
// selection changes; geometry vertices are uploaded once and never touched
// after that (Graphics retains the path, only the fill style changes).

const SELECTED_FILL = { color: 0xffffff, alpha: 0.18 };

export class ProvinceLayer {
  constructor(PIXI, mapData, gameState) {
    this.PIXI = PIXI;
    this.data = mapData;
    this.state = gameState;
    this.container = new PIXI.Container();
    this.entries = [];  // [{rec, graphic}]
    this.mode = "political";

    for (const rec of mapData.features) {
      const g = new PIXI.Graphics();
      this._traceGeometry(g, rec);
      g.fill({ color: 0x64748b });
      this.container.addChild(g);
      this.entries.push({ rec, graphic: g });
    }
  }

  setMode(mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.refreshFills();
  }

  refreshFills() {
    for (const { rec, graphic } of this.entries) {
      graphic.clear();
      this._traceGeometry(graphic, rec);
      graphic.fill({ color: this._fillColor(rec.id) });
      if (this.state.selectedProvince === rec.id) {
        this._traceGeometry(graphic, rec);
        graphic.fill(SELECTED_FILL);
      }
    }
  }

  _traceGeometry(g, rec) {
    for (const poly of rec.polygons) {
      for (let r = 0; r < poly.length; r++) {
        const ring = poly[r];
        if (ring.length < 3) continue;
        const flat = new Array(ring.length * 2);
        for (let i = 0; i < ring.length; i++) {
          flat[i * 2] = ring[i][0];
          flat[i * 2 + 1] = ring[i][1];
        }
        g.poly(flat);
      }
    }
  }

  _fillColor(provinceId) {
    if (this.mode === "political") {
      const hex = this.state.getCountryColorHex(this.state.getOwner(provinceId));
      return hexStringToNumber(hex);
    }
    // Province mode: deterministic distinct color per province via golden-angle hue.
    const hue = (provinceId * 137.508) % 360;
    return hslToRgbNumber(hue, 0.6, 0.55);
  }
}

function hexStringToNumber(hex) {
  if (typeof hex !== "string") return 0x64748b;
  const s = hex.startsWith("#") ? hex.slice(1) : hex;
  const n = parseInt(s, 16);
  return Number.isFinite(n) ? n : 0x64748b;
}

function hslToRgbNumber(h, s, l) {
  // h in [0, 360), s/l in [0, 1].
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  const R = Math.round((r + m) * 255);
  const G = Math.round((g + m) * 255);
  const B = Math.round((b + m) * 255);
  return (R << 16) | (G << 8) | B;
}
