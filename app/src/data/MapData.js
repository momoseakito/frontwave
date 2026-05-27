// Pure data layer. Takes a raw GeoJSON FeatureCollection plus a d3 projection
// and returns an array of features whose geometry is already projected into
// world-pixel coordinates. Downstream renderers (Canvas2D Path2D, PixiJS Mesh)
// build their own structures from this — no projection happens at render time.
//
// Geometry shape per feature:
//   polygons: [[outerRing, ...holes], [outerRing, ...holes], ...]
//   ring:     [[x, y], [x, y], ...]   (closed; first === last not required)
//
// MultiPolygon yields multiple polygons, Polygon yields one. Hole rings are
// kept in the same array as the outer ring (GeoJSON convention) so callers
// can apply even-odd / earcut hole handling consistently.

export function buildMapData(geoJSON, projection, worldW, worldH) {
  const stream = projection.stream;
  const features = [];

  geoJSON.features.forEach((f, i) => {
    const polygons = projectGeometry(f.geometry, projection);
    if (polygons.length === 0) return;

    const bbox = computeBBox(polygons);
    if (!bbox) return;

    features.push({
      id: i + 1,
      featureId: f.properties.id,
      name: f.properties.name,
      nation: f.properties.nation,
      polygons,
      bbox,                           // [x, y, w, h]
      centroid: computeCentroid(polygons),
    });
  });

  return { worldW, worldH, features };
}

function projectGeometry(geometry, projection) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") {
    const poly = projectPolygon(geometry.coordinates, projection);
    return poly ? [poly] : [];
  }
  if (geometry.type === "MultiPolygon") {
    const out = [];
    for (const polyCoords of geometry.coordinates) {
      const poly = projectPolygon(polyCoords, projection);
      if (poly) out.push(poly);
    }
    return out;
  }
  return [];
}

function projectPolygon(rings, projection) {
  const out = [];
  for (const ring of rings) {
    const projected = [];
    for (const [lon, lat] of ring) {
      const p = projection([lon, lat]);
      if (!p || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) continue;
      projected.push(p);
    }
    if (projected.length >= 3) out.push(projected);
  }
  return out.length > 0 ? out : null;
}

function computeBBox(polygons) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const poly of polygons) {
    for (const ring of poly) {
      for (const [x, y] of ring) {
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
    }
  }
  if (!Number.isFinite(x0)) return null;
  return [x0, y0, x1 - x0, y1 - y0];
}

// Area-weighted centroid of all outer rings. Good enough for label placement;
// caller can override per-feature if a hand-tuned anchor is needed later.
function computeCentroid(polygons) {
  let sx = 0, sy = 0, sa = 0;
  for (const poly of polygons) {
    const outer = poly[0];
    if (!outer || outer.length < 3) continue;
    let cx = 0, cy = 0, a = 0;
    for (let i = 0, n = outer.length; i < n; i++) {
      const [x0, y0] = outer[i];
      const [x1, y1] = outer[(i + 1) % n];
      const cross = x0 * y1 - x1 * y0;
      a += cross;
      cx += (x0 + x1) * cross;
      cy += (y0 + y1) * cross;
    }
    a *= 0.5;
    if (Math.abs(a) < 1e-9) continue;
    sx += cx / 6;
    sy += cy / 6;
    sa += a;
  }
  if (Math.abs(sa) < 1e-9) return null;
  return [sx / sa, sy / sa];
}
