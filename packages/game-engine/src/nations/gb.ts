import type { NationConfig } from "../map.js";

// イギリス: gb本国全州
export const britain: NationConfig = {
  id: "gb",
  name: "イギリス",
  color: "#ef4444",
  capitalStateId: "gb_london",
  states: [
    { id: "gb_london",           name: "ロンドン",         terrain: "capital", capitalOf: "gb", neighbors: ["gb_southeast", "gb_southwest", "gb_east_midlands", "gb_yorkshire"] },
    { id: "gb_southeast",        name: "南東イングランド", terrain: "coast",   neighbors: ["gb_london", "gb_yorkshire", "gb_wales", "fr_nord", "fr_normandy", "bn_flanders"] },
    { id: "gb_southwest",        name: "南西イングランド", terrain: "coast",   neighbors: ["gb_london", "gb_southeast", "gb_wales"] },
    { id: "gb_yorkshire",        name: "ヨークシャー",     terrain: "plains",  neighbors: ["gb_london", "gb_southeast", "gb_east_midlands", "gb_northwest", "gb_scotland"] },
    { id: "gb_east_midlands",    name: "東ミッドランズ",   terrain: "plains",  neighbors: ["gb_london", "gb_yorkshire", "gb_northwest", "gb_wales"] },
    { id: "gb_northwest",        name: "北西イングランド", terrain: "coast",   neighbors: ["gb_yorkshire", "gb_east_midlands", "gb_wales", "gb_scotland", "gb_northern_ireland"] },
    { id: "gb_wales",            name: "ウェールズ",       terrain: "mountains",neighbors: ["gb_southeast", "gb_southwest", "gb_east_midlands", "gb_northwest"] },
    { id: "gb_scotland",         name: "スコットランド",   terrain: "mountains",neighbors: ["gb_yorkshire", "gb_northwest"] },
    { id: "gb_northern_ireland", name: "北アイルランド",   terrain: "coast",   neighbors: ["gb_northwest"] },
  ],
};
