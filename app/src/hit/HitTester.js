// Renderer-agnostic hit testing in world coordinates. Uses the MapData polygon
// arrays directly (no Path2D / canvas dependency) so it works for both the
// Canvas2D and PixiJS renderers.

export class HitTester {
  constructor(mapData) {
    this.features = mapData.features;
  }

  // Returns the feature record under (worldX, worldY) or null.
  pick(worldX, worldY) {
    for (const rec of this.features) {
      const [bx, by, bw, bh] = rec.bbox;
      if (worldX < bx || worldY < by || worldX > bx + bw || worldY > by + bh) continue;
      if (pointInPolygons(rec.polygons, worldX, worldY)) return rec;
    }
    return null;
  }
}

// Even-odd point-in-polygon over a MultiPolygon-style array.
// Holes work automatically because each hole ring flips the parity.
function pointInPolygons(polygons, x, y) {
  let inside = false;
  for (const poly of polygons) {
    for (const ring of poly) {
      if (pointInRing(ring, x, y)) inside = !inside;
    }
  }
  return inside;
}

function pointInRing(ring, x, y) {
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect = ((yi > y) !== (yj > y))
      && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
