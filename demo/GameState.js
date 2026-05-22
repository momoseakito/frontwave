// Country colors derived from @asobee/game-strategy NATIONS_DEF
const COUNTRY_DEFS = {
  de: { name: "ドイツ",           color: [107, 114, 128], tag: "de" },
  fr: { name: "フランス",         color: [59,  130, 246], tag: "fr" },
  gb: { name: "イギリス",         color: [239, 68,  68 ], tag: "gb" },
  it: { name: "イタリア",         color: [22,  163, 74 ], tag: "it" },
  es: { name: "スペイン",         color: [202, 138, 4  ], tag: "es" },
  pl: { name: "ポーランド",       color: [249, 115, 22 ], tag: "pl" },
  su: { name: "ロシア",           color: [185, 28,  28 ], tag: "su" },
  at: { name: "オーストリア",     color: [167, 139, 250], tag: "at" },
  tr: { name: "オスマン帝国",     color: [16,  185, 129], tag: "tr" },
  sc: { name: "スカンジナビア",   color: [6,   182, 212], tag: "sc" },
  bn: { name: "ベネルクス",       color: [245, 158, 11 ], tag: "bn" },
};

export class GameState {
  constructor() {
    // Map<provinceId: number, { ownerId: string, name: string, featureId: string }>
    this.provinces = new Map();
    // Map<countryId: string, { name, color: [r,g,b], tag }>
    this.countries = new Map();
    this.selectedProvince = null;
  }

  initFromGeoJSON(geoJSON) {
    for (const [id, def] of Object.entries(COUNTRY_DEFS)) {
      this.countries.set(id, { ...def });
    }

    geoJSON.features.forEach((feature, index) => {
      const provinceId = index + 1;
      const { id: featureId, name, nation } = feature.properties;
      this.provinces.set(provinceId, {
        ownerId: nation,
        name,
        featureId,
      });
    });
  }

  getOwner(provinceId) {
    return this.provinces.get(provinceId)?.ownerId ?? null;
  }

  setOwner(provinceId, countryId) {
    const p = this.provinces.get(provinceId);
    if (p) p.ownerId = countryId;
  }

  selectProvince(provinceId) {
    this.selectedProvince = this.selectedProvince === provinceId ? null : provinceId;
  }

  getCountryColor(countryId) {
    return this.countries.get(countryId)?.color ?? [128, 128, 128];
  }

  getCountryName(countryId) {
    return this.countries.get(countryId)?.name ?? countryId;
  }

  getCountryProvinces(countryId) {
    const result = [];
    for (const [id, p] of this.provinces) {
      if (p.ownerId === countryId) result.push(id);
    }
    return result;
  }
}
