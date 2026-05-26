import type { NationConfig } from "../map.js";

// 聖王国 (hol): Österreichisches Reich / 伊・墺南領 terrain特化
export const holykingdom: NationConfig = {
  id: "hol",
  name: "聖王国",
  color: "#c9a227",
  capitalStateId: "hol_capital",
  specialty: "terrain",
  states: [
    // ---- 墺領中欧 ----
    { id: "hol_capital",    name: "聖王国首都",     terrain: "capital",   capitalOf: "hol", neighbors: ["hol_castile", "hol_aragon", "hol_navarre"] },
    { id: "hol_castile",    name: "カスティーリャ", terrain: "plains",    neighbors: ["hol_capital", "hol_aragon"] },
    { id: "hol_aragon",     name: "アラゴン",       terrain: "mountains", neighbors: ["hol_capital", "hol_castile"] },
    { id: "hol_navarre",    name: "ナバラ",         terrain: "mountains", neighbors: ["hol_capital"] },

    // ---- 北イタリア（ピエモンテ＋リグーリア統合） ----
    { id: "hol_lombardy",   name: "ロンバルディア", terrain: "plains",    neighbors: ["hol_piedmont", "hol_veneto", "hol_emilia", "neu_alps"] },
    { id: "hol_piedmont",   name: "ピエモンテ",     terrain: "mountains", neighbors: ["hol_lombardy", "hol_emilia", "hol_tuscany_n", "kgd_dauphine", "kgd_provence", "neu_alps"], straitTo: ["hol_sardinia"] },

    // ---- 中部イタリア ----
    { id: "hol_veneto",     name: "ヴェネト",       terrain: "coast",     neighbors: ["hol_lombardy", "hol_emilia", "hol_capital", "neu_adriatic"] },
    { id: "hol_emilia",     name: "エミリア",       terrain: "plains",    neighbors: ["hol_lombardy", "hol_veneto", "hol_piedmont", "hol_tuscany_n", "hol_lazio"] },
    { id: "hol_tuscany_n",  name: "トスカーナ",     terrain: "plains",    neighbors: ["hol_piedmont", "hol_emilia", "hol_lazio"] },
    { id: "hol_lazio",      name: "ラツィオ",       terrain: "coast",     neighbors: ["hol_tuscany_n", "hol_emilia", "hol_calabria_s"] },

    // ---- 南イタリア（カンパーニャ統合） ----
    { id: "hol_apulia",     name: "プーリア",       terrain: "coast",     neighbors: ["hol_calabria_s"] },
    { id: "hol_calabria_s", name: "カラブリア",     terrain: "mountains", neighbors: ["hol_lazio", "hol_apulia"], straitTo: ["hol_palermo"] },

    // ---- 島嶼 ----
    { id: "hol_sardinia",   name: "サルデーニャ",   terrain: "coast",     neighbors: [], straitTo: ["hol_piedmont", "dch_morocco_n", "kgd_provence"] },
    { id: "hol_palermo",    name: "シチリア",       terrain: "coast",     neighbors: [], straitTo: ["hol_calabria_s", "dch_morocco_n", "dch_tunisia", "dch_tripolitania"] },

    // ---- 旧中立 ----
    { id: "neu_adriatic",   name: "アドリア海岸",   terrain: "coast",     neighbors: ["rep_venice", "hol_veneto", "dch_croatia"] },

    // ---- コーカサス・北イラン ----
    { id: "hol_georgia",       name: "ジョージア",        terrain: "mountains", neighbors: ["emp_austria", "emp_austria_e", "emp_dagestan", "hol_transcaucasia", "dch_anatolia_n"] },
    { id: "hol_transcaucasia", name: "東コーカサス諸国",  terrain: "mountains", neighbors: ["emp_dagestan", "hol_georgia", "dch_anatolia_n", "dch_anatolia_e", "hol_iran_n"] },
    { id: "hol_iran_n",        name: "北イラン",          terrain: "mountains", neighbors: ["hol_transcaucasia", "dch_anatolia_e"] },
  ],
};
