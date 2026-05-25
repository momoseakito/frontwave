import type { NationConfig } from "../map.js";

// 共和国 (rep): イタリア諸都市モデル 経済特化 10州
export const republic: NationConfig = {
  id: "rep",
  name: "共和国",
  color: "#6b8e23",
  capitalStateId: "rep_capital",
  specialty: "economy",
  states: [
    { id: "rep_capital",  name: "共和国首都",    terrain: "capital",   capitalOf: "rep", neighbors: ["rep_lombardy", "rep_venice", "rep_tuscany", "rep_piedmont"] },
    { id: "rep_piedmont", name: "ピエモンテ",    terrain: "mountains", neighbors: ["rep_capital", "rep_lombardy", "rep_genoa", "emp_bavaria", "kgd_dauphine", "neu_alps"] },
    { id: "rep_lombardy", name: "ロンバルディア", terrain: "plains",   neighbors: ["rep_capital", "rep_piedmont", "rep_venice", "emp_carinthia", "neu_alps"] },
    { id: "rep_venice",   name: "ヴェネツィア",  terrain: "coast",    neighbors: ["rep_capital", "rep_lombardy", "rep_romagna", "dch_croatia", "neu_adriatic"] },
    { id: "rep_genoa",    name: "ジェノヴァ",    terrain: "coast",    neighbors: ["rep_piedmont", "rep_tuscany"], straitTo: ["neu_corsica"] },
    { id: "rep_tuscany",  name: "トスカーナ",    terrain: "plains",   neighbors: ["rep_capital", "rep_genoa", "rep_romagna"] },
    { id: "rep_romagna",  name: "ロマーニャ",    terrain: "plains",   neighbors: ["rep_tuscany", "rep_venice", "rep_naples"] },
    { id: "rep_naples",   name: "ナポリ",        terrain: "coast",    neighbors: ["rep_romagna", "rep_calabria"], straitTo: ["hol_palermo"] },
    { id: "rep_calabria", name: "カラブリア",    terrain: "mountains", neighbors: ["rep_naples"], straitTo: ["hol_palermo"] },
    { id: "rep_friuli",   name: "フリウリ",      terrain: "mountains", neighbors: ["rep_venice", "emp_carinthia", "dch_croatia"] },
  ],
};
