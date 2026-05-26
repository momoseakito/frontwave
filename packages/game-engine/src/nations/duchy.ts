import type { NationConfig } from "../map.js";

// 公国 (dch): バルカン・オスマン風モデル 奇襲特化
// 18州 → 分割後28州
export const duchy: NationConfig = {
  id: "dch",
  name: "公国",
  color: "#6b1f6b",
  capitalStateId: "dch_capital",
  specialty: "ambush",
  states: [
    { id: "dch_capital",      name: "公国首都",          terrain: "capital",   capitalOf: "dch", neighbors: ["dch_moravia", "dch_hungary", "dch_wallachia", "dch_thrace", "dch_anatolia_coast"] },
    { id: "dch_moravia",      name: "モラヴィア",        terrain: "plains",    neighbors: ["dch_capital", "dch_hungary", "dch_transylvania", "emp_saxony", "neu_bohemia", "neu_danube", "neu_dnipro_n"] },
    { id: "dch_hungary",      name: "ハンガリー",        terrain: "plains",    neighbors: ["dch_capital", "dch_moravia", "dch_croatia", "dch_wallachia", "dch_transylvania", "neu_danube"] },
    { id: "dch_croatia",      name: "クロアチア",        terrain: "coast",     neighbors: ["dch_hungary", "dch_ragusa", "rep_venice", "rep_friuli", "neu_adriatic"], straitTo: ["dch_albania"] },
    { id: "dch_wallachia",    name: "ワラキア",          terrain: "plains",    neighbors: ["dch_capital", "dch_hungary", "dch_thrace", "dch_transylvania", "neu_pontic"] },
    { id: "dch_transylvania", name: "トランシルヴァニア", terrain: "mountains", neighbors: ["dch_wallachia", "dch_hungary", "dch_moravia", "neu_steppe"] },
    { id: "dch_thrace",       name: "トラキア",          terrain: "plains",    neighbors: ["dch_capital", "dch_wallachia", "dch_anatolia_coast", "dch_anatolia_e"], straitTo: ["dch_albania"] },
    { id: "dch_albania",      name: "アルバニア",        terrain: "mountains", neighbors: ["dch_ragusa"], straitTo: ["dch_croatia", "dch_thrace", "neu_adriatic"] },
    { id: "dch_ragusa",       name: "ラグーザ",          terrain: "coast",     neighbors: ["dch_croatia", "dch_albania", "neu_adriatic"] },

    // ---- アナトリア（3分割: coast + 高原 + 東） ----
    { id: "dch_anatolia_coast", name: "エーゲ海岸",      terrain: "coast",     neighbors: ["dch_capital", "dch_thrace", "dch_anatolia"] },
    { id: "dch_anatolia",       name: "アナトリア高原",  terrain: "plains",    neighbors: ["dch_anatolia_coast", "dch_anatolia_e"], straitTo: ["dch_egypt_delta"] },
    { id: "dch_anatolia_e",     name: "東アナトリア",    terrain: "mountains", neighbors: ["dch_anatolia", "dch_thrace"] },

    // ---- エジプト（4分割: delta + nile + sinai + egypt_w） ----
    { id: "dch_egypt_delta",  name: "エジプト・デルタ",  terrain: "coast",     neighbors: ["dch_egypt_nile", "dch_sinai", "dch_tripolitania"], straitTo: ["dch_anatolia"] },
    { id: "dch_egypt_nile",   name: "上エジプト",        terrain: "plains",    neighbors: ["dch_egypt_delta", "dch_egypt_w"] },
    { id: "dch_sinai",        name: "シナイ半島",        terrain: "coast",     neighbors: ["dch_egypt_delta", "dch_egypt_w"] },
    { id: "dch_egypt_w",      name: "西方砂漠",          terrain: "plains",    neighbors: ["dch_sinai", "dch_egypt_nile", "dch_fezzan_e"] },

    // ---- リビア（2分割: tripolitania + cyrenaica） ----
    { id: "dch_tripolitania", name: "トリポリタニア",    terrain: "coast",     neighbors: ["dch_cyrenaica", "dch_tunisia", "dch_fezzan_w", "dch_egypt_delta"], straitTo: ["hol_palermo"] },
    { id: "dch_cyrenaica",    name: "キレナイカ",        terrain: "coast",     neighbors: ["dch_tripolitania", "dch_fezzan_e"] },

    // ---- フェザーン（2分割: fezzan_w + fezzan_e） ----
    { id: "dch_fezzan_w",     name: "フェザーン西部",    terrain: "plains",    neighbors: ["dch_tripolitania", "dch_fezzan_e", "dch_algeria_s"] },
    { id: "dch_fezzan_e",     name: "フェザーン東部",    terrain: "plains",    neighbors: ["dch_fezzan_w", "dch_cyrenaica", "dch_egypt_w"] },

    // ---- マグレブ（3分割: morocco_n + morocco_s + tunisia） ----
    { id: "dch_morocco_n",    name: "モロッコ北部",      terrain: "coast",     neighbors: ["dch_morocco_s"], straitTo: ["kgd_andalusia", "hol_palermo", "hol_sardinia"] },
    { id: "dch_morocco_s",    name: "モロッコ南部",      terrain: "plains",    neighbors: ["dch_morocco_n", "dch_algeria_nw", "dch_algeria_s"] },
    { id: "dch_tunisia",      name: "チュニジア",        terrain: "coast",     neighbors: ["dch_algeria_ne", "dch_tripolitania"], straitTo: ["hol_palermo"] },

    // ---- アルジェリア（4分割） ----
    { id: "dch_algeria_nw",   name: "アルジェリア西部",  terrain: "coast",     neighbors: ["dch_algeria_n", "dch_morocco_s"] },
    { id: "dch_algeria_n",    name: "アルジェリア北部",  terrain: "plains",    neighbors: ["dch_algeria_nw", "dch_algeria_ne", "dch_algeria_s"] },
    { id: "dch_algeria_ne",   name: "アルジェリア東部",  terrain: "coast",     neighbors: ["dch_algeria_n", "dch_algeria_s", "dch_tunisia"] },
    { id: "dch_algeria_s",    name: "アルジェリア内陸",  terrain: "plains",    neighbors: ["dch_algeria_nw", "dch_algeria_n", "dch_algeria_ne", "dch_morocco_s", "dch_fezzan_w"] },
  ],
};
