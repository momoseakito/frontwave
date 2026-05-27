import type { NationConfig } from "../map.js";

// 公国 (dch): バルカン・オスマン風モデル 奇襲特化
export const duchy: NationConfig = {
  id: "dch",
  name: "オスマン帝国",
  color: "#6b1f6b",
  capitalStateId: "dch_capital",
  specialty: "ambush",
  states: [
    { id: "dch_capital",        name: "公国首都",            terrain: "capital",   capitalOf: "dch", neighbors: ["dch_anatolia", "dch_anatolia_coast", "dch_anatolia_sw"] },
    { id: "dch_moravia",        name: "モラヴィア",          terrain: "plains",    neighbors: ["dch_bulgaria", "dch_croatia", "dch_thrace", "dch_transylvania", "dch_wallachia", "hol_aragon", "hol_castile"] },
    { id: "dch_hungary",        name: "ハンガリー",          terrain: "plains",    neighbors: ["dch_anatolia_coast", "dch_bulgaria", "dch_croatia", "dch_morea", "dch_thrace"] },
    { id: "dch_morea",          name: "モレア",              terrain: "coast",     neighbors: ["dch_aegean", "dch_hungary"] },
    { id: "dch_croatia",        name: "クロアチア",          terrain: "coast",     neighbors: ["dch_bulgaria", "dch_hungary", "dch_moravia", "neu_adriatic"] },
    { id: "dch_wallachia",      name: "ワラキア",            terrain: "plains",    neighbors: ["dch_bulgaria", "dch_moldavia", "dch_moravia", "dch_thrace", "dch_transylvania", "dch_transylvania_e", "neu_pontic"] },
    { id: "dch_moldavia",       name: "モルダヴィア",        terrain: "plains",    neighbors: ["dch_transylvania", "dch_transylvania_e", "dch_wallachia", "neu_pontic", "neu_ukraine_w"] },
    { id: "dch_transylvania",   name: "トランシルヴァニア",  terrain: "mountains", neighbors: ["dch_moldavia", "dch_moravia", "dch_transylvania_e", "dch_wallachia", "hol_castile", "neu_ukraine_w"] },
    { id: "dch_transylvania_e", name: "トランシルヴァニア東部", terrain: "mountains", neighbors: ["dch_moldavia", "dch_transylvania", "dch_wallachia"] },
    { id: "dch_thrace",         name: "トラキア",            terrain: "plains",    neighbors: ["dch_anatolia_coast", "dch_bulgaria", "dch_hungary", "dch_moravia", "dch_wallachia"] },
    { id: "dch_bulgaria",       name: "ブルガリア",          terrain: "plains",    neighbors: ["dch_croatia", "dch_hungary", "dch_moravia", "dch_thrace", "dch_wallachia"] },

    // ---- アナトリア（4分割） ----
    { id: "dch_anatolia_coast", name: "エーゲ海岸北部",     terrain: "coast",     neighbors: ["dch_aegean", "dch_anatolia", "dch_capital", "dch_hungary", "dch_thrace"] },
    { id: "dch_aegean",         name: "エーゲ海岸南部",     terrain: "coast",     neighbors: ["dch_anatolia", "dch_anatolia_coast", "dch_anatolia_e", "dch_anatolia_sw", "dch_morea"] },
    { id: "dch_anatolia",       name: "アナトリア高原",     terrain: "plains",    neighbors: ["dch_aegean", "dch_anatolia_coast", "dch_anatolia_e", "dch_anatolia_n", "dch_anatolia_sw", "dch_capital"] },
    { id: "dch_anatolia_sw",    name: "アナトリア南部",     terrain: "coast",     neighbors: ["dch_aegean", "dch_anatolia", "dch_anatolia_e", "dch_anatolia_n", "dch_capital"] },
    { id: "dch_anatolia_e",     name: "東アナトリア",       terrain: "mountains", neighbors: ["dch_aegean", "dch_anatolia", "dch_anatolia_n", "dch_anatolia_sw"] },
    { id: "dch_anatolia_n",     name: "黒海東岸",           terrain: "coast",     neighbors: ["dch_anatolia", "dch_anatolia_e", "dch_anatolia_sw", "dch_levant_e", "dch_levant_n"] },

    // ---- レバント（4分割） ----
    { id: "dch_levant_n",      name: "北レバント",          terrain: "coast",     neighbors: ["dch_anatolia_n", "dch_levant_c", "dch_levant_e"] },
    { id: "dch_levant_c",      name: "中レバント",          terrain: "plains",    neighbors: ["dch_levant_e", "dch_levant_n", "dch_palestine"] },
    { id: "dch_levant_e",      name: "東レバント",          terrain: "plains",    neighbors: ["dch_anatolia_n", "dch_levant_c", "dch_levant_n", "dch_palestine"] },
    { id: "dch_palestine",     name: "パレスチナ",          terrain: "coast",     neighbors: ["dch_levant_c", "dch_levant_e", "dch_sinai"] },

    // ---- エジプト（5分割） ----
    { id: "dch_egypt_delta",    name: "エジプト・デルタ",   terrain: "coast",     neighbors: ["dch_egypt_nile", "dch_egypt_sw", "dch_egypt_w", "dch_sinai"] },
    { id: "dch_egypt_nile",     name: "上エジプト",         terrain: "plains",    neighbors: ["dch_egypt_delta", "dch_egypt_sw", "dch_egypt_w"] },
    { id: "dch_sinai",          name: "シナイ半島",         terrain: "coast",     neighbors: ["dch_egypt_delta", "dch_egypt_w", "dch_palestine"] },
    { id: "dch_egypt_w",        name: "西方砂漠",           terrain: "plains",    neighbors: ["dch_cyrenaica", "dch_egypt_delta", "dch_egypt_nile", "dch_egypt_sw", "dch_sinai"] },
    { id: "dch_egypt_sw",       name: "エジプト南西",       terrain: "plains",    neighbors: ["dch_cyrenaica", "dch_egypt_delta", "dch_egypt_nile", "dch_egypt_w", "dch_kufra"] },

    // ---- リビア（6分割） ----
    { id: "dch_tripolitania",   name: "トリポリタニア",     terrain: "coast",     neighbors: ["dch_cyrenaica", "dch_fezzan_e", "dch_fezzan_ne", "dch_fezzan_nw", "dch_tripolitania_w"], straitTo: ["hol_palermo"] },
    { id: "dch_tripolitania_w", name: "トリポリタニア西部",  terrain: "plains",    neighbors: ["dch_algeria_se", "dch_fezzan_e", "dch_fezzan_w", "dch_tripolitania", "dch_tunisia_s"] },
    { id: "dch_cyrenaica",      name: "キレナイカ",         terrain: "coast",     neighbors: ["dch_algeria_se", "dch_egypt_sw", "dch_egypt_w", "dch_fezzan_e", "dch_fezzan_ne", "dch_fezzan_nw", "dch_fezzan_w", "dch_kufra", "dch_tripolitania"] },
    { id: "dch_kufra",          name: "クフラ",             terrain: "plains",    neighbors: ["dch_cyrenaica", "dch_egypt_sw", "dch_fezzan_e"] },
    { id: "dch_fezzan_nw",      name: "フェザーン北西沿岸",  terrain: "coast",     neighbors: ["dch_cyrenaica", "dch_fezzan_e", "dch_fezzan_ne", "dch_tripolitania"] },
    { id: "dch_fezzan_w",       name: "フェザーン西部",     terrain: "plains",    neighbors: ["dch_algeria_se", "dch_cyrenaica", "dch_fezzan_e", "dch_tripolitania_w"] },
    { id: "dch_fezzan_e",       name: "フェザーン東部",     terrain: "plains",    neighbors: ["dch_cyrenaica", "dch_fezzan_ne", "dch_fezzan_nw", "dch_fezzan_w", "dch_kufra", "dch_tripolitania", "dch_tripolitania_w"] },
    { id: "dch_fezzan_ne",      name: "フェザーン北東",     terrain: "plains",    neighbors: ["dch_cyrenaica", "dch_fezzan_e", "dch_fezzan_nw", "dch_tripolitania"] },

    // ---- マグレブ（5分割） ----
    { id: "dch_morocco_n",      name: "モロッコ北部",       terrain: "coast",     neighbors: ["dch_algeria_s", "dch_algeria_sc", "dch_morocco_c", "dch_morocco_s", "dch_morocco_sw"], straitTo: ["kgd_andalusia", "hol_palermo", "hol_sardinia"] },
    { id: "dch_morocco_c",      name: "モロッコ中部",       terrain: "plains",    neighbors: ["dch_algeria_nw", "dch_algeria_s", "dch_morocco_n", "dch_morocco_s", "dch_morocco_sw"] },
    { id: "dch_morocco_s",      name: "モロッコ南部",       terrain: "plains",    neighbors: ["dch_morocco_c", "dch_morocco_n", "dch_morocco_sw"] },
    { id: "dch_morocco_sw",     name: "モロッコ南西サハラ",  terrain: "plains",    neighbors: ["dch_morocco_c", "dch_morocco_n", "dch_morocco_s"] },
    { id: "dch_tunisia",        name: "チュニジア北部",     terrain: "coast",     neighbors: ["dch_algeria_ne", "dch_tunisia_s"], straitTo: ["hol_palermo"] },
    { id: "dch_tunisia_s",      name: "チュニジア南部",     terrain: "plains",    neighbors: ["dch_algeria_ne", "dch_algeria_sc", "dch_algeria_se", "dch_tripolitania_w", "dch_tunisia"] },

    // ---- アルジェリア（6分割） ----
    { id: "dch_algeria_nw",     name: "アルジェリア西部",   terrain: "coast",     neighbors: ["dch_algeria_n", "dch_algeria_s", "dch_morocco_c"] },
    { id: "dch_algeria_n",      name: "アルジェリア北部",   terrain: "plains",    neighbors: ["dch_algeria_ne", "dch_algeria_nw", "dch_algeria_s", "dch_algeria_se"] },
    { id: "dch_algeria_ne",     name: "アルジェリア東部",   terrain: "coast",     neighbors: ["dch_algeria_n", "dch_algeria_sc", "dch_tunisia", "dch_tunisia_s"] },
    { id: "dch_algeria_s",      name: "アルジェリア南西",   terrain: "plains",    neighbors: ["dch_algeria_n", "dch_algeria_nw", "dch_algeria_sc", "dch_algeria_se", "dch_morocco_c", "dch_morocco_n"] },
    { id: "dch_algeria_sc",     name: "アルジェリア南中",   terrain: "plains",    neighbors: ["dch_algeria_ne", "dch_algeria_s", "dch_algeria_se", "dch_morocco_n", "dch_tunisia_s"] },
    { id: "dch_algeria_se",     name: "アルジェリア南東",   terrain: "plains",    neighbors: ["dch_algeria_n", "dch_algeria_s", "dch_algeria_sc", "dch_cyrenaica", "dch_fezzan_w", "dch_tripolitania_w", "dch_tunisia_s"] },
  ],
};
