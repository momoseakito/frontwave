import type { NationConfig } from "../map.js";

// 王国 (kgd): フランスモデル 攻撃特化
export const kingdom: NationConfig = {
  id: "kgd",
  name: "王国",
  color: "#1f4d8a",
  capitalStateId: "kgd_capital",
  specialty: "attack",
  states: [
    { id: "kgd_capital",    name: "王都",              terrain: "capital",   capitalOf: "kgd", neighbors: ["kgd_normandy", "kgd_champagne", "kgd_burgundy", "kgd_berry", "kgd_lorraine"] },
    { id: "kgd_normandy",   name: "ノルマンディー",     terrain: "coast",     neighbors: ["kgd_capital", "kgd_champagne", "kgd_brittany", "kgd_artois"] },
    { id: "kgd_champagne",  name: "シャンパーニュ",     terrain: "plains",    neighbors: ["kgd_capital", "kgd_normandy", "kgd_burgundy", "kgd_lorraine", "kgd_artois", "neu_rhine"] },
    { id: "kgd_burgundy",   name: "ブルゴーニュ",       terrain: "plains",    neighbors: ["kgd_capital", "kgd_champagne", "kgd_berry", "kgd_dauphine", "kgd_lorraine", "emp_swabia_s", "neu_rhine"] },
    { id: "kgd_lorraine",   name: "ロレーヌ",           terrain: "forest",    neighbors: ["kgd_capital", "kgd_champagne", "kgd_burgundy", "neu_rhine", "emp_franconia_w", "emp_westmark"] },
    { id: "kgd_brittany",   name: "ブルターニュ",       terrain: "coast",     neighbors: ["kgd_normandy", "kgd_berry", "kgd_gascony"] },
    { id: "kgd_berry",      name: "ベリー",             terrain: "plains",    neighbors: ["kgd_capital", "kgd_burgundy", "kgd_brittany", "kgd_gascony", "kgd_languedoc"] },
    { id: "kgd_gascony",    name: "ガスコーニュ",       terrain: "plains",    neighbors: ["kgd_brittany", "kgd_berry", "kgd_languedoc", "kgd_basque"] },
    { id: "kgd_languedoc",  name: "ラングドック",       terrain: "coast",     neighbors: ["kgd_berry", "kgd_gascony", "kgd_dauphine", "kgd_catalonia"] },
    { id: "kgd_dauphine",   name: "ドーフィネ",         terrain: "mountains", neighbors: ["kgd_burgundy", "kgd_berry", "kgd_languedoc", "kgd_provence", "rep_piedmont", "neu_alps"] },
    { id: "kgd_artois",     name: "アルトワ",           terrain: "coast",     neighbors: ["kgd_normandy", "kgd_champagne", "neu_rhine"] },
    { id: "kgd_provence",   name: "プロヴァンス",       terrain: "coast",     neighbors: ["kgd_dauphine", "kgd_languedoc", "rep_piedmont", "kgd_catalonia"], straitTo: ["hol_sardinia"] },

    // ---- イベリア半島 ----
    { id: "kgd_castille",    name: "カスティーリャ王領",   terrain: "plains",    neighbors: ["kgd_castille_n", "kgd_andalusia", "kgd_aragon", "kgd_basque", "kgd_extremadura", "kgd_leon", "kgd_valencia"] },
    { id: "kgd_castille_n",  name: "カスティーリャ北部",   terrain: "plains",    neighbors: ["kgd_castille", "kgd_aragon", "kgd_basque", "kgd_leon"] },
    { id: "kgd_extremadura", name: "エストレマドゥーラ王領", terrain: "plains",  neighbors: ["kgd_castille", "kgd_andalusia", "kgd_portugal_w", "kgd_leon"] },
    { id: "kgd_leon",        name: "レオン王領",           terrain: "mountains", neighbors: ["kgd_castille", "kgd_castille_n", "kgd_extremadura", "kgd_basque", "kgd_portugal_w"] },
    { id: "kgd_andalusia",   name: "アンダルシア王領",     terrain: "coast",     neighbors: ["kgd_castille", "kgd_extremadura", "kgd_portugal_w", "kgd_valencia"], straitTo: ["dch_morocco_n"] },
    { id: "kgd_aragon",      name: "アラゴン王領",         terrain: "mountains", neighbors: ["kgd_castille", "kgd_castille_n", "kgd_catalonia", "kgd_basque", "kgd_valencia"] },
    { id: "kgd_catalonia",   name: "カタルーニャ王領",     terrain: "coast",     neighbors: ["kgd_aragon", "kgd_valencia", "kgd_languedoc", "kgd_provence"] },
    { id: "kgd_valencia",    name: "バレンシア王領",       terrain: "coast",     neighbors: ["kgd_castille", "kgd_andalusia", "kgd_aragon", "kgd_catalonia"] },
    { id: "kgd_basque",      name: "バスク・ナバラ王領",   terrain: "mountains", neighbors: ["kgd_castille", "kgd_castille_n", "kgd_aragon", "kgd_leon", "kgd_gascony"] },
    { id: "kgd_portugal_w",  name: "ポルトガル王領",       terrain: "coast",     neighbors: ["kgd_extremadura", "kgd_andalusia", "kgd_leon"] },

    // ---- 旧中立 ----
    { id: "neu_rhine",  name: "ライン回廊", terrain: "plains", neighbors: ["emp_westmark", "kgd_lorraine", "kgd_burgundy", "kgd_champagne", "kgd_artois"], straitTo: ["fed_london"] },
  ],
};
