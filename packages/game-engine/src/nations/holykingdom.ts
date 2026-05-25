import type { NationConfig } from "../map.js";

// 聖王国 (hol): Österreichisches Reich / 伊・墺南領 15州
export const holykingdom: NationConfig = {
  id: "hol",
  name: "聖王国",
  color: "#c9a227",
  capitalStateId: "hol_capital",
  specialty: "terrain",
  states: [
    // ---- 墺領中欧 (旧 ID 温存) ----
    { id: "hol_capital",  name: "聖王国首都",    terrain: "capital",   capitalOf: "hol", neighbors: ["hol_castile", "hol_aragon", "hol_navarre", "hol_catalonia"] },
    { id: "hol_castile",  name: "カスティーリャ", terrain: "plains",    neighbors: ["hol_capital", "hol_aragon"] },
    { id: "hol_aragon",   name: "アラゴン",      terrain: "mountains", neighbors: ["hol_capital", "hol_castile", "hol_catalonia"] },
    { id: "hol_navarre",  name: "ナバラ",        terrain: "mountains", neighbors: ["hol_capital", "hol_catalonia"] },
    { id: "hol_catalonia",name: "カタルーニャ",  terrain: "coast",     neighbors: ["hol_capital", "hol_navarre", "hol_aragon", "hol_veneto"] },

    // ---- イタリア半島 (v5: 3 州 → 10 州に分割) ----
    // 北イタリア
    { id: "hol_lombardy", name: "ロンバルディア", terrain: "plains",    neighbors: ["hol_piedmont", "hol_veneto", "hol_emilia", "hol_liguria", "neu_alps"] },
    { id: "hol_piedmont", name: "ピエモンテ",    terrain: "mountains", neighbors: ["hol_lombardy", "hol_liguria", "kgd_dauphine", "kgd_provence", "neu_alps"] },
    { id: "hol_liguria",  name: "リグーリア",    terrain: "coast",     neighbors: ["hol_piedmont", "hol_lombardy", "hol_emilia", "hol_tuscany_n"], straitTo: ["neu_corsica"] },
    // 中部イタリア
    { id: "hol_veneto",   name: "ヴェネト",      terrain: "coast",     neighbors: ["hol_lombardy", "hol_emilia", "hol_catalonia", "neu_adriatic"] },
    { id: "hol_emilia",   name: "エミリア",      terrain: "plains",    neighbors: ["hol_lombardy", "hol_veneto", "hol_liguria", "hol_tuscany_n", "hol_lazio"] },
    { id: "hol_tuscany_n",name: "トスカーナ",    terrain: "plains",    neighbors: ["hol_liguria", "hol_emilia", "hol_lazio"] },
    { id: "hol_lazio",    name: "ラツィオ",      terrain: "coast",     neighbors: ["hol_tuscany_n", "hol_emilia", "hol_campania", "hol_calabria_s"] },
    // 南イタリア
    { id: "hol_campania", name: "カンパーニャ",  terrain: "coast",     neighbors: ["hol_lazio", "hol_apulia", "hol_calabria_s"] },
    { id: "hol_apulia",   name: "プーリア",      terrain: "coast",     neighbors: ["hol_campania", "hol_calabria_s"] },
    { id: "hol_calabria_s",name:"カラブリア",    terrain: "mountains", neighbors: ["hol_lazio", "hol_campania", "hol_apulia"], straitTo: ["hol_palermo"] },

    // ---- 島嶼 ----
    { id: "hol_sardinia", name: "サルデーニャ",  terrain: "coast",     isNeutral: false, neighbors: [], straitTo: ["neu_corsica", "hol_liguria", "dch_maghreb"] },
    { id: "hol_palermo",  name: "シチリア",      terrain: "coast",     neighbors: [], straitTo: ["hol_calabria_s", "dch_maghreb"] },
  ],
};
