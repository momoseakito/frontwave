import { geoAlbers } from 'd3-geo';

const EUROPE_DEFAULTS = {
  rotate: [-22, 0],
  center: [0, 52],
  parallels: [35, 65],
};

export function createEuropeProjection(geoJSON, worldW, worldH) {
  return geoAlbers()
    .rotate(EUROPE_DEFAULTS.rotate)
    .center(EUROPE_DEFAULTS.center)
    .parallels(EUROPE_DEFAULTS.parallels)
    .fitSize([worldW, worldH], geoJSON);
}
