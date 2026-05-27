import type { NationConfig } from "../map.js";

// 王国 (kgd): フランスモデル 攻撃特化
export const kingdom: NationConfig = {
  id: "kgd",
  name: "フランス王国",
  color: "#3a5f9f",
  capitalStateId: "kgd_capital",
  specialty: "attack",
  states: [
    { id: "kgd_capital",    name: "王都",              terrain: "capital",   capitalOf: "kgd", neighbors: ["kgd_artois", "kgd_berry", "kgd_burgundy", "kgd_champagne", "kgd_normandy"] },
    { id: "kgd_normandy",   name: "ノルマンディー",     terrain: "coast",     neighbors: ["kgd_artois", "kgd_berry", "kgd_brittany", "kgd_capital"] },
    { id: "kgd_champagne",  name: "シャンパーニュ",     terrain: "plains",    neighbors: ["kgd_artois", "kgd_burgundy", "kgd_capital", "kgd_lorraine", "neu_rhine"] },
    { id: "kgd_burgundy",   name: "ブルゴーニュ",       terrain: "plains",    neighbors: ["kgd_berry", "kgd_capital", "kgd_champagne", "kgd_dauphine", "kgd_lorraine", "neu_alps"] },
    { id: "kgd_lorraine",   name: "ロレーヌ",           terrain: "forest",    neighbors: ["hol_navarre", "hol_tuscany_n", "kgd_burgundy", "kgd_champagne", "neu_alps", "neu_rhine"] },
    { id: "kgd_brittany",   name: "ブルターニュ",       terrain: "coast",     neighbors: ["kgd_berry", "kgd_gascony", "kgd_normandy"] },
    { id: "kgd_berry",      name: "ベリー",             terrain: "plains",    neighbors: ["kgd_brittany", "kgd_burgundy", "kgd_capital", "kgd_dauphine", "kgd_gascony", "kgd_normandy"] },
    { id: "kgd_gascony",    name: "ガスコーニュ",       terrain: "plains",    neighbors: ["kgd_aragon", "kgd_basque", "kgd_berry", "kgd_brittany", "kgd_dauphine", "kgd_languedoc"] },
    { id: "kgd_languedoc",  name: "ラングドック",       terrain: "coast",     neighbors: ["kgd_aragon", "kgd_catalonia", "kgd_dauphine", "kgd_gascony", "kgd_provence"] },
    { id: "kgd_dauphine",   name: "ドーフィネ",         terrain: "mountains", neighbors: ["kgd_berry", "kgd_burgundy", "kgd_gascony", "kgd_languedoc", "kgd_provence", "neu_alps", "rep_piedmont"] },
    { id: "kgd_artois",     name: "アルトワ",           terrain: "coast",     neighbors: ["kgd_capital", "kgd_champagne", "kgd_normandy", "neu_rhine"] },
    { id: "kgd_provence",   name: "プロヴァンス",       terrain: "coast",     neighbors: ["kgd_dauphine", "kgd_languedoc", "rep_piedmont"], straitTo: ["hol_sardinia"] },

    // ---- イベリア半島 ----
    { id: "kgd_castille",    name: "カスティーリャ王領",   terrain: "plains",    neighbors: ["kgd_andalusia", "kgd_aragon", "kgd_castille_n", "kgd_extremadura", "kgd_leon", "kgd_valencia"] },
    { id: "kgd_castille_n",  name: "カスティーリャ北部",   terrain: "plains",    neighbors: ["kgd_aragon", "kgd_basque", "kgd_castille", "kgd_leon"] },
    { id: "kgd_extremadura", name: "エストレマドゥーラ王領", terrain: "plains",  neighbors: ["kgd_andalusia", "kgd_castille", "kgd_leon", "kgd_portugal_w"] },
    { id: "kgd_leon",        name: "レオン王領",           terrain: "mountains", neighbors: ["kgd_basque", "kgd_castille", "kgd_castille_n", "kgd_extremadura", "kgd_portugal_w"] },
    { id: "kgd_andalusia",   name: "アンダルシア王領",     terrain: "coast",     neighbors: ["kgd_castille", "kgd_extremadura", "kgd_portugal_w", "kgd_valencia"], straitTo: ["dch_morocco_n"] },
    { id: "kgd_aragon",      name: "アラゴン王領",         terrain: "mountains", neighbors: ["kgd_basque", "kgd_castille", "kgd_castille_n", "kgd_catalonia", "kgd_gascony", "kgd_languedoc", "kgd_valencia"] },
    { id: "kgd_catalonia",   name: "カタルーニャ王領",     terrain: "coast",     neighbors: ["kgd_aragon", "kgd_languedoc", "kgd_valencia"] },
    { id: "kgd_valencia",    name: "バレンシア王領",       terrain: "coast",     neighbors: ["kgd_andalusia", "kgd_aragon", "kgd_castille", "kgd_catalonia"] },
    { id: "kgd_basque",      name: "バスク・ナバラ王領",   terrain: "mountains", neighbors: ["kgd_aragon", "kgd_castille_n", "kgd_gascony", "kgd_leon", "kgd_portugal_w"] },
    { id: "kgd_portugal_w",  name: "ポルトガル王領",       terrain: "coast",     neighbors: ["kgd_andalusia", "kgd_basque", "kgd_extremadura", "kgd_leon"] },

    // ---- 旧中立 ----
    { id: "neu_rhine",  name: "ライン回廊", terrain: "plains", neighbors: ["hol_lazio", "hol_navarre", "kgd_artois", "kgd_champagne", "kgd_lorraine"], straitTo: ["fed_london"] },
  ],
};
