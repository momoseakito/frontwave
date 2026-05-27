import type { NationConfig } from "../map.js";

// 聖王国 (hol): Österreichisches Reich / 独・墺・中欧 terrain特化
export const holykingdom: NationConfig = {
  id: "hol",
  name: "オーストリア帝国",
  color: "#c9a227",
  capitalStateId: "hol_capital",
  specialty: "terrain",
  states: [
    // ---- 墺領中欧 ----
    { id: "hol_capital",    name: "聖王国首都",     terrain: "capital",   capitalOf: "hol", neighbors: ["hol_apulia", "hol_lazio", "hol_lombardy", "neu_bohemia_nw", "neu_silesia"] },
    { id: "hol_castile",    name: "カスティーリャ", terrain: "plains",    neighbors: ["dch_moravia", "dch_transylvania", "hol_aragon", "neu_danube", "neu_ukraine_w", "rep_capital", "rep_genoa"] },
    { id: "hol_aragon",     name: "アラゴン",       terrain: "mountains", neighbors: ["dch_moravia", "hol_castile", "neu_adriatic", "rep_capital"] },
    { id: "hol_navarre",    name: "ナバラ",         terrain: "mountains", neighbors: ["hol_lazio", "hol_lombardy", "hol_piedmont", "hol_tuscany_n", "kgd_lorraine", "neu_rhine"] },

    // ---- 旧中立（イタリア近傍） ----
    { id: "neu_adriatic",   name: "アドリア海岸",   terrain: "coast",     neighbors: ["dch_croatia", "hol_aragon"] },

    // ---- コーカサス・北イラン（GeoJSON対応geometry無し・不活性） ----
    { id: "hol_georgia",       name: "ジョージア",        terrain: "mountains", neighbors: [] },
    { id: "hol_transcaucasia", name: "東コーカサス諸国",  terrain: "mountains", neighbors: [] },
    { id: "hol_iran_n",        name: "北イラン",          terrain: "mountains", neighbors: [] },

    // ---- 中欧（rep_から移動: ドイツ・プロイセン・中欧圏） ----
    { id: "rep_capital",  name: "共和国首都",    terrain: "plains",   neighbors: ["hol_aragon", "hol_calabria_s", "hol_castile", "hol_piedmont", "hol_veneto", "neu_danube", "rep_genoa", "rep_venice"] },
    { id: "rep_naples",   name: "ナポリ",        terrain: "coast",    neighbors: ["rep_calabria", "rep_romagna", "rep_tuscany"], straitTo: ["hol_palermo"] },
    { id: "rep_genoa",    name: "ジェノヴァ",    terrain: "coast",    neighbors: ["hol_castile", "hol_piedmont", "hol_tuscany_n", "neu_alps", "rep_capital", "rep_venice"], straitTo: ["neu_corsica"] },
    { id: "rep_tuscany",  name: "トスカーナ",    terrain: "plains",   neighbors: ["rep_naples", "rep_piedmont", "rep_romagna"] },
    { id: "rep_piedmont", name: "ピエモンテ",    terrain: "mountains", neighbors: ["kgd_dauphine", "kgd_provence", "neu_alps", "rep_lombardy", "rep_romagna", "rep_tuscany"] },
    { id: "rep_lombardy", name: "ロンバルディア", terrain: "plains",  neighbors: ["neu_alps", "rep_piedmont", "rep_romagna", "rep_venice"] },
    { id: "rep_venice",   name: "ヴェネツィア",  terrain: "coast",    neighbors: ["neu_alps", "rep_capital", "rep_genoa", "rep_lombardy", "rep_romagna"] },
    { id: "rep_romagna",  name: "ロマーニャ",    terrain: "plains",   neighbors: ["rep_calabria", "rep_lombardy", "rep_naples", "rep_piedmont", "rep_tuscany", "rep_venice"] },
    { id: "rep_calabria", name: "カラブリア",    terrain: "mountains", neighbors: ["rep_friuli", "rep_naples", "rep_romagna"], straitTo: ["hol_palermo"] },
    { id: "rep_friuli",   name: "フリウリ",      terrain: "mountains", neighbors: ["rep_calabria"] },
  ],
};
