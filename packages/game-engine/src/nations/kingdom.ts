import type { NationConfig } from "../map.js";

// 王国 (kgd): フランスモデル 攻撃特化 22州 (フランス12 + イベリア10)
export const kingdom: NationConfig = {
  id: "kgd",
  name: "王国",
  color: "#1f4d8a",
  capitalStateId: "kgd_capital",
  specialty: "attack",
  states: [
    { id: "kgd_capital",   name: "王都",             terrain: "capital",   capitalOf: "kgd", neighbors: ["kgd_normandy", "kgd_champagne", "kgd_burgundy", "kgd_berry", "kgd_lorraine"] },
    { id: "kgd_normandy",  name: "ノルマンディー",    terrain: "coast",     neighbors: ["kgd_capital", "kgd_champagne", "kgd_brittany", "kgd_artois"] },
    { id: "kgd_champagne", name: "シャンパーニュ",    terrain: "plains",    neighbors: ["kgd_capital", "kgd_normandy", "kgd_burgundy", "kgd_lorraine", "kgd_artois", "neu_rhine"] },
    { id: "kgd_burgundy",  name: "ブルゴーニュ",      terrain: "plains",    neighbors: ["kgd_capital", "kgd_champagne", "kgd_berry", "kgd_dauphine", "kgd_lorraine", "emp_swabia", "neu_rhine"] },
    { id: "kgd_lorraine",  name: "ロレーヌ",          terrain: "forest",    neighbors: ["kgd_capital", "kgd_champagne", "kgd_burgundy", "neu_rhine", "emp_franconia", "emp_westmark"] },
    { id: "kgd_brittany",  name: "ブルターニュ",      terrain: "coast",     neighbors: ["kgd_normandy", "kgd_berry", "kgd_gascony"] },
    { id: "kgd_berry",     name: "ベリー",            terrain: "plains",    neighbors: ["kgd_capital", "kgd_burgundy", "kgd_brittany", "kgd_gascony", "kgd_languedoc"] },
    { id: "kgd_gascony",   name: "ガスコーニュ",      terrain: "plains",    neighbors: ["kgd_brittany", "kgd_berry", "kgd_languedoc", "neu_pyrenees", "hol_navarre", "kgd_basque"] },
    { id: "kgd_languedoc", name: "ラングドック",      terrain: "coast",     neighbors: ["kgd_berry", "kgd_gascony", "kgd_dauphine", "hol_catalonia", "neu_pyrenees", "kgd_catalonia"] },
    { id: "kgd_dauphine",  name: "ドーフィネ",        terrain: "mountains", neighbors: ["kgd_burgundy", "kgd_berry", "kgd_languedoc", "rep_piedmont", "neu_alps"] },
    { id: "kgd_artois",    name: "アルトワ",          terrain: "coast",     neighbors: ["kgd_normandy", "kgd_champagne", "emp_brabant", "neu_flanders"] },
    { id: "kgd_provence",  name: "プロヴァンス",      terrain: "coast",     neighbors: ["kgd_dauphine", "kgd_languedoc", "rep_piedmont", "kgd_catalonia"], straitTo: ["neu_corsica"] },

    // ---- イベリア半島 (v4: castille/catalonia をさらに 3 分割) ----
    { id: "kgd_castille",   name: "カスティーリャ王領", terrain: "plains",    neighbors: ["kgd_andalusia", "kgd_aragon", "kgd_basque", "kgd_extremadura", "kgd_leon", "kgd_valencia"] },
    { id: "kgd_extremadura",name: "エストレマドゥーラ王領", terrain: "plains", neighbors: ["kgd_castille", "kgd_andalusia", "kgd_portugal_w", "kgd_leon"] },
    { id: "kgd_leon",       name: "レオン王領",        terrain: "mountains", neighbors: ["kgd_castille", "kgd_extremadura", "kgd_basque", "kgd_portugal_w"] },
    { id: "kgd_andalusia",  name: "アンダルシア王領",  terrain: "coast",     neighbors: ["kgd_castille", "kgd_extremadura", "kgd_portugal_w", "kgd_valencia"], straitTo: ["dch_maghreb"] },
    { id: "kgd_aragon",     name: "アラゴン王領",      terrain: "mountains", neighbors: ["kgd_castille", "kgd_catalonia", "kgd_basque", "kgd_valencia", "neu_pyrenees"] },
    { id: "kgd_catalonia",  name: "カタルーニャ王領",  terrain: "coast",     neighbors: ["kgd_aragon", "kgd_valencia", "kgd_languedoc", "kgd_provence", "neu_pyrenees"], straitTo: ["kgd_baleares"] },
    { id: "kgd_valencia",   name: "バレンシア王領",    terrain: "coast",     neighbors: ["kgd_castille", "kgd_andalusia", "kgd_aragon", "kgd_catalonia"], straitTo: ["kgd_baleares"] },
    { id: "kgd_baleares",   name: "バレアレス王領",    terrain: "coast",     neighbors: [], straitTo: ["kgd_catalonia", "kgd_valencia"] },
    { id: "kgd_basque",     name: "バスク・ナバラ王領", terrain: "mountains", neighbors: ["kgd_castille", "kgd_aragon", "kgd_leon", "kgd_gascony", "neu_pyrenees"] },
    { id: "kgd_portugal_w", name: "ポルトガル王領",    terrain: "coast",     neighbors: ["kgd_extremadura", "kgd_andalusia", "kgd_leon"] },
  ],
};
