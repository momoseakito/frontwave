import type { NationConfig } from "../map.js";

// 連邦 (fed): British-Nordic Union 機動特化 32州 (英国諸島13 + 北欧17 + 島嶼2)
export const federation: NationConfig = {
  id: "fed",
  name: "連邦",
  color: "#8b1a1a",
  capitalStateId: "fed_london",
  specialty: "mobility",
  states: [
    // ---- 英国諸島 (v7: 13州構成 — London/SE 分離・Scotland 高低分割・Ireland 3分割) ----
    { id: "fed_london",       name: "ロンドン首都圏",     terrain: "capital",   capitalOf: "fed", neighbors: ["fed_southeast", "fed_midlands"], straitTo: ["fed_denmark", "neu_rhine"] },
    { id: "fed_southeast",    name: "南東イングランド",   terrain: "coast",     neighbors: ["fed_london", "fed_midlands", "fed_england_s"], straitTo: ["neu_rhine"] },
    { id: "fed_england_s",    name: "イングランド南西部", terrain: "coast",     neighbors: ["fed_southeast", "fed_midlands", "fed_wales"] },
    { id: "fed_midlands",     name: "ミッドランズ",       terrain: "plains",    neighbors: ["fed_london", "fed_southeast", "fed_england_s", "fed_england_n", "fed_yorkshire", "fed_wales"] },
    { id: "fed_england_n",    name: "イングランド北部",   terrain: "plains",    neighbors: ["fed_midlands", "fed_yorkshire", "fed_wales", "fed_lowlands"], straitTo: ["fed_n_ireland"] },
    { id: "fed_yorkshire",    name: "ヨークシャー",       terrain: "coast",     neighbors: ["fed_midlands", "fed_england_n"] },
    { id: "fed_wales",        name: "ウェールズ",         terrain: "mountains", neighbors: ["fed_england_s", "fed_midlands", "fed_england_n"], straitTo: ["fed_ire_leinster"] },
    { id: "fed_lowlands",     name: "スコットランド低地", terrain: "plains",    neighbors: ["fed_england_n", "fed_highlands"], straitTo: ["fed_n_ireland"] },
    { id: "fed_highlands",    name: "スコットランド高地", terrain: "mountains", neighbors: ["fed_lowlands"], straitTo: ["fed_norway_w", "fed_faroe"] },
    { id: "fed_n_ireland",    name: "北アイルランド",     terrain: "coast",     neighbors: ["fed_ire_connacht", "fed_ire_leinster"], straitTo: ["fed_lowlands", "fed_england_n"] },
    { id: "fed_ire_leinster", name: "レンスター",         terrain: "coast",     neighbors: ["fed_ire_munster", "fed_ire_connacht", "fed_n_ireland"], straitTo: ["fed_wales"] },
    { id: "fed_ire_munster",  name: "マンスター",         terrain: "coast",     neighbors: ["fed_ire_leinster", "fed_ire_connacht"] },
    { id: "fed_ire_connacht", name: "コノート",           terrain: "plains",    neighbors: ["fed_ire_leinster", "fed_ire_munster", "fed_n_ireland"] },

    // ---- スカンジナビア (v7: ノルウェーを 3 分割) ----
    { id: "fed_norway_se", name: "ノルウェー南東", terrain: "coast",     neighbors: ["fed_norway_w", "fed_trondelag", "fed_svealand"], straitTo: ["fed_southeast", "fed_denmark"] },
    { id: "fed_norway_w",  name: "ノルウェー西部", terrain: "mountains", neighbors: ["fed_norway_se", "fed_trondelag"], straitTo: ["fed_highlands", "fed_iceland"] },
    { id: "fed_trondelag", name: "トロンデラーグ", terrain: "mountains", neighbors: ["fed_norway_se", "fed_norway_w", "fed_northland", "fed_norrland_s"] },
    { id: "fed_sweden",     name: "スウェーデン",   terrain: "coast",     neighbors: ["fed_svealand", "fed_norrland_s", "fed_gothland"], straitTo: ["fed_finland"] },
    { id: "fed_svealand",   name: "スヴェアランド", terrain: "forest",    neighbors: ["fed_sweden", "fed_norrland_s", "fed_gothland", "fed_norway_se"] },
    { id: "fed_norrland_s", name: "南ノルランド",   terrain: "mountains", neighbors: ["fed_sweden", "fed_svealand", "fed_trondelag", "fed_norrbotten"], straitTo: ["fed_finland"] },
    { id: "fed_gothland",  name: "ゴートランド",   terrain: "coast",     neighbors: ["fed_sweden", "fed_svealand", "fed_denmark", "emp_prussia", "neu_baltic"], straitTo: ["emp_karelia", "fed_denmark"] },
    { id: "fed_denmark",   name: "デンマーク",     terrain: "coast",     neighbors: ["fed_gothland", "neu_baltic"], straitTo: ["emp_holstein", "emp_karelia", "fed_gothland", "fed_london"] },
    { id: "fed_finland",        name: "フィンランド",   terrain: "forest",    neighbors: ["fed_norrbotten", "fed_ostrobothnia_n", "fed_karelia_n", "fed_savonia_n"], straitTo: ["fed_sweden", "fed_norrland_s"] },
    { id: "fed_northland",      name: "ノルトランド",   terrain: "coast",     neighbors: ["fed_trondelag", "fed_norrbotten", "fed_northland_n"], straitTo: ["fed_svalbard"] },
    { id: "fed_northland_n",    name: "フィンマルク",   terrain: "mountains", neighbors: ["fed_northland", "fed_lapland"], straitTo: ["fed_svalbard"] },
    { id: "fed_norrbotten",     name: "ノルボッテン",   terrain: "forest",    neighbors: ["fed_northland", "fed_norrland_s", "fed_finland", "fed_lapland"] },
    { id: "fed_svalbard",       name: "スヴァールバル", terrain: "coast",     neighbors: [], straitTo: ["fed_northland", "fed_northland_n", "fed_iceland"] },
    { id: "fed_lapland",        name: "ラップランド",   terrain: "mountains", neighbors: ["fed_northland_n", "fed_norrbotten", "fed_ostrobothnia_n", "fed_kainuu"] },
    { id: "fed_ostrobothnia_n", name: "北ポフヤンマー", terrain: "forest",    neighbors: ["fed_lapland", "fed_kainuu", "fed_savonia_n", "fed_finland"] },
    { id: "fed_kainuu",         name: "カイヌー",       terrain: "forest",    neighbors: ["fed_lapland", "fed_ostrobothnia_n", "fed_savonia_n", "fed_karelia_n"] },
    { id: "fed_karelia_n",      name: "北カレリア",     terrain: "forest",    neighbors: ["fed_kainuu", "fed_savonia_n", "fed_finland"] },
    { id: "fed_savonia_n",      name: "北サヴォ",       terrain: "forest",    neighbors: ["fed_ostrobothnia_n", "fed_kainuu", "fed_karelia_n", "fed_finland"] },
    { id: "fed_iceland",    name: "アイスランド",   terrain: "coast",     neighbors: [], straitTo: ["fed_norway_w", "fed_svalbard"] },
    { id: "fed_faroe",      name: "フェロー諸島",   terrain: "coast",     neighbors: [], straitTo: ["fed_norway_w", "fed_iceland", "fed_highlands"] },
  ],
};
