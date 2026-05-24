import type { NationConfig } from "../map.js";

// 連邦 (fed): スカンジナビアモデル 機動特化 10州
export const federation: NationConfig = {
  id: "fed",
  name: "連邦",
  color: "#06b6d4",
  capitalStateId: "fed_capital",
  specialty: "mobility",
  states: [
    { id: "fed_capital",  name: "連邦首都",      terrain: "capital",   capitalOf: "fed", neighbors: ["fed_norway", "fed_sweden", "fed_gothland", "fed_denmark"] },
    { id: "fed_norway",   name: "ノルウェー",     terrain: "mountains", neighbors: ["fed_capital", "fed_sweden", "fed_northland", "fed_iceland"] },
    { id: "fed_sweden",   name: "スウェーデン",   terrain: "forest",    neighbors: ["fed_capital", "fed_norway", "fed_gothland", "fed_finland", "fed_northland"] },
    { id: "fed_gothland", name: "ゴートランド",   terrain: "coast",     neighbors: ["fed_capital", "fed_sweden", "fed_denmark", "emp_prussia", "neu_baltic"], straitTo: ["emp_pomerania", "fed_denmark"] },
    { id: "fed_denmark",  name: "デンマーク",     terrain: "coast",     neighbors: ["fed_capital", "fed_gothland", "neu_baltic"], straitTo: ["emp_holstein", "emp_pomerania", "fed_gothland"] },
    { id: "fed_finland",  name: "フィンランド",   terrain: "forest",    neighbors: ["fed_sweden", "fed_northland", "fed_karelia"] },
    { id: "fed_northland",name: "ノルトランド",   terrain: "mountains", neighbors: ["fed_norway", "fed_sweden", "fed_finland", "fed_karelia"] },
    { id: "fed_karelia",  name: "カレリア",       terrain: "forest",    neighbors: ["fed_finland", "fed_northland"] },
    { id: "fed_iceland",  name: "アイスランド",   terrain: "coast",     neighbors: ["fed_norway"] },
    { id: "fed_faroe",    name: "フェロー諸島",   terrain: "coast",     neighbors: [], straitTo: ["fed_norway", "fed_iceland"] },
  ],
};
