import type { NationConfig } from "../map.js";

// 帝国 (emp): 神聖ローマ・ドイツモデル 防衛特化
export const empire: NationConfig = {
  id: "emp",
  name: "帝国",
  color: "#f4d03f",
  capitalStateId: "emp_capital",
  specialty: "defense",
  states: [
    { id: "emp_capital",     name: "皇帝都",         terrain: "capital",   capitalOf: "emp", neighbors: ["emp_saxony", "emp_franconia_w", "emp_bavaria", "emp_austria", "emp_prussia"] },

    // ---- ザクセン（2分割） ----
    { id: "emp_saxony",      name: "ザクセン",        terrain: "mountains", neighbors: ["emp_capital", "emp_vladimir", "emp_franconia_w", "emp_prussia", "emp_prussia_s", "emp_westmark", "neu_bohemia", "neu_silesia", "dch_moravia"] },
    { id: "emp_vladimir",    name: "ウラジーミル",    terrain: "forest",    neighbors: ["emp_saxony", "emp_volga_n", "emp_franconia_w"] },

    // ---- フランコニア（3分割） ----
    { id: "emp_franconia_w", name: "フランコニア西",  terrain: "forest",    neighbors: ["emp_saxony", "emp_vladimir", "emp_volga_n", "emp_mordovia", "emp_carinthia_w", "emp_swabia_n", "emp_franconia_s", "emp_bavaria", "emp_westmark", "kgd_lorraine"] },
    { id: "emp_franconia_s", name: "フランコニア南",  terrain: "plains",    neighbors: ["emp_franconia_w", "emp_westmark_s", "emp_bavaria", "emp_carinthia_w", "emp_swabia_n"] },
    { id: "emp_mordovia",    name: "モルドヴィア",    terrain: "plains",    neighbors: ["emp_franconia_w", "emp_volga_n", "emp_swabia_n"] },

    // ---- バイエルン（3分割） ----
    { id: "emp_bavaria",     name: "バイエルン",      terrain: "plains",    neighbors: ["emp_capital", "emp_franconia_w", "emp_franconia_s", "emp_swabia_n", "emp_bavaria_s", "emp_bavarian_s", "rep_piedmont", "neu_alps"] },
    { id: "emp_bavaria_s",   name: "ドン川",          terrain: "plains",    neighbors: ["emp_bavaria", "emp_bavarian_s", "emp_stavropol", "neu_pontic"] },
    { id: "emp_bavarian_s",  name: "コーカサス草原",  terrain: "plains",    neighbors: ["emp_bavaria", "emp_bavaria_s", "emp_stavropol", "emp_austria", "emp_austria_e", "emp_westmark_s", "neu_steppe", "neu_pontic"] },

    // ---- オーストリア（3分割） ----
    { id: "emp_austria",     name: "オーストリア",    terrain: "coast",     neighbors: ["emp_capital", "emp_bavarian_s", "emp_stavropol", "emp_carinthia_e", "emp_austria_e", "emp_dagestan", "neu_danube"] },
    { id: "emp_austria_e",     name: "東コーカサス",      terrain: "mountains", neighbors: ["emp_austria", "emp_bavarian_s", "emp_carinthia_e", "emp_dagestan", "hol_georgia"] },
    { id: "emp_dagestan",      name: "ダゲスタン",        terrain: "mountains", neighbors: ["emp_austria", "emp_austria_e", "hol_georgia", "hol_transcaucasia"] },
    { id: "emp_stavropol",   name: "スタヴロポリ",    terrain: "plains",    neighbors: ["emp_bavaria_s", "emp_bavarian_s", "emp_austria", "neu_pontic"] },

    // ---- シュヴァーベン（3分割） ----
    { id: "emp_swabia_n",    name: "シュヴァーベン北", terrain: "forest",   neighbors: ["emp_franconia_w", "emp_mordovia", "emp_franconia_s", "emp_carinthia_w", "emp_bavaria", "emp_swabia_s"] },
    { id: "emp_swabia_s",    name: "シュヴァーベン南", terrain: "mountains", neighbors: ["emp_swabia_n", "emp_carinthia_e", "emp_westmark_s", "neu_alps", "kgd_burgundy"] },
    { id: "emp_orenburg",    name: "オレンブルク",    terrain: "plains",    neighbors: ["emp_swabia_n", "emp_carinthia_e", "emp_perm"] },

    // ---- 西辺境州（3分割） ----
    { id: "emp_westmark",    name: "西辺境州",        terrain: "forest",    neighbors: ["emp_saxony", "emp_franconia_w", "emp_prussia_s", "emp_westmark_s", "neu_silesia", "neu_rhine", "kgd_lorraine"] },
    { id: "emp_westmark_s",  name: "西辺境南部",      terrain: "plains",    neighbors: ["emp_westmark", "emp_franconia_s", "emp_bavarian_s", "emp_swabia_s", "emp_voronezh", "neu_dnipro_n"] },
    { id: "emp_voronezh",    name: "ヴォロネジ",      terrain: "plains",    neighbors: ["emp_westmark_s", "emp_bavaria_s", "neu_dnipro_n", "neu_steppe"] },

    // ---- プロイセン（3分割） ----
    { id: "emp_prussia",     name: "プロイセン",      terrain: "coast",     neighbors: ["emp_capital", "emp_saxony", "emp_karelia", "emp_pskov", "emp_prussia_s", "neu_baltic", "neu_silesia"], straitTo: ["fed_gothland"] },
    { id: "emp_pskov",       name: "プスコフ",        terrain: "coast",     neighbors: ["emp_prussia", "emp_karelia", "emp_prussia_s", "neu_baltic"] },
    { id: "emp_prussia_s",   name: "ノヴゴロド内陸",  terrain: "forest",    neighbors: ["emp_prussia", "emp_pskov", "emp_saxony", "emp_westmark", "emp_volga_n"] },

    // ---- カレリア・ヴォログダ ----
    { id: "emp_karelia",     name: "カレリア",        terrain: "coast",     neighbors: ["emp_prussia", "emp_pskov", "emp_vologda", "neu_baltic"], straitTo: ["fed_denmark"] },
    { id: "emp_vologda",     name: "ヴォログダ",      terrain: "forest",    neighbors: ["emp_karelia", "emp_arkhangelsk", "emp_volga_n", "emp_komi_s"] },
    { id: "emp_volga_n",     name: "ヴォルガ上流",    terrain: "forest",    neighbors: ["emp_vologda", "emp_vladimir", "emp_prussia_s", "emp_franconia_w", "emp_mordovia", "emp_carinthia_w"] },

    // ---- アルハンゲリスク・ネネツ ----
    { id: "emp_arkhangelsk", name: "アルハンゲリスク", terrain: "coast",    neighbors: ["emp_vologda", "emp_nenets", "emp_komi_s"] },
    { id: "emp_nenets",      name: "ネネツ",           terrain: "coast",    neighbors: ["emp_arkhangelsk", "emp_komi_n"] },

    // ---- コミ ----
    { id: "emp_komi_s",      name: "コミ南部",         terrain: "forest",   neighbors: ["emp_vologda", "emp_arkhangelsk", "emp_carinthia_e", "emp_perm"] },
    { id: "emp_komi_n",      name: "コミ北部",         terrain: "forest",   neighbors: ["emp_arkhangelsk", "emp_nenets"] },

    { id: "emp_holstein",    name: "ホルシュタイン",   terrain: "coast",    neighbors: ["emp_arkhangelsk"], straitTo: ["fed_denmark"] },

    // ---- ケルンテン（3分割） ----
    { id: "emp_carinthia_w", name: "ケルンテン西",    terrain: "forest",    neighbors: ["emp_franconia_w", "emp_franconia_s", "emp_swabia_n", "emp_volga_n", "emp_carinthia_e"] },
    { id: "emp_carinthia_e", name: "ケルンテン東",    terrain: "mountains", neighbors: ["emp_carinthia_w", "emp_komi_s", "emp_perm", "emp_swabia_s", "emp_orenburg", "emp_austria", "emp_austria_e", "rep_friuli", "rep_lombardy"] },
    { id: "emp_perm",        name: "ペルミ",          terrain: "mountains", neighbors: ["emp_carinthia_e", "emp_komi_s", "emp_orenburg"] },

    // ---- 旧中立 ----
    { id: "neu_baltic",      name: "バルト沿岸",      terrain: "coast",     neighbors: ["emp_prussia", "emp_pskov", "emp_karelia", "neu_lithuania", "neu_silesia", "fed_gothland"], straitTo: ["fed_denmark"] },
    { id: "neu_lithuania",   name: "リトアニア",      terrain: "plains",    neighbors: ["neu_baltic", "neu_bohemia_nw", "neu_silesia_e", "dch_moravia"] },
    { id: "neu_bohemia",     name: "ボヘミア",        terrain: "mountains", neighbors: ["emp_saxony", "emp_austria", "neu_bohemia_nw", "neu_silesia", "dch_moravia"] },
    { id: "neu_bohemia_nw",  name: "ボヘミア西部",    terrain: "plains",    neighbors: ["neu_bohemia", "neu_Lithuania", "neu_silesia_e", "emp_westmark", "emp_saxony"] },
    { id: "neu_silesia",     name: "シレジア北",      terrain: "plains",    neighbors: ["neu_bohemia", "emp_saxony", "emp_prussia", "emp_westmark", "neu_silesia_e", "neu_baltic"] },
    { id: "neu_silesia_e",   name: "シレジア東",      terrain: "plains",    neighbors: ["neu_silesia", "neu_bohemia_nw", "neu_lithuania", "emp_saxony", "dch_moravia"] },
    { id: "neu_danube",      name: "ドナウ平原",      terrain: "plains",    neighbors: ["emp_austria", "neu_ukraine_w", "neu_dnipro_n", "dch_moravia", "dch_hungary"] },
    { id: "neu_ukraine_w",   name: "ウクライナ西部",  terrain: "plains",    neighbors: ["neu_danube", "neu_dnipro_n", "neu_steppe", "dch_transylvania", "dch_moravia"] },
    { id: "neu_dnipro_n",    name: "ドニプロ北部",    terrain: "plains",    neighbors: ["neu_danube", "neu_ukraine_w", "neu_ukraine_n", "neu_steppe", "emp_westmark_s", "dch_moravia", "dch_moldavia"] },
    { id: "neu_ukraine_n",   name: "ウクライナ北東",  terrain: "plains",    neighbors: ["neu_dnipro_n", "neu_steppe", "neu_crimea", "emp_westmark_s"] },
    { id: "neu_steppe",      name: "ウクライナ草原",  terrain: "plains",    neighbors: ["neu_dnipro_n", "neu_ukraine_n", "neu_dnipro_s", "neu_pontic", "emp_bavarian_s", "emp_voronezh", "dch_transylvania"] },
    { id: "neu_dnipro_s",    name: "ドニプロ南部",    terrain: "plains",    neighbors: ["neu_steppe", "neu_pontic", "neu_crimea"] },
    { id: "neu_pontic",      name: "黒海草原",        terrain: "coast",     neighbors: ["neu_steppe", "neu_dnipro_s", "dch_wallachia", "emp_bavarian_s", "emp_stavropol"] },
    { id: "neu_crimea",      name: "クリミア・東部",  terrain: "coast",     neighbors: ["neu_ukraine_n", "neu_dnipro_s", "neu_pontic"] },
  ],
};
