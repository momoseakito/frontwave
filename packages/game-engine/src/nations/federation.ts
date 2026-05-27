import type { NationConfig } from "../map.js";

// 連邦 (fed): British-Nordic Union 機動特化
export const federation: NationConfig = {
  id: "fed",
  name: "大英帝国",
  color: "#b5121b",
  capitalStateId: "fed_london",
  specialty: "mobility",
  states: [
    // ---- 英国諸島 ----
    { id: "fed_london",       name: "ロンドン首都圏",     terrain: "capital",   capitalOf: "fed", neighbors: ["fed_england_s", "fed_midlands"], straitTo: ["fed_denmark", "neu_rhine"] },
    { id: "fed_england_s",    name: "イングランド南西部", terrain: "coast",     neighbors: ["fed_london", "fed_midlands", "fed_wales"] },
    { id: "fed_midlands",     name: "ミッドランズ",       terrain: "plains",    neighbors: ["fed_england_n", "fed_england_s", "fed_london", "fed_wales"] },
    { id: "fed_england_n",    name: "イングランド北部",   terrain: "plains",    neighbors: ["fed_lowlands", "fed_midlands", "fed_wales"] },
    { id: "fed_wales",        name: "ウェールズ",         terrain: "mountains", neighbors: ["fed_england_n", "fed_england_s", "fed_midlands"], straitTo: ["fed_ire_leinster"] },
    { id: "fed_lowlands",     name: "スコットランド低地", terrain: "plains",    neighbors: ["fed_england_n", "fed_highlands"] },
    { id: "fed_highlands",    name: "スコットランド高地", terrain: "mountains", neighbors: ["fed_lowlands"], straitTo: ["fed_norway_w", "fed_iceland"] },
    { id: "fed_ire_leinster", name: "レンスター",         terrain: "coast",     neighbors: ["fed_ire_connacht", "fed_ire_munster"], straitTo: ["fed_wales"] },
    { id: "fed_ire_munster",  name: "マンスター",         terrain: "coast",     neighbors: ["fed_ire_connacht", "fed_ire_leinster"] },
    { id: "fed_ire_connacht", name: "コノート",           terrain: "coast",     neighbors: ["fed_ire_leinster", "fed_ire_munster"], straitTo: ["fed_lowlands", "fed_england_n"] },

    // ---- スカンジナビア ----
    { id: "fed_norway_se",    name: "ノルウェー南東",    terrain: "coast",     neighbors: ["fed_gothland", "fed_norway_in", "fed_norway_w", "fed_svealand"], straitTo: ["fed_denmark"] },
    { id: "fed_norway_in",    name: "ノルウェー内陸",    terrain: "mountains", neighbors: ["fed_norrland_s", "fed_norway_se", "fed_norway_w", "fed_svealand", "fed_trondelag"] },
    { id: "fed_norway_w",     name: "ノルウェー西部",    terrain: "mountains", neighbors: ["fed_norway_in", "fed_norway_se", "fed_trondelag"], straitTo: ["fed_highlands", "fed_iceland"] },
    { id: "fed_trondelag",    name: "トロンデラーグ",    terrain: "mountains", neighbors: ["fed_norrland_s", "fed_northland", "fed_norway_in", "fed_norway_w", "fed_svealand"] },
    { id: "fed_sweden",       name: "スウェーデン",      terrain: "coast",     neighbors: ["fed_gothland", "fed_norrland_s", "fed_svealand"], straitTo: ["fed_finland_e"] },
    { id: "fed_svealand",     name: "スヴェアランド",    terrain: "forest",    neighbors: ["fed_gothland", "fed_norrland_s", "fed_norway_in", "fed_norway_se", "fed_sweden", "fed_trondelag"] },
    { id: "fed_norrland_s",   name: "南ノルランド",      terrain: "mountains", neighbors: ["fed_norrbotten", "fed_northland", "fed_norway_in", "fed_svealand", "fed_sweden", "fed_trondelag"], straitTo: ["fed_finland_e"] },
    { id: "fed_gothland",     name: "ゴートランド",      terrain: "coast",     neighbors: ["fed_norway_se", "fed_svealand", "fed_sweden"], straitTo: ["emp_karelia", "fed_denmark"] },
    { id: "fed_denmark",      name: "デンマーク",        terrain: "coast",     neighbors: ["hol_apulia"], straitTo: ["emp_holstein", "emp_karelia", "fed_gothland", "fed_london"] },
    { id: "fed_finland",      name: "フィンランド南部",  terrain: "forest",    neighbors: ["emp_karelia", "emp_prussia", "fed_finland_e", "fed_karelia_n", "fed_ostrobothnia_n", "fed_savonia_n"], straitTo: ["fed_sweden", "fed_norrland_s"] },
    { id: "fed_finland_e",    name: "フィンランド東部",  terrain: "forest",    neighbors: ["emp_prussia", "fed_finland", "fed_ostrobothnia_n", "fed_savonia_n"], straitTo: ["fed_sweden", "fed_norrland_s"] },
    { id: "fed_northland",    name: "ノルトランド",      terrain: "coast",     neighbors: ["fed_norrbotten", "fed_norrland_s", "fed_northland_n", "fed_trondelag"], straitTo: ["fed_svalbard"] },
    { id: "fed_northland_n",  name: "フィンマルク",      terrain: "mountains", neighbors: ["emp_holstein", "fed_lapland", "fed_norrbotten", "fed_northland"], straitTo: ["fed_svalbard"] },
    { id: "fed_norrbotten",   name: "ノルボッテン",      terrain: "forest",    neighbors: ["fed_lapland", "fed_norrland_s", "fed_northland", "fed_northland_n"] },
    { id: "fed_svalbard",     name: "スヴァールバル",    terrain: "coast",     neighbors: [], straitTo: ["fed_northland", "fed_northland_n", "fed_iceland"] },
    { id: "fed_lapland",      name: "ラップランド",      terrain: "mountains", neighbors: ["emp_holstein", "emp_karelia", "fed_norrbotten", "fed_northland_n", "fed_ostrobothnia_n"] },
    { id: "fed_ostrobothnia_n", name: "北ポフヤンマー",  terrain: "forest",    neighbors: ["emp_karelia", "fed_finland", "fed_finland_e", "fed_kainuu", "fed_lapland", "fed_savonia_n"] },
    { id: "fed_kainuu",       name: "カイヌー",          terrain: "forest",    neighbors: ["emp_karelia", "fed_karelia_n", "fed_ostrobothnia_n", "fed_savonia_n"] },
    { id: "fed_karelia_n",    name: "北カレリア",        terrain: "forest",    neighbors: ["emp_karelia", "fed_finland", "fed_kainuu", "fed_savonia_n"] },
    { id: "fed_savonia_n",    name: "北サヴォ",          terrain: "forest",    neighbors: ["fed_finland", "fed_finland_e", "fed_kainuu", "fed_karelia_n", "fed_ostrobothnia_n"] },
    { id: "fed_iceland",      name: "アイスランド南西",  terrain: "coast",     neighbors: ["fed_iceland_n"], straitTo: ["fed_norway_w", "fed_svalbard"] },
    { id: "fed_iceland_n",    name: "アイスランド北東",  terrain: "mountains", neighbors: ["fed_iceland"], straitTo: ["fed_highlands"] },
  ],
};
