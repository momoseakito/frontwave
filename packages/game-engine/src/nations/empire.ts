import type { NationConfig } from "../map.js";

// 帝国 (emp): ロシア帝国モデル 防衛特化
export const empire: NationConfig = {
  id: "emp",
  name: "ロシア帝国",
  color: "#8b1a1a",
  capitalStateId: "emp_capital",
  specialty: "defense",
  states: [
    { id: "emp_capital",     name: "モスクワ",        terrain: "capital",   capitalOf: "emp", neighbors: ["emp_vladimir", "emp_volga_n"] },

    // ---- ウラジーミル（モスクワ近郊） ----
    { id: "emp_vladimir",    name: "ウラジーミル",    terrain: "forest",    neighbors: ["emp_capital", "emp_franconia_w", "emp_saxony", "emp_volga_n"] },

    // ---- ヴォルガ上流 ----
    { id: "emp_volga_n",     name: "ヴォルガ上流",    terrain: "forest",    neighbors: ["emp_capital", "emp_carinthia_e", "emp_franconia_w", "emp_prussia_s", "emp_vladimir", "emp_vologda"] },

    // ---- ヴォログダ・カレリア ----
    { id: "emp_vologda",     name: "ヴォログダ",      terrain: "forest",    neighbors: ["emp_arkhangelsk", "emp_carinthia_e", "emp_karelia", "emp_prussia", "emp_prussia_s", "emp_pskov", "emp_volga_n"] },
    { id: "emp_karelia",     name: "カレリア",        terrain: "coast",     neighbors: ["emp_arkhangelsk", "emp_holstein", "emp_prussia", "emp_vologda", "fed_finland", "fed_kainuu", "fed_karelia_n", "fed_lapland", "fed_ostrobothnia_n"], straitTo: ["fed_denmark"] },

    // ---- アルハンゲリスク・ネネツ ----
    { id: "emp_arkhangelsk", name: "アルハンゲリスク", terrain: "coast",    neighbors: ["emp_carinthia_e", "emp_karelia", "emp_nenets", "emp_vologda"] },
    { id: "emp_nenets",      name: "ネネツ",           terrain: "coast",    neighbors: ["emp_arkhangelsk"] },

    // ---- コミ ----
    { id: "emp_komi_s",      name: "コミ南部",         terrain: "forest",   neighbors: [] },
    { id: "emp_komi_n",      name: "コミ北部",         terrain: "forest",   neighbors: [] },

    // ---- ケルンテン（ウラル・ヴォルガ方面） ----
    { id: "emp_carinthia_w", name: "ケルンテン西",    terrain: "forest",    neighbors: ["emp_carinthia_e", "emp_franconia_w", "emp_perm", "emp_swabia_n", "emp_swabia_s"] },
    { id: "emp_carinthia_e", name: "ケルンテン東",    terrain: "mountains", neighbors: ["emp_arkhangelsk", "emp_carinthia_w", "emp_franconia_w", "emp_perm", "emp_swabia_n", "emp_volga_n", "emp_vologda"] },
    { id: "emp_perm",        name: "ペルミ",          terrain: "mountains", neighbors: ["emp_carinthia_e", "emp_carinthia_w", "emp_swabia_s"] },

    // ---- コーカサス方面 ----
    { id: "emp_austria",     name: "北コーカサス",    terrain: "coast",     neighbors: ["emp_austria_e", "emp_bavaria_s", "emp_stavropol"] },
    { id: "emp_austria_e",   name: "東コーカサス",    terrain: "mountains", neighbors: ["emp_austria", "emp_dagestan", "emp_stavropol"] },
    { id: "emp_dagestan",    name: "ダゲスタン",      terrain: "mountains", neighbors: ["emp_austria_e", "emp_bavarian_s", "emp_stavropol"] },
    { id: "emp_stavropol",   name: "スタヴロポリ",    terrain: "plains",    neighbors: ["emp_austria", "emp_austria_e", "emp_bavaria_s", "emp_bavarian_s", "emp_dagestan"] },
    { id: "emp_bavarian_s",  name: "コーカサス草原",  terrain: "plains",    neighbors: ["emp_bavaria_s", "emp_dagestan", "emp_stavropol"] },

    // ---- ドン・ヴォロネジ ----
    { id: "emp_bavaria_s",   name: "ドン川",          terrain: "plains",    neighbors: ["emp_austria", "emp_bavarian_s", "emp_stavropol", "emp_voronezh", "neu_crimea", "neu_ukraine_n"] },
    { id: "emp_voronezh",    name: "ヴォロネジ",      terrain: "plains",    neighbors: ["emp_bavaria_s", "neu_ukraine_n"] },

    // ---- 旧中立（ロシア側） ----
    { id: "neu_ukraine_n",   name: "ウクライナ北東",  terrain: "plains",    neighbors: ["emp_bavaria_s", "emp_voronezh", "emp_westmark", "emp_westmark_s", "neu_bohemia_nw", "neu_crimea", "neu_dnipro_n", "neu_dnipro_s", "neu_steppe"] },
    { id: "neu_ukraine_w",   name: "ウクライナ西部",  terrain: "plains",    neighbors: ["dch_moldavia", "dch_transylvania", "hol_castile", "neu_bohemia", "neu_bohemia_nw", "neu_danube", "neu_dnipro_n", "neu_pontic", "neu_steppe"] },
    { id: "neu_dnipro_n",    name: "ドニプロ北部",    terrain: "plains",    neighbors: ["neu_bohemia_nw", "neu_steppe", "neu_ukraine_n", "neu_ukraine_w"] },
    { id: "neu_steppe",      name: "ウクライナ草原",  terrain: "plains",    neighbors: ["neu_dnipro_n", "neu_dnipro_s", "neu_pontic", "neu_ukraine_n", "neu_ukraine_w"] },
    { id: "neu_dnipro_s",    name: "ドニプロ南部",    terrain: "plains",    neighbors: ["emp_westmark_s", "neu_crimea", "neu_pontic", "neu_steppe", "neu_ukraine_n"] },
    { id: "neu_pontic",      name: "黒海草原",        terrain: "coast",     neighbors: ["dch_moldavia", "dch_wallachia", "neu_crimea", "neu_dnipro_s", "neu_steppe", "neu_ukraine_w"] },
    { id: "neu_crimea",      name: "クリミア・東部",  terrain: "coast",     neighbors: ["emp_bavaria_s", "neu_dnipro_s", "neu_pontic", "neu_ukraine_n"] },

    // ---- 中欧・プロイセン（hol から移動） ----
    { id: "emp_prussia",     name: "プロイセン",      terrain: "coast",     neighbors: ["emp_karelia", "emp_pskov", "emp_vologda", "fed_finland", "fed_finland_e", "neu_baltic"], straitTo: ["fed_gothland"] },
    { id: "emp_pskov",       name: "ポメラニア",      terrain: "coast",     neighbors: ["emp_prussia", "emp_prussia_s", "emp_vologda", "emp_westmark", "neu_baltic", "neu_silesia"] },
    { id: "emp_prussia_s",   name: "ブランデンブルク", terrain: "forest",   neighbors: ["emp_capital", "emp_pskov", "emp_volga_n", "emp_vologda", "emp_westmark"] },
    { id: "emp_holstein",    name: "ホルシュタイン",  terrain: "coast",     neighbors: ["emp_karelia", "fed_lapland", "fed_northland_n"], straitTo: ["fed_denmark"] },
    { id: "emp_saxony",      name: "ザクセン",         terrain: "mountains", neighbors: ["emp_capital", "emp_franconia_s", "emp_franconia_w", "emp_mordovia", "emp_vladimir", "emp_westmark", "emp_westmark_s"] },
    { id: "emp_franconia_w", name: "フランコニア西",   terrain: "forest",    neighbors: ["emp_carinthia_e", "emp_carinthia_w", "emp_franconia_s", "emp_mordovia", "emp_saxony", "emp_swabia_n", "emp_vladimir", "emp_volga_n"] },
    { id: "emp_franconia_s", name: "フランコニア南",   terrain: "plains",    neighbors: ["emp_bavaria", "emp_franconia_w", "emp_mordovia", "emp_saxony", "emp_swabia_n", "emp_voronezh", "emp_westmark_s"] },
    { id: "emp_mordovia",    name: "フランコニア東",   terrain: "plains",    neighbors: ["emp_bavaria", "emp_franconia_s", "emp_franconia_w", "emp_saxony"] },
    { id: "emp_bavaria",     name: "バイエルン",       terrain: "plains",    neighbors: ["emp_franconia_s", "emp_mordovia", "emp_swabia_n"] },
    { id: "emp_swabia_n",    name: "シュヴァーベン北", terrain: "forest",    neighbors: ["emp_bavaria", "emp_carinthia_e", "emp_carinthia_w", "emp_franconia_s", "emp_franconia_w", "emp_orenburg", "emp_swabia_s"] },
    { id: "emp_swabia_s",    name: "シュヴァーベン南", terrain: "mountains", neighbors: ["emp_carinthia_w", "emp_orenburg", "emp_perm", "emp_swabia_n"] },
    { id: "emp_orenburg",    name: "シュヴァーベン東", terrain: "plains",    neighbors: ["emp_swabia_n", "emp_swabia_s"] },
    { id: "emp_westmark",    name: "西辺境州",         terrain: "forest",    neighbors: ["emp_prussia_s", "emp_pskov", "emp_saxony", "emp_westmark_s", "neu_bohemia_nw", "neu_silesia", "neu_silesia_e", "neu_ukraine_n"] },
    { id: "emp_westmark_s",  name: "西辺境南部",       terrain: "plains",    neighbors: ["emp_franconia_s", "emp_saxony", "emp_westmark", "neu_dnipro_s", "neu_ukraine_n"] },
    { id: "neu_baltic",      name: "バルト沿岸",       terrain: "coast",     neighbors: ["emp_prussia", "emp_pskov", "neu_lithuania", "neu_silesia", "neu_silesia_e"], straitTo: ["fed_denmark"] },
    { id: "neu_lithuania",   name: "リトアニア",       terrain: "plains",    neighbors: ["neu_baltic", "neu_silesia", "neu_silesia_e"] },
    { id: "neu_silesia",     name: "シレジア北",       terrain: "plains",    neighbors: ["emp_pskov", "emp_westmark", "hol_apulia", "hol_capital", "neu_baltic", "neu_bohemia", "neu_bohemia_nw", "neu_lithuania", "neu_silesia_e"] },
    { id: "neu_silesia_e",   name: "シレジア東",       terrain: "plains",    neighbors: ["emp_westmark", "neu_baltic", "neu_bohemia", "neu_bohemia_nw", "neu_lithuania", "neu_silesia"] },
    { id: "neu_bohemia_nw",  name: "ボヘミア西部",     terrain: "plains",    neighbors: ["emp_westmark", "hol_capital", "hol_lombardy", "neu_bohemia", "neu_dnipro_n", "neu_silesia", "neu_silesia_e", "neu_ukraine_n", "neu_ukraine_w"] },
    { id: "neu_bohemia",     name: "ボヘミア",         terrain: "mountains", neighbors: ["hol_calabria_s", "hol_emilia", "hol_lombardy", "neu_bohemia_nw", "neu_danube", "neu_silesia", "neu_silesia_e", "neu_ukraine_w"] },
  ],
};
