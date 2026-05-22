import type { NationConfig } from "../map.js";

// フランス: fr本国 + ベネルクス南部（ベルギー・ルクセンブルク）
export const france: NationConfig = {
  id: "fr",
  name: "フランス",
  color: "#3b82f6",
  capitalStateId: "fr_paris",
  states: [
    // ===== フランス本国 =====
    { id: "fr_paris",    name: "パリ",           terrain: "capital", capitalOf: "fr", neighbors: ["fr_nord", "fr_normandy", "fr_brittany", "fr_lorraine", "fr_burgundy", "bn_wallonia", "bn_brussels"] },
    { id: "fr_nord",     name: "ノール",         terrain: "coast",   neighbors: ["fr_paris", "fr_normandy", "fr_lorraine", "gb_southeast", "bn_flanders", "bn_brussels"] },
    { id: "fr_lorraine", name: "ロレーヌ",       terrain: "forest",  neighbors: ["fr_paris", "fr_nord", "fr_burgundy", "fr_rhone", "de_hessen", "de_rhineland", "de_bavaria", "bn_luxembourg", "bn_wallonia"] },
    { id: "fr_aquitaine",name: "アキテーヌ",     terrain: "plains",  neighbors: ["fr_rhone", "fr_brittany", "fr_provence", "es_basque", "es_galicia", "es_catalonia"] },
    { id: "fr_rhone",    name: "ローヌ＝アルプ", terrain: "mountains",neighbors: ["fr_lorraine", "fr_burgundy", "fr_aquitaine", "fr_provence", "it_piedmont", "es_catalonia"] },
    { id: "fr_normandy", name: "ノルマンディー", terrain: "coast",   neighbors: ["fr_paris", "fr_nord", "fr_brittany", "fr_burgundy", "gb_southeast"] },
    { id: "fr_burgundy", name: "ブルゴーニュ",   terrain: "forest",  neighbors: ["fr_paris", "fr_lorraine", "fr_rhone", "fr_normandy"] },
    { id: "fr_provence", name: "プロヴァンス",   terrain: "coast",   neighbors: ["fr_rhone", "fr_aquitaine", "it_piedmont"] },
    { id: "fr_brittany", name: "ブルターニュ",   terrain: "coast",   neighbors: ["fr_paris", "fr_normandy", "fr_aquitaine"] },

    // ===== ベネルクス南部 =====
    { id: "bn_brussels", name: "ブリュッセル",   terrain: "plains",  neighbors: ["fr_paris", "fr_nord", "bn_flanders", "bn_wallonia", "bn_luxembourg", "bn_holland", "bn_liege"] },
    { id: "bn_flanders", name: "フランドル",     terrain: "coast",   neighbors: ["fr_nord", "bn_brussels", "bn_holland", "gb_southeast"] },
    { id: "bn_wallonia", name: "ワロン",         terrain: "forest",  neighbors: ["fr_paris", "fr_lorraine", "bn_brussels", "bn_luxembourg", "bn_liege", "de_rhineland"] },
    { id: "bn_luxembourg",name: "ルクセンブルク",terrain: "plains",  neighbors: ["fr_lorraine", "bn_brussels", "bn_wallonia", "bn_liege", "de_rhineland", "de_hessen"] },
    { id: "bn_liege",    name: "リエージュ",     terrain: "forest",  neighbors: ["bn_brussels", "bn_wallonia", "bn_luxembourg", "de_rhineland"] },
  ],
};
