import type { NationConfig } from "../map.js";

// 共和国 (rep): イタリア諸都市モデル 経済特化 11州 (本土10 + 旧中立1: アルプス)
export const republic: NationConfig = {
  id: "rep",
  name: "イタリア共和国",
  color: "#5a8a3c",
  capitalStateId: "hol_lazio",
  specialty: "economy",
  states: [
    // ---- イタリア半島（hol から移動） ----
    { id: "hol_lombardy",   name: "ロンバルディア", terrain: "plains",    neighbors: ["hol_capital", "hol_emilia", "hol_lazio", "hol_navarre", "hol_piedmont", "hol_veneto", "neu_bohemia", "neu_bohemia_nw"] },
    { id: "hol_piedmont",   name: "ピエモンテ",     terrain: "mountains", neighbors: ["hol_lombardy", "hol_navarre", "hol_tuscany_n", "hol_veneto", "neu_alps", "rep_capital", "rep_genoa"], straitTo: ["hol_sardinia"] },
    { id: "hol_veneto",     name: "ヴェネト",       terrain: "coast",     neighbors: ["hol_calabria_s", "hol_emilia", "hol_lombardy", "hol_piedmont", "rep_capital"] },
    { id: "hol_emilia",     name: "エミリア",       terrain: "plains",    neighbors: ["hol_calabria_s", "hol_lombardy", "hol_veneto", "neu_bohemia"] },
    { id: "hol_tuscany_n",  name: "トスカーナ",     terrain: "plains",    neighbors: ["hol_navarre", "hol_piedmont", "kgd_lorraine", "neu_alps", "rep_genoa"] },
    { id: "hol_lazio",      name: "ラツィオ",       terrain: "capital",   capitalOf: "rep", neighbors: ["hol_apulia", "hol_capital", "hol_lombardy", "hol_navarre", "neu_rhine"] },
    { id: "hol_apulia",     name: "プーリア",       terrain: "coast",     neighbors: ["fed_denmark", "hol_capital", "hol_lazio", "neu_silesia"] },
    { id: "hol_calabria_s", name: "カラブリア",     terrain: "mountains", neighbors: ["hol_emilia", "hol_veneto", "neu_bohemia", "neu_danube", "rep_capital"], straitTo: ["hol_palermo"] },
    { id: "hol_palermo",    name: "シチリア",       terrain: "coast",     neighbors: [], straitTo: ["hol_calabria_s", "dch_morocco_n", "dch_tunisia", "dch_tripolitania"] },
    { id: "hol_sardinia",   name: "サルデーニャ",   terrain: "coast",     neighbors: [], straitTo: ["hol_piedmont", "dch_morocco_n", "kgd_provence"] },

    // ---- 旧中立 (v7 で rep に編入) ----
    { id: "neu_alps",     name: "アルプス山中",  terrain: "mountains", neighbors: ["hol_piedmont", "hol_tuscany_n", "kgd_burgundy", "kgd_dauphine", "kgd_lorraine", "rep_genoa", "rep_lombardy", "rep_piedmont", "rep_venice"] },
  ],
};
