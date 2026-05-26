import type { NationConfig } from "../map.js";

// 帝国 (emp): 神聖ローマ・ドイツモデル 防衛特化
// 本土13州 → 分割後36州 (旧中立 neu_* 含む)
export const empire: NationConfig = {
  id: "emp",
  name: "帝国",
  color: "#f4d03f",
  capitalStateId: "emp_capital",
  specialty: "defense",
  states: [
    { id: "emp_capital",     name: "皇帝都",       terrain: "capital",   capitalOf: "emp", neighbors: ["emp_saxony", "emp_franconia_w", "emp_bavaria", "emp_austria", "emp_prussia"] },

    // ---- ザクセン・西方 ----
    { id: "emp_saxony",      name: "ザクセン",      terrain: "mountains", neighbors: ["emp_capital", "emp_franconia_w", "emp_prussia", "emp_prussia_s", "emp_westmark", "neu_bohemia", "neu_silesia", "dch_moravia"] },

    // ---- フランコニア（2分割） ----
    { id: "emp_franconia_w", name: "フランコニア西", terrain: "forest",   neighbors: ["emp_saxony", "emp_volga_n", "emp_carinthia_w", "emp_swabia_n", "emp_franconia_s", "emp_bavaria", "emp_westmark", "kgd_lorraine"] },
    { id: "emp_franconia_s", name: "フランコニア南", terrain: "plains",   neighbors: ["emp_franconia_w", "emp_westmark_s", "emp_bavaria", "emp_carinthia_w", "emp_swabia_n"] },

    // ---- バイエルン（2分割） ----
    { id: "emp_bavaria",     name: "バイエルン",    terrain: "plains",    neighbors: ["emp_capital", "emp_franconia_w", "emp_franconia_s", "emp_swabia_n", "emp_bavarian_s", "rep_piedmont", "neu_alps"] },
    { id: "emp_bavarian_s",  name: "コーカサス草原", terrain: "plains",   neighbors: ["emp_bavaria", "emp_austria", "emp_austria_e", "emp_westmark_s", "neu_steppe", "neu_pontic"] },

    // ---- オーストリア（2分割） ----
    { id: "emp_austria",     name: "オーストリア",  terrain: "coast",     neighbors: ["emp_capital", "emp_bavarian_s", "emp_carinthia_e", "emp_austria_e", "neu_danube"] },
    { id: "emp_austria_e",   name: "東コーカサス",  terrain: "mountains", neighbors: ["emp_austria", "emp_bavarian_s", "emp_carinthia_e"] },

    // ---- シュヴァーベン（2分割） ----
    { id: "emp_swabia_n",    name: "シュヴァーベン北", terrain: "forest", neighbors: ["emp_franconia_w", "emp_franconia_s", "emp_carinthia_w", "emp_bavaria", "emp_swabia_s"] },
    { id: "emp_swabia_s",    name: "シュヴァーベン南", terrain: "mountains", neighbors: ["emp_swabia_n", "emp_carinthia_e", "emp_westmark_s", "neu_alps", "kgd_burgundy"] },

    // ---- 西辺境州（2分割） ----
    { id: "emp_westmark",    name: "西辺境州",      terrain: "forest",    neighbors: ["emp_saxony", "emp_franconia_w", "emp_prussia_s", "emp_westmark_s", "neu_silesia", "neu_rhine", "kgd_lorraine"] },
    { id: "emp_westmark_s",  name: "西辺境南部",    terrain: "plains",    neighbors: ["emp_westmark", "emp_franconia_s", "emp_bavarian_s", "emp_swabia_s", "neu_dnipro_n"] },

    // ---- プロイセン（2分割） ----
    { id: "emp_prussia",     name: "プロイセン",    terrain: "coast",     neighbors: ["emp_capital", "emp_saxony", "emp_karelia", "emp_prussia_s", "neu_baltic", "neu_silesia"], straitTo: ["fed_gothland"] },
    { id: "emp_prussia_s",   name: "ノヴゴロド内陸", terrain: "forest",  neighbors: ["emp_prussia", "emp_saxony", "emp_westmark", "emp_volga_n"] },

    // ---- カレリア・ヴォログダ（旧ポメラニアを2分割） ----
    { id: "emp_karelia",     name: "カレリア",      terrain: "coast",     neighbors: ["emp_prussia", "emp_vologda", "neu_baltic"], straitTo: ["fed_denmark"] },
    { id: "emp_vologda",     name: "ヴォログダ",    terrain: "forest",    neighbors: ["emp_karelia", "emp_arkhangelsk", "emp_volga_n", "emp_komi_s"] },
    { id: "emp_volga_n",     name: "ヴォルガ上流",  terrain: "forest",    neighbors: ["emp_vologda", "emp_prussia_s", "emp_franconia_w", "emp_carinthia_w"] },

    // ---- アルハンゲリスク・ネネツ（旧メクレンブルクを2分割） ----
    { id: "emp_arkhangelsk", name: "アルハンゲリスク", terrain: "coast",  neighbors: ["emp_vologda", "emp_nenets", "emp_komi_s"] },
    { id: "emp_nenets",      name: "ネネツ",        terrain: "coast",     neighbors: ["emp_arkhangelsk", "emp_komi_n"] },

    // ---- コミ（旧コミ森林領を2分割: GeoJSON直接分割） ----
    { id: "emp_komi_s",      name: "コミ南部",      terrain: "forest",    neighbors: ["emp_vologda", "emp_arkhangelsk", "emp_carinthia_e"] },
    { id: "emp_komi_n",      name: "コミ北部",      terrain: "forest",    neighbors: ["emp_arkhangelsk", "emp_nenets"] },

    { id: "emp_holstein",    name: "ホルシュタイン", terrain: "coast",    neighbors: ["emp_arkhangelsk", "emp_brabant"], straitTo: ["fed_denmark"] },
    { id: "emp_brabant",     name: "ブラバント",    terrain: "plains",    neighbors: ["emp_westmark", "emp_arkhangelsk", "emp_holstein", "neu_flanders", "kgd_artois"] },

    // ---- ケルンテン（2分割） ----
    { id: "emp_carinthia_w", name: "ケルンテン西",  terrain: "forest",    neighbors: ["emp_franconia_w", "emp_franconia_s", "emp_swabia_n", "emp_volga_n", "emp_carinthia_e"] },
    { id: "emp_carinthia_e", name: "ケルンテン東",  terrain: "mountains", neighbors: ["emp_carinthia_w", "emp_komi_s", "emp_swabia_s", "emp_austria", "emp_austria_e", "rep_friuli", "rep_lombardy"] },

    // ---- 旧中立 (v7 で emp に編入) ----
    { id: "neu_baltic",      name: "バルト沿岸",    terrain: "coast",     neighbors: ["emp_prussia", "emp_karelia", "neu_silesia", "fed_gothland"], straitTo: ["fed_denmark"] },
    { id: "neu_bohemia",     name: "ボヘミア",      terrain: "mountains", neighbors: ["emp_saxony", "emp_austria", "neu_silesia", "dch_moravia"] },
    { id: "neu_silesia",     name: "シレジア北",    terrain: "plains",    neighbors: ["neu_bohemia", "emp_saxony", "emp_prussia", "emp_westmark", "neu_baltic"] },
    { id: "neu_danube",      name: "ドナウ平原",    terrain: "plains",    neighbors: ["emp_austria", "neu_dnipro_n", "dch_moravia", "dch_hungary"] },
    { id: "neu_dnipro_n",    name: "ドニプロ北部",  terrain: "plains",    neighbors: ["neu_danube", "neu_steppe", "emp_westmark_s", "dch_moravia"] },
    { id: "neu_steppe",      name: "ウクライナ草原", terrain: "plains",   neighbors: ["neu_dnipro_n", "neu_pontic", "emp_bavarian_s", "dch_transylvania"] },
    { id: "neu_pontic",      name: "黒海草原",      terrain: "coast",     neighbors: ["neu_steppe", "dch_wallachia", "emp_bavarian_s"] },
  ],
};
