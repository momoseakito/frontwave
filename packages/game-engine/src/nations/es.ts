import type { NationConfig } from "../map.js";

// スペイン: es本国全州
export const spain: NationConfig = {
  id: "es",
  name: "スペイン",
  color: "#ca8a04",
  capitalStateId: "es_madrid",
  states: [
    { id: "es_madrid",     name: "マドリード",          terrain: "capital", capitalOf: "es", neighbors: ["es_castile", "es_extremadura", "es_basque", "es_aragon", "es_galicia", "es_andalusia"] },
    { id: "es_catalonia",  name: "カタルーニャ",        terrain: "coast",   neighbors: ["es_basque", "es_aragon", "es_valencia", "fr_aquitaine", "fr_rhone"] },
    { id: "es_basque",     name: "バスク",              terrain: "mountains",neighbors: ["es_madrid", "es_castile", "es_aragon", "es_catalonia", "fr_aquitaine"] },
    { id: "es_castile",    name: "カスティーリャ",      terrain: "plains",  neighbors: ["es_madrid", "es_basque", "es_aragon", "es_catalonia", "es_galicia", "es_extremadura", "es_andalusia"] },
    { id: "es_galicia",    name: "ガリシア",            terrain: "coast",   neighbors: ["es_madrid", "es_castile", "es_extremadura", "es_andalusia", "fr_aquitaine"] },
    { id: "es_andalusia",  name: "アンダルシア",        terrain: "coast",   neighbors: ["es_madrid", "es_castile", "es_galicia", "es_extremadura"] },
    { id: "es_aragon",     name: "アラゴン",            terrain: "mountains",neighbors: ["es_madrid", "es_castile", "es_catalonia", "es_basque", "es_valencia"] },
    { id: "es_valencia",   name: "バレンシア",          terrain: "coast",   neighbors: ["es_catalonia", "es_aragon", "es_castile", "es_andalusia"] },
    { id: "es_extremadura",name: "エストレマドゥーラ",  terrain: "plains",  neighbors: ["es_madrid", "es_castile", "es_galicia", "es_andalusia"] },
  ],
};
