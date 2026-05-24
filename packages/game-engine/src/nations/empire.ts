import type { NationConfig } from "../map.js";

// 帝国 (emp): 神聖ローマ・ドイツモデル 防衛特化 12州
export const empire: NationConfig = {
  id: "emp",
  name: "帝国",
  color: "#6b7280",
  capitalStateId: "emp_capital",
  specialty: "defense",
  states: [
    { id: "emp_capital",  name: "皇帝都",       terrain: "capital",   capitalOf: "emp", neighbors: ["emp_saxony", "emp_franconia", "emp_bavaria", "emp_austria", "emp_prussia"] },
    { id: "emp_saxony",   name: "ザクセン",      terrain: "mountains", neighbors: ["emp_capital", "emp_franconia", "emp_prussia", "emp_westmark", "neu_bohemia", "dch_moravia"] },
    { id: "emp_franconia",name: "フランコニア",  terrain: "forest",    neighbors: ["emp_capital", "emp_saxony", "emp_bavaria", "emp_swabia", "emp_westmark", "kgd_lorraine"] },
    { id: "emp_bavaria",  name: "バイエルン",    terrain: "mountains", neighbors: ["emp_capital", "emp_franconia", "emp_swabia", "emp_austria", "rep_piedmont", "neu_alps"] },
    { id: "emp_austria",  name: "オーストリア",  terrain: "mountains", neighbors: ["emp_capital", "emp_bavaria", "emp_carinthia", "neu_bohemia", "neu_danube", "neu_alps"] },
    { id: "emp_swabia",   name: "シュヴァーベン", terrain: "forest",   neighbors: ["emp_franconia", "emp_bavaria", "emp_westmark", "emp_brabant", "neu_alps", "kgd_burgundy"] },
    { id: "emp_westmark", name: "西辺境州",      terrain: "plains",    neighbors: ["emp_saxony", "emp_franconia", "emp_swabia", "emp_brabant", "neu_rhine", "kgd_lorraine"] },
    { id: "emp_prussia",  name: "プロイセン",    terrain: "plains",    neighbors: ["emp_capital", "emp_saxony", "emp_pomerania", "neu_baltic", "fed_gothland"] },
    { id: "emp_pomerania",name: "ポメラニア",    terrain: "coast",     neighbors: ["emp_prussia", "emp_mecklenburg", "neu_baltic"], straitTo: ["fed_denmark"] },
    { id: "emp_mecklenburg",name:"メクレンブルク",terrain: "coast",    neighbors: ["emp_pomerania", "emp_brabant", "emp_holstein"] },
    { id: "emp_holstein", name: "ホルシュタイン", terrain: "coast",    neighbors: ["emp_mecklenburg", "emp_brabant"], straitTo: ["fed_denmark"] },
    { id: "emp_brabant",  name: "ブラバント",    terrain: "plains",    neighbors: ["emp_swabia", "emp_westmark", "emp_mecklenburg", "emp_holstein", "neu_flanders", "kgd_artois"] },
    { id: "emp_carinthia",name: "ケルンテン",    terrain: "mountains", neighbors: ["emp_austria", "rep_friuli", "dch_croatia", "neu_danube"] },
  ],
};
