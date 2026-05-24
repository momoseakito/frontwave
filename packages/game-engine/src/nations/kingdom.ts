import type { NationConfig } from "../map.js";

// 王国 (kgd): フランスモデル 攻撃特化 12州
export const kingdom: NationConfig = {
  id: "kgd",
  name: "王国",
  color: "#3b82f6",
  capitalStateId: "kgd_capital",
  specialty: "attack",
  states: [
    { id: "kgd_capital",  name: "王都",         terrain: "capital",   capitalOf: "kgd", neighbors: ["kgd_normandy", "kgd_champagne", "kgd_burgundy", "kgd_berry", "kgd_lorraine"] },
    { id: "kgd_normandy", name: "ノルマンディー", terrain: "coast",    neighbors: ["kgd_capital", "kgd_champagne", "kgd_brittany", "kgd_artois"] },
    { id: "kgd_champagne",name: "シャンパーニュ", terrain: "plains",   neighbors: ["kgd_capital", "kgd_normandy", "kgd_burgundy", "kgd_lorraine", "kgd_artois", "neu_rhine"] },
    { id: "kgd_burgundy", name: "ブルゴーニュ",  terrain: "plains",   neighbors: ["kgd_capital", "kgd_champagne", "kgd_berry", "kgd_dauphine", "kgd_lorraine", "emp_swabia", "neu_rhine"] },
    { id: "kgd_lorraine", name: "ロレーヌ",      terrain: "forest",   neighbors: ["kgd_capital", "kgd_champagne", "kgd_burgundy", "neu_rhine", "emp_franconia", "emp_westmark"] },
    { id: "kgd_brittany", name: "ブルターニュ",  terrain: "coast",    neighbors: ["kgd_normandy", "kgd_berry", "kgd_gascony"] },
    { id: "kgd_berry",    name: "ベリー",        terrain: "plains",   neighbors: ["kgd_capital", "kgd_burgundy", "kgd_brittany", "kgd_gascony", "kgd_languedoc"] },
    { id: "kgd_gascony",  name: "ガスコーニュ",  terrain: "plains",   neighbors: ["kgd_brittany", "kgd_berry", "kgd_languedoc", "neu_pyrenees", "hol_navarre"] },
    { id: "kgd_languedoc",name: "ラングドック",  terrain: "coast",    neighbors: ["kgd_berry", "kgd_gascony", "kgd_dauphine", "hol_catalonia", "neu_pyrenees"] },
    { id: "kgd_dauphine", name: "ドーフィネ",    terrain: "mountains",neighbors: ["kgd_burgundy", "kgd_berry", "kgd_languedoc", "rep_piedmont", "neu_alps"] },
    { id: "kgd_artois",   name: "アルトワ",      terrain: "coast",    neighbors: ["kgd_normandy", "kgd_champagne", "emp_brabant", "neu_flanders"] },
    { id: "kgd_provence", name: "プロヴァンス",  terrain: "coast",    neighbors: ["kgd_dauphine", "kgd_languedoc", "rep_piedmont"], straitTo: ["neu_corsica"] },
  ],
};
