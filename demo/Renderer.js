// Converts HSL to RGB array [r, g, b] (0-255)
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

// Clamp a channel to [0, 255]
function clamp(v) {
  return Math.max(0, Math.min(255, v));
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }

  render(provinceMap, gameState, mode) {
    const { width, height } = provinceMap;
    const src = provinceMap.imageData.data;
    const out = new Uint8ClampedArray(width * height * 4);
    const selected = gameState.selectedProvince;

    for (let i = 0; i < width * height; i++) {
      const si = i * 4;
      const r = src[si];
      const g = src[si + 1];
      const b = src[si + 2];
      const provinceId = (r << 16) | (g << 8) | b;

      if (provinceId === 0) {
        // Sea / background — deep blue-gray
        out[si] = 40;
        out[si + 1] = 60;
        out[si + 2] = 90;
        out[si + 3] = 255;
        continue;
      }

      let cr, cg, cb;

      if (mode === "political") {
        const ownerId = gameState.getOwner(provinceId);
        const color = gameState.getCountryColor(ownerId);
        [cr, cg, cb] = color;
      } else {
        // Province mode: unique color per province using golden-angle hue
        const hue = (provinceId * 137.508) % 360;
        [cr, cg, cb] = hslToRgb(hue, 60, 55);
      }

      // Brighten selected province
      if (provinceId === selected) {
        cr = clamp(cr + 40);
        cg = clamp(cg + 40);
        cb = clamp(cb + 40);
      }

      out[si] = cr;
      out[si + 1] = cg;
      out[si + 2] = cb;
      out[si + 3] = 255;
    }

    const imageData = new ImageData(out, width, height);
    this.ctx.putImageData(imageData, 0, 0);

    this._drawBorders(provinceMap, gameState);
  }

  _drawBorders(provinceMap, gameState) {
    const { width, height } = provinceMap;
    const src = provinceMap.imageData.data;

    // Work on the already-rendered canvas pixels
    const imgData = this.ctx.getImageData(0, 0, width, height);
    const pixels = imgData.data;

    const getProvinceId = (x, y) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return 0;
      const si = (y * width + x) * 4;
      const r = src[si];
      const g = src[si + 1];
      const b = src[si + 2];
      return (r << 16) | (g << 8) | b;
    };

    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        const id = getProvinceId(x, y);
        if (id === 0) continue;

        const idRight = getProvinceId(x + 1, y);
        const idDown = getProvinceId(x, y + 1);

        const ownerCurr = gameState.getOwner(id);

        for (const [nx, ny, nid] of [[x + 1, y, idRight], [x, y + 1, idDown]]) {
          if (nid === id) continue;

          let br, bg, bb, ba;
          if (nid === 0) {
            // Coast — soft border
            br = 0; bg = 0; bb = 0; ba = 80;
          } else {
            const ownerNeighbor = gameState.getOwner(nid);
            if (ownerCurr !== ownerNeighbor) {
              // Nation border — strong
              br = 0; bg = 0; bb = 0; ba = 200;
            } else {
              // Province border within same nation — subtle
              br = 0; bg = 0; bb = 0; ba = 60;
            }
          }

          // Blend border onto current pixel and neighbor pixel
          for (const [px, py] of [[x, y], [nx, ny]]) {
            const pi = (py * width + px) * 4;
            const alpha = ba / 255;
            pixels[pi]     = Math.round(pixels[pi]     * (1 - alpha) + br * alpha);
            pixels[pi + 1] = Math.round(pixels[pi + 1] * (1 - alpha) + bg * alpha);
            pixels[pi + 2] = Math.round(pixels[pi + 2] * (1 - alpha) + bb * alpha);
          }
        }
      }
    }

    this.ctx.putImageData(imgData, 0, 0);
  }
}
