import type { NationConfig } from "../map.js";

// 連邦 (fed): British-Nordic Union 機動特化 19州 (北欧8 + 英国諸島9 + 島嶼2)
export const federation: NationConfig = {
  id: "fed",
  name: "連邦",
  color: "#8b1a1a",
  capitalStateId: "fed_capital",
  specialty: "mobility",
  states: [
    // ---- 英国諸島 (v6: 大型州を分割) ----
    { id: "fed_capital",   name: "連邦首都",      terrain: "capital",   capitalOf: "fed", neighbors: ["fed_england_s", "fed_midlands"], straitTo: ["fed_denmark", "fed_norway", "neu_rhine"] },
    { id: "fed_england_s", name: "イングランド南部", terrain: "coast",  neighbors: ["fed_capital", "fed_midlands", "fed_wales"] },
    { id: "fed_midlands",  name: "ミッドランズ",   terrain: "plains",    neighbors: ["fed_capital", "fed_england_s", "fed_england_n", "fed_yorkshire", "fed_wales"] },
    { id: "fed_england_n", name: "イングランド北部", terrain: "plains", neighbors: ["fed_midlands", "fed_yorkshire", "fed_scotland", "fed_wales"] },
    { id: "fed_yorkshire", name: "ヨークシャー",   terrain: "coast",     neighbors: ["fed_midlands", "fed_england_n"] },
    { id: "fed_wales",     name: "ウェールズ",     terrain: "mountains", neighbors: ["fed_england_s", "fed_midlands", "fed_england_n"], straitTo: ["fed_ireland"] },
    { id: "fed_scotland",  name: "スコットランド", terrain: "mountains", neighbors: ["fed_england_n"], straitTo: ["fed_n_ireland", "fed_norway"] },
    { id: "fed_n_ireland", name: "北アイルランド", terrain: "coast",     neighbors: [], straitTo: ["fed_scotland", "fed_ireland"] },
    { id: "fed_ireland",   name: "アイルランド",   terrain: "coast",     neighbors: [], straitTo: ["fed_n_ireland", "fed_wales"] },

    // ---- スカンジナビア ----
    { id: "fed_norway",    name: "ノルウェー",     terrain: "mountains", neighbors: ["fed_sweden", "fed_northland", "fed_iceland"], straitTo: ["fed_capital", "fed_scotland"] },
    { id: "fed_sweden",    name: "スウェーデン",   terrain: "forest",    neighbors: ["fed_norway", "fed_gothland", "fed_finland", "fed_northland"] },
    { id: "fed_gothland",  name: "ゴートランド",   terrain: "coast",     neighbors: ["fed_sweden", "fed_denmark", "emp_prussia", "neu_baltic"], straitTo: ["emp_pomerania", "fed_denmark"] },
    { id: "fed_denmark",   name: "デンマーク",     terrain: "coast",     neighbors: ["fed_gothland", "neu_baltic"], straitTo: ["emp_holstein", "emp_pomerania", "fed_gothland", "fed_capital"] },
    { id: "fed_finland",   name: "フィンランド",   terrain: "forest",    neighbors: ["fed_sweden", "fed_northland", "fed_karelia"] },
    { id: "fed_northland", name: "ノルトランド",   terrain: "mountains", neighbors: ["fed_norway", "fed_sweden", "fed_finland", "fed_karelia"] },
    { id: "fed_karelia",   name: "カレリア",       terrain: "forest",    neighbors: ["fed_finland", "fed_northland"] },
    { id: "fed_iceland",   name: "アイスランド",   terrain: "coast",     neighbors: ["fed_norway"] },
    { id: "fed_faroe",     name: "フェロー諸島",   terrain: "coast",     neighbors: [], straitTo: ["fed_norway", "fed_iceland"] },
  ],
};
