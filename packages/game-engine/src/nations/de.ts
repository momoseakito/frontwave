import type { NationConfig } from "../map.js";

// ドイツ: de本国 + ポーランド + ロシア + スカンジナビア + ベネルクス北部
export const germany: NationConfig = {
  id: "de",
  name: "ドイツ",
  color: "#6b7280",
  capitalStateId: "de_berlin",
  states: [
    // ===== ドイツ本国 =====
    { id: "de_berlin",    name: "ベルリン",         terrain: "capital",   capitalOf: "de", neighbors: ["de_saxony", "de_hanover", "de_prussia", "pl_pomerania", "pl_masovia"] },
    { id: "de_hanover",   name: "ハノーファー",      terrain: "plains",    neighbors: ["de_berlin", "de_saxony", "de_hessen", "de_westphalia", "de_rhineland", "de_holstein", "bn_holland"] },
    { id: "de_saxony",    name: "ザクセン",          terrain: "mountains", neighbors: ["de_berlin", "de_hanover", "de_hessen", "de_bavaria", "pl_silesia", "at_bohemia", "at_moravia"] },
    { id: "de_hessen",    name: "ヘッセン",          terrain: "forest",    neighbors: ["de_hanover", "de_saxony", "de_bavaria", "de_westphalia", "de_rhineland", "fr_lorraine", "bn_luxembourg"] },
    { id: "de_bavaria",   name: "バイエルン",        terrain: "mountains", neighbors: ["de_saxony", "de_hessen", "de_rhineland", "fr_lorraine", "it_lombardy", "at_vienna", "at_bohemia"] },
    { id: "de_rhineland", name: "ラインラント",      terrain: "forest",    neighbors: ["de_hanover", "de_hessen", "de_bavaria", "de_westphalia", "fr_lorraine", "bn_luxembourg", "bn_wallonia"] },
    { id: "de_westphalia",name: "ウェストファリア",  terrain: "plains",    neighbors: ["de_hanover", "de_hessen", "de_rhineland", "bn_holland", "bn_wallonia"] },
    { id: "de_prussia",   name: "東プロイセン",      terrain: "plains",    neighbors: ["de_berlin", "pl_masovia", "pl_pomerania", "ru_baltic"] },
    { id: "de_holstein",  name: "ホルシュタイン",    terrain: "coast",     neighbors: ["de_hanover", "sc_denmark"] },

    // ===== ベネルクス北部（オランダ） =====
    { id: "bn_holland",   name: "オランダ",          terrain: "coast",     neighbors: ["de_hanover", "de_westphalia", "bn_brussels", "bn_flanders", "bn_zeeland", "bn_groningen"] },
    { id: "bn_groningen", name: "フローニンゲン",    terrain: "coast",     neighbors: ["de_hanover", "bn_holland"] },
    { id: "bn_zeeland",   name: "ゼーランド",        terrain: "coast",     neighbors: ["bn_holland", "bn_flanders"] },

    // ===== ポーランド =====
    { id: "pl_masovia",      name: "マゾフシェ",    terrain: "plains",    neighbors: ["de_berlin", "de_prussia", "pl_pomerania", "pl_silesia", "pl_lesser_poland", "pl_lublin", "pl_podlaskie", "ru_baltic", "ru_belarus"] },
    { id: "pl_pomerania",    name: "ポメラニア",    terrain: "coast",     neighbors: ["de_berlin", "de_prussia", "pl_masovia", "pl_podlaskie", "sc_denmark"] },
    { id: "pl_silesia",      name: "シレジア",      terrain: "mountains", neighbors: ["de_saxony", "pl_masovia", "pl_lesser_poland", "pl_krakow", "at_bohemia", "at_moravia"] },
    { id: "pl_lesser_poland",name: "小ポーランド",  terrain: "mountains", neighbors: ["pl_masovia", "pl_silesia", "pl_krakow", "pl_lublin", "ru_ukraine", "at_galicia"] },
    { id: "pl_lublin",       name: "ルブリン",      terrain: "plains",    neighbors: ["pl_masovia", "pl_lesser_poland", "pl_krakow", "pl_podlaskie", "ru_belarus", "ru_ukraine", "at_galicia"] },
    { id: "pl_krakow",       name: "クラクフ",      terrain: "mountains", neighbors: ["pl_silesia", "pl_lesser_poland", "pl_lublin", "at_galicia", "at_bohemia"] },
    { id: "pl_podlaskie",    name: "ポドラシェ",    terrain: "forest",    neighbors: ["pl_masovia", "pl_pomerania", "pl_lublin", "ru_baltic", "ru_belarus"] },

    // ===== スカンジナビア =====
    { id: "sc_denmark",  name: "デンマーク",       terrain: "coast",     neighbors: ["de_holstein", "pl_pomerania", "sc_oslo", "sc_sweden_s", "sc_norway"] },
    { id: "sc_norway",   name: "ノルウェー",       terrain: "mountains", neighbors: ["sc_denmark", "sc_oslo", "sc_sweden_s", "sc_sweden_n", "sc_iceland"] },
    { id: "sc_oslo",     name: "オスロ",           terrain: "plains",    neighbors: ["sc_denmark", "sc_norway", "sc_sweden_s"] },
    { id: "sc_sweden_s", name: "スウェーデン南部", terrain: "forest",    neighbors: ["sc_denmark", "sc_oslo", "sc_norway", "sc_sweden_n"] },
    { id: "sc_sweden_n", name: "スウェーデン北部", terrain: "forest",    neighbors: ["sc_sweden_s", "sc_norway", "sc_lapland", "sc_finland"] },
    { id: "sc_finland",  name: "フィンランド",     terrain: "forest",    neighbors: ["sc_sweden_n", "sc_lapland", "ru_leningrad", "ru_baltic"] },
    { id: "sc_lapland",  name: "ラップランド",     terrain: "forest",    neighbors: ["sc_sweden_n", "sc_finland", "ru_leningrad"] },
    { id: "sc_iceland",  name: "アイスランド",     terrain: "coast",     neighbors: ["sc_norway"] },

    // ===== ロシア =====
    { id: "ru_moscow",       name: "モスクワ",       terrain: "plains",    neighbors: ["ru_leningrad", "ru_belarus", "ru_ukraine", "ru_volga"] },
    { id: "ru_leningrad",    name: "レニングラード", terrain: "coast",     neighbors: ["ru_moscow", "ru_belarus", "ru_baltic", "sc_finland", "sc_lapland"] },
    { id: "ru_baltic",       name: "バルト三国",     terrain: "plains",    neighbors: ["ru_leningrad", "ru_belarus", "de_prussia", "pl_masovia", "pl_podlaskie", "sc_finland"] },
    { id: "ru_belarus",      name: "ベラルーシ",     terrain: "forest",    neighbors: ["ru_moscow", "ru_leningrad", "ru_baltic", "ru_ukraine", "pl_masovia", "pl_lublin", "pl_podlaskie"] },
    { id: "ru_ukraine",      name: "ウクライナ",     terrain: "plains",    neighbors: ["ru_moscow", "ru_belarus", "ru_volga", "ru_caucasus", "pl_lesser_poland", "pl_lublin", "at_galicia", "at_transylvania", "tr_wallachia"] },
    { id: "ru_caucasus",     name: "コーカサス",     terrain: "mountains", neighbors: ["ru_ukraine", "tr_anatolia", "tr_wallachia"] },
    { id: "ru_volga",        name: "ヴォルガ",       terrain: "plains",    neighbors: ["ru_moscow", "ru_ukraine", "ru_ural"] },
    { id: "ru_ural",         name: "ウラル",         terrain: "mountains", neighbors: ["ru_volga", "ru_west_siberia", "ru_arctic"] },
    { id: "ru_west_siberia", name: "西シベリア",     terrain: "forest",    neighbors: ["ru_ural", "ru_east_siberia", "ru_arctic"] },
    { id: "ru_east_siberia", name: "東シベリア",     terrain: "mountains", neighbors: ["ru_west_siberia", "ru_far_east", "ru_arctic"] },
    { id: "ru_far_east",     name: "極東",           terrain: "mountains", neighbors: ["ru_east_siberia", "ru_arctic"] },
    { id: "ru_arctic",       name: "北極圏",         terrain: "forest",    neighbors: ["ru_ural", "ru_west_siberia", "ru_east_siberia", "ru_far_east"] },
  ],
};
