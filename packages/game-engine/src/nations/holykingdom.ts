import type { NationConfig } from "../map.js";

// 聖王国 (hol): スペイン・ポルトガルモデル 地形防衛特化 8州
export const holykingdom: NationConfig = {
  id: "hol",
  name: "聖王国",
  color: "#ca8a04",
  capitalStateId: "hol_capital",
  specialty: "terrain",
  states: [
    { id: "hol_capital",  name: "聖王国首都",    terrain: "capital",   capitalOf: "hol", neighbors: ["hol_castile", "hol_aragon", "hol_portugal"] },
    { id: "hol_castile",  name: "カスティーリャ", terrain: "plains",   neighbors: ["hol_capital", "hol_aragon", "hol_portugal", "hol_andalusia", "hol_navarre"] },
    { id: "hol_aragon",   name: "アラゴン",      terrain: "mountains", neighbors: ["hol_capital", "hol_castile", "hol_catalonia", "hol_navarre", "neu_alps", "neu_pyrenees"] },
    { id: "hol_portugal", name: "ポルトガル",    terrain: "coast",    neighbors: ["hol_capital", "hol_castile", "hol_andalusia"] },
    { id: "hol_andalusia",name: "アンダルシア",  terrain: "coast",    neighbors: ["hol_castile", "hol_portugal"], straitTo: ["hol_morocco"] },
    { id: "hol_navarre",  name: "ナバラ",        terrain: "mountains", neighbors: ["hol_castile", "hol_aragon", "hol_catalonia", "kgd_gascony", "neu_pyrenees"] },
    { id: "hol_catalonia",name: "カタルーニャ",  terrain: "coast",    neighbors: ["hol_aragon", "hol_navarre", "kgd_languedoc", "neu_pyrenees"] },
    { id: "hol_sardinia", name: "サルデーニャ",  terrain: "coast",    isNeutral: false, neighbors: [], straitTo: ["neu_corsica", "rep_genoa"] },
    { id: "hol_palermo",  name: "シチリア",      terrain: "coast",    neighbors: [], straitTo: ["rep_naples", "rep_calabria", "hol_morocco"] },
    { id: "hol_morocco",  name: "モロッコ海峡",  terrain: "coast",    neighbors: [], straitTo: ["hol_andalusia", "hol_palermo"] },
  ],
};
