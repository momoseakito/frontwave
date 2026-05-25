import type { NationConfig } from "../map.js";

// 公国 (dch): バルカン・オスマン風モデル 奇襲特化 13州
export const duchy: NationConfig = {
  id: "dch",
  name: "公国",
  color: "#6b1f6b",
  capitalStateId: "dch_capital",
  specialty: "ambush",
  states: [
    { id: "dch_capital",     name: "公国首都",         terrain: "capital",   capitalOf: "dch", neighbors: ["dch_moravia", "dch_hungary", "dch_wallachia", "dch_thrace"] },
    { id: "dch_moravia",     name: "モラヴィア",       terrain: "plains",    neighbors: ["dch_capital", "dch_hungary", "dch_transylvania", "emp_saxony", "neu_bohemia", "neu_danube"] },
    { id: "dch_hungary",     name: "ハンガリー",       terrain: "plains",    neighbors: ["dch_capital", "dch_moravia", "dch_croatia", "dch_wallachia", "dch_transylvania", "emp_carinthia", "neu_danube"] },
    { id: "dch_croatia",     name: "クロアチア",       terrain: "coast",     neighbors: ["dch_hungary", "dch_ragusa", "rep_venice", "rep_friuli", "neu_adriatic"], straitTo: ["dch_albania"] },
    { id: "dch_wallachia",   name: "ワラキア",         terrain: "plains",    neighbors: ["dch_capital", "dch_hungary", "dch_thrace", "dch_transylvania"] },
    { id: "dch_thrace",      name: "トラキア",         terrain: "plains",    neighbors: ["dch_capital", "dch_wallachia", "dch_anatolia"], straitTo: ["dch_albania"] },
    { id: "dch_albania",     name: "アルバニア",       terrain: "mountains", neighbors: ["dch_ragusa"], straitTo: ["dch_croatia", "dch_thrace", "neu_adriatic"] },
    { id: "dch_ragusa",      name: "ラグーザ",         terrain: "coast",     neighbors: ["dch_croatia", "dch_albania", "neu_adriatic"] },
    { id: "dch_anatolia",    name: "アナトリア",       terrain: "mountains", neighbors: ["dch_thrace"], straitTo: ["dch_egypt"] },
    { id: "dch_transylvania",name: "トランシルヴァニア", terrain: "mountains", neighbors: ["dch_wallachia", "dch_hungary", "dch_moravia"] },
    { id: "dch_egypt",       name: "エジプト",         terrain: "plains",    neighbors: ["dch_libya"], straitTo: ["dch_anatolia"] },
    { id: "dch_libya",       name: "リビア",           terrain: "plains",    neighbors: ["dch_egypt", "dch_maghreb"] },
    { id: "dch_maghreb",     name: "マグレブ",         terrain: "coast",     neighbors: ["dch_libya"], straitTo: ["kgd_andalusia", "hol_palermo", "hol_sardinia"] },
  ],
};
