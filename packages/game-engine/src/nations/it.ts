import type { NationConfig } from "../map.js";

// イタリア: it本国 + オーストリア全州 + オスマン帝国全州
export const italy: NationConfig = {
  id: "it",
  name: "イタリア",
  color: "#16a34a",
  capitalStateId: "it_lazio",
  states: [
    // ===== イタリア本国 =====
    { id: "it_lazio",    name: "ラツィオ",              terrain: "capital", capitalOf: "it", neighbors: ["it_tuscany", "it_calabria", "at_croatia"] },
    { id: "it_tuscany",  name: "トスカーナ",             terrain: "coast",   neighbors: ["it_lazio", "it_emilia", "it_calabria"] },
    { id: "it_emilia",   name: "エミリア＝ロマーニャ",   terrain: "plains",  neighbors: ["it_tuscany", "it_lombardy", "it_venezia", "it_piedmont", "at_croatia"] },
    { id: "it_lombardy", name: "ロンバルディア",         terrain: "plains",  neighbors: ["it_emilia", "it_venezia", "it_piedmont", "de_bavaria", "at_vienna"] },
    { id: "it_piedmont", name: "ピエモンテ",             terrain: "mountains",neighbors: ["it_lombardy", "it_emilia", "fr_rhone", "fr_provence", "at_vienna"] },
    { id: "it_sicily",   name: "シチリア",               terrain: "coast",   neighbors: ["it_calabria"] },
    { id: "it_venezia",  name: "ヴェネツィア",           terrain: "coast",   neighbors: ["it_lombardy", "it_emilia", "at_vienna", "at_croatia"] },
    { id: "it_calabria", name: "カラブリア",             terrain: "coast",   neighbors: ["it_lazio", "it_tuscany", "it_sicily"] },
    { id: "it_sardinia", name: "サルデーニャ",           terrain: "coast",   neighbors: [] },

    // ===== オーストリア＝ハンガリー =====
    { id: "at_vienna",       name: "ウィーン",           terrain: "plains",  neighbors: ["de_bavaria", "it_lombardy", "it_venezia", "it_piedmont", "at_bohemia", "at_moravia", "at_hungary", "at_croatia", "at_galicia"] },
    { id: "at_bohemia",      name: "ボヘミア",           terrain: "mountains",neighbors: ["at_vienna", "at_moravia", "at_galicia", "de_saxony", "de_bavaria", "pl_silesia", "pl_krakow"] },
    { id: "at_moravia",      name: "モラヴィア",         terrain: "plains",  neighbors: ["at_vienna", "at_bohemia", "at_galicia", "de_saxony", "pl_silesia"] },
    { id: "at_hungary",      name: "ハンガリー",         terrain: "plains",  neighbors: ["at_vienna", "at_croatia", "at_galicia", "at_transylvania", "tr_wallachia", "tr_balkans", "tr_serbia"] },
    { id: "at_croatia",      name: "クロアチア",         terrain: "coast",   neighbors: ["at_vienna", "at_hungary", "it_lazio", "it_emilia", "it_venezia", "tr_balkans", "tr_serbia"] },
    { id: "at_galicia",      name: "ガリツィア",         terrain: "mountains",neighbors: ["at_vienna", "at_bohemia", "at_moravia", "at_hungary", "at_transylvania", "pl_masovia", "pl_lesser_poland", "pl_krakow", "pl_lublin", "ru_ukraine"] },
    { id: "at_transylvania", name: "トランシルヴァニア", terrain: "mountains",neighbors: ["at_hungary", "at_galicia", "tr_wallachia", "ru_ukraine"] },

    // ===== オスマン帝国 =====
    { id: "tr_istanbul", name: "コンスタンティノープル", terrain: "coast",    neighbors: ["tr_balkans", "tr_greece", "tr_wallachia", "tr_anatolia"] },
    { id: "tr_balkans",  name: "バルカン",               terrain: "mountains",neighbors: ["tr_istanbul", "tr_greece", "tr_wallachia", "tr_serbia", "at_hungary", "at_croatia"] },
    { id: "tr_greece",   name: "ギリシャ",               terrain: "coast",    neighbors: ["tr_istanbul", "tr_balkans"] },
    { id: "tr_wallachia",name: "ワラキア",               terrain: "plains",   neighbors: ["tr_istanbul", "tr_balkans", "tr_serbia", "tr_anatolia", "at_hungary", "at_galicia", "at_transylvania", "ru_ukraine", "ru_caucasus"] },
    { id: "tr_anatolia", name: "アナトリア",             terrain: "mountains",neighbors: ["tr_istanbul", "tr_wallachia", "tr_syria", "ru_caucasus"] },
    { id: "tr_serbia",   name: "セルビア",               terrain: "mountains",neighbors: ["tr_balkans", "tr_wallachia", "at_hungary", "at_croatia"] },
    { id: "tr_syria",    name: "シリア",                 terrain: "plains",   neighbors: ["tr_anatolia", "tr_egypt"] },
    { id: "tr_egypt",    name: "エジプト",               terrain: "coast",    neighbors: ["tr_syria"] },
  ],
};
