import type { NationConfig } from "../map.js";

// 公国 (dch): バルカン・オスマン風モデル 奇襲特化
export const duchy: NationConfig = {
  id: "dch",
  name: "公国",
  color: "#6b1f6b",
  capitalStateId: "dch_capital",
  specialty: "ambush",
  states: [
    { id: "dch_capital",        name: "公国首都",            terrain: "capital",   capitalOf: "dch", neighbors: ["dch_moravia", "dch_hungary", "dch_wallachia", "dch_thrace", "dch_anatolia_coast"] },
    { id: "dch_moravia",        name: "モラヴィア",          terrain: "plains",    neighbors: ["dch_capital", "dch_hungary", "dch_transylvania", "emp_saxony", "neu_bohemia", "neu_danube", "neu_dnipro_n"] },
    { id: "dch_hungary",        name: "ハンガリー",          terrain: "plains",    neighbors: ["dch_capital", "dch_moravia", "dch_morea", "dch_croatia", "dch_wallachia", "dch_transylvania", "neu_danube"] },
    { id: "dch_morea",          name: "モレア",              terrain: "coast",     neighbors: ["dch_hungary", "dch_thrace"] },
    { id: "dch_croatia",        name: "クロアチア",          terrain: "coast",     neighbors: ["dch_hungary", "rep_venice", "rep_friuli", "neu_adriatic"] },
    { id: "dch_wallachia",      name: "ワラキア",            terrain: "plains",    neighbors: ["dch_capital", "dch_hungary", "dch_thrace", "dch_moldavia", "dch_transylvania", "neu_pontic"] },
    { id: "dch_moldavia",       name: "モルダヴィア",        terrain: "plains",    neighbors: ["dch_wallachia", "dch_transylvania_e", "neu_ukraine_n"] },
    { id: "dch_transylvania",   name: "トランシルヴァニア",  terrain: "mountains", neighbors: ["dch_wallachia", "dch_transylvania_e", "dch_hungary", "dch_moravia", "neu_steppe", "neu_ukraine_w"] },
    { id: "dch_transylvania_e", name: "トランシルヴァニア東部", terrain: "mountains", neighbors: ["dch_transylvania", "dch_wallachia", "dch_moldavia"] },
    { id: "dch_thrace",         name: "トラキア",            terrain: "plains",    neighbors: ["dch_capital", "dch_wallachia", "dch_hungary", "dch_bulgaria", "dch_anatolia_coast", "dch_anatolia_e"] },
    { id: "dch_bulgaria",       name: "ブルガリア",          terrain: "plains",    neighbors: ["dch_thrace", "dch_wallachia"] },

    // ---- アナトリア（4分割） ----
    { id: "dch_anatolia_coast", name: "エーゲ海岸北部",     terrain: "coast",     neighbors: ["dch_capital", "dch_thrace", "dch_anatolia", "dch_aegean"] },
    { id: "dch_aegean",         name: "エーゲ海岸南部",     terrain: "coast",     neighbors: ["dch_anatolia_coast", "dch_anatolia", "dch_anatolia_sw"] },
    { id: "dch_anatolia",       name: "アナトリア高原",     terrain: "plains",    neighbors: ["dch_anatolia_coast", "dch_aegean", "dch_anatolia_sw", "dch_anatolia_e", "dch_anatolia_n"] },
    { id: "dch_anatolia_sw",    name: "アナトリア南部",     terrain: "coast",     neighbors: ["dch_anatolia", "dch_aegean", "dch_anatolia_e"] },
    { id: "dch_anatolia_e",     name: "東アナトリア",       terrain: "mountains", neighbors: ["dch_anatolia", "dch_anatolia_sw", "dch_anatolia_n", "dch_thrace", "hol_transcaucasia", "hol_iran_n"] },
    { id: "dch_anatolia_n",     name: "黒海東岸",           terrain: "coast",     neighbors: ["dch_anatolia", "dch_anatolia_e", "hol_georgia", "hol_transcaucasia", "dch_levant_n"] },

    // ---- レバント（4分割） ----
    { id: "dch_levant_n",      name: "北レバント",          terrain: "coast",     neighbors: ["dch_anatolia_n", "dch_levant_c", "dch_levant_e"] },
    { id: "dch_levant_c",      name: "中レバント",          terrain: "plains",    neighbors: ["dch_levant_n", "dch_levant_e", "dch_palestine"] },
    { id: "dch_levant_e",      name: "東レバント",          terrain: "plains",    neighbors: ["dch_levant_n", "dch_levant_c", "dch_palestine"] },
    { id: "dch_palestine",     name: "パレスチナ",          terrain: "coast",     neighbors: ["dch_levant_c", "dch_levant_e", "dch_sinai"] },

    // ---- エジプト（5分割） ----
    { id: "dch_egypt_delta",    name: "エジプト・デルタ",   terrain: "coast",     neighbors: ["dch_egypt_nile", "dch_sinai", "dch_tripolitania", "dch_egypt_w"] },
    { id: "dch_egypt_nile",     name: "上エジプト",         terrain: "plains",    neighbors: ["dch_egypt_delta", "dch_egypt_w", "dch_egypt_sw"] },
    { id: "dch_sinai",          name: "シナイ半島",         terrain: "coast",     neighbors: ["dch_egypt_delta", "dch_egypt_w", "dch_palestine"] },
    { id: "dch_egypt_w",        name: "西方砂漠",           terrain: "plains",    neighbors: ["dch_sinai", "dch_egypt_delta", "dch_egypt_nile", "dch_egypt_sw", "dch_fezzan_ne"] },
    { id: "dch_egypt_sw",       name: "エジプト南西",       terrain: "plains",    neighbors: ["dch_egypt_nile", "dch_egypt_w", "dch_kufra"] },

    // ---- リビア（6分割） ----
    { id: "dch_tripolitania",   name: "トリポリタニア",     terrain: "coast",     neighbors: ["dch_cyrenaica", "dch_fezzan_ne", "dch_fezzan_nw", "dch_tunisia", "dch_egypt_delta"], straitTo: ["hol_palermo"] },
    { id: "dch_tripolitania_w", name: "トリポリタニア西部",  terrain: "plains",    neighbors: ["dch_fezzan_nw", "dch_fezzan_w", "dch_tunisia"] },
    { id: "dch_cyrenaica",      name: "キレナイカ",         terrain: "coast",     neighbors: ["dch_tripolitania", "dch_fezzan_ne", "dch_kufra"] },
    { id: "dch_kufra",          name: "クフラ",             terrain: "plains",    neighbors: ["dch_cyrenaica", "dch_egypt_sw", "dch_fezzan_e"] },
    { id: "dch_fezzan_nw",      name: "フェザーン北西沿岸",  terrain: "coast",     neighbors: ["dch_tripolitania", "dch_tripolitania_w", "dch_fezzan_w"] },
    { id: "dch_fezzan_w",       name: "フェザーン西部",     terrain: "plains",    neighbors: ["dch_fezzan_nw", "dch_tripolitania_w", "dch_fezzan_e", "dch_algeria_s"] },
    { id: "dch_fezzan_e",       name: "フェザーン東部",     terrain: "plains",    neighbors: ["dch_fezzan_w", "dch_fezzan_ne", "dch_kufra"] },
    { id: "dch_fezzan_ne",      name: "フェザーン北東",     terrain: "plains",    neighbors: ["dch_tripolitania", "dch_cyrenaica", "dch_fezzan_e", "dch_egypt_w"] },

    // ---- マグレブ（5分割） ----
    { id: "dch_morocco_n",      name: "モロッコ北部",       terrain: "coast",     neighbors: ["dch_morocco_c", "dch_morocco_s"], straitTo: ["kgd_andalusia", "hol_palermo", "hol_sardinia"] },
    { id: "dch_morocco_c",      name: "モロッコ中部",       terrain: "plains",    neighbors: ["dch_morocco_n", "dch_morocco_s", "dch_algeria_nw"] },
    { id: "dch_morocco_s",      name: "モロッコ南部",       terrain: "plains",    neighbors: ["dch_morocco_n", "dch_morocco_c", "dch_morocco_sw", "dch_algeria_s"] },
    { id: "dch_morocco_sw",     name: "モロッコ南西サハラ",  terrain: "plains",    neighbors: ["dch_morocco_s", "dch_algeria_s"] },
    { id: "dch_tunisia",        name: "チュニジア北部",     terrain: "coast",     neighbors: ["dch_tunisia_s", "dch_algeria_ne", "dch_tripolitania"], straitTo: ["hol_palermo"] },
    { id: "dch_tunisia_s",      name: "チュニジア南部",     terrain: "plains",    neighbors: ["dch_tunisia", "dch_algeria_s", "dch_tripolitania_w"] },

    // ---- アルジェリア（6分割） ----
    { id: "dch_algeria_nw",     name: "アルジェリア西部",   terrain: "coast",     neighbors: ["dch_algeria_n", "dch_morocco_c"] },
    { id: "dch_algeria_n",      name: "アルジェリア北部",   terrain: "plains",    neighbors: ["dch_algeria_nw", "dch_algeria_ne", "dch_algeria_se"] },
    { id: "dch_algeria_ne",     name: "アルジェリア東部",   terrain: "coast",     neighbors: ["dch_algeria_n", "dch_algeria_se", "dch_tunisia"] },
    { id: "dch_algeria_s",      name: "アルジェリア南西",   terrain: "plains",    neighbors: ["dch_algeria_sc", "dch_morocco_s", "dch_morocco_sw", "dch_fezzan_w"] },
    { id: "dch_algeria_sc",     name: "アルジェリア南中",   terrain: "plains",    neighbors: ["dch_algeria_s", "dch_algeria_se"] },
    { id: "dch_algeria_se",     name: "アルジェリア南東",   terrain: "plains",    neighbors: ["dch_algeria_n", "dch_algeria_ne", "dch_algeria_sc", "dch_tunisia_s"] },
  ],
};
