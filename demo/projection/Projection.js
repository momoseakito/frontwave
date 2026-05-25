// Wraps d3-geo so the rest of the app never imports d3 directly. Swap the
// implementation here (Mercator, Lambert, custom) without touching renderers.
//
// Albers equal-area conic centred on Europe preserves relative province size
// (national power reads from area) and gives the slightly-curved silhouette
// familiar from Paradox-style strategy games.

const EUROPE_DEFAULTS = {
  rotate: [-22, 0],   // central meridian at 22°E (covers Iberia to Urals)
  center: [0, 52],    // latitude of origin at 52°N
  parallels: [35, 65],
};

export function createEuropeProjection(geoJSON, worldW, worldH) {
  return d3.geoAlbers()
    .rotate(EUROPE_DEFAULTS.rotate)
    .center(EUROPE_DEFAULTS.center)
    .parallels(EUROPE_DEFAULTS.parallels)
    .fitSize([worldW, worldH], geoJSON);
}
