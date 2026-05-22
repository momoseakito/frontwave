export class ProvinceMap {
  constructor() {
    this.width = 0;
    this.height = 0;
    this.projection = null;
    this.imageData = null;
    this._features = [];
    this._idToFeature = new Map();
  }

  build(geoJSON, width, height) {
    this.width = width;
    this.height = height;
    this._features = geoJSON.features;

    const projection = d3.geoMercator().fitSize([width, height], geoJSON);
    this.projection = projection;
    const path = d3.geoPath(projection);

    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext("2d");

    // Fill with black (id=0 means sea/background)
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, width, height);

    geoJSON.features.forEach((feature, index) => {
      const id = index + 1; // 1-based province ID
      const r = (id >> 16) & 0xff;
      const g = (id >> 8) & 0xff;
      const b = id & 0xff;

      ctx.beginPath();
      path(feature);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fill();

      this._idToFeature.set(id, feature.properties);
    });

    this.imageData = ctx.getImageData(0, 0, width, height);
  }

  getProvinceId(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    if (xi < 0 || yi < 0 || xi >= this.width || yi >= this.height) return null;

    const idx = (yi * this.width + xi) * 4;
    const data = this.imageData.data;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const id = (r << 16) | (g << 8) | b;
    return id === 0 ? null : id;
  }

  getFeatureByProvinceId(provinceId) {
    return this._idToFeature.get(provinceId) ?? null;
  }

  get featureCount() {
    return this._features.length;
  }
}
