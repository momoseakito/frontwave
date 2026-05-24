# europe-provinces.geojson 再構築計画

## 背景

現行 `assets/europe-provinces.geojson` は次の不整合がある:

- 設計書 ([docs/設計書.md](設計書.md)) は **6 ヶ国 74 州** だが、GeoJSON は 11 ヶ国 95 州 (`gb/pl/ru/at/bn` は設計外)
- `tr_egypt` がモロッコ〜エジプトまでの北アフリカ全域を 1 ポリゴンで占有
- `ru_leningrad` がフィンランド〜ウラルまでを 1 つの MultiPolygon で占有
- 描画順で巨大ポリゴンが他州を覆い隠し、主要 6 ヶ国の州がほぼ見えない

`packages/game-engine/src/nations/` と `packages/game-engine/src/map.ts` の state 定義に完全準拠した GeoJSON に置換する。

## 対象データ

- 元データ: Natural Earth `ne_10m_admin_1_states_provinces`
- 抽出済み: 欧州+地中海 51 ヶ国 1863 admin-1 (一覧は [admin1-europe.md](admin1-europe.md))
- 中間ファイル: `/tmp/ne_10m_admin1/europe_admin1.geojson` (21MB、欧州抽出済み)

## 出力先 game-engine 州

合計 **74 州** (内訳):

| 国 ID | 名称 | 州数 | ファイル |
|---|---|---:|---|
| emp | 帝国 | 13 | [empire.ts](../packages/game-engine/src/nations/empire.ts) |
| kgd | 王国 | 12 | [kingdom.ts](../packages/game-engine/src/nations/kingdom.ts) |
| fed | 連邦 | 10 | [federation.ts](../packages/game-engine/src/nations/federation.ts) |
| rep | 共和国 | 10 | [republic.ts](../packages/game-engine/src/nations/republic.ts) |
| hol | 聖王国 | 10 | [holykingdom.ts](../packages/game-engine/src/nations/holykingdom.ts) |
| dch | 公国 | 9 | [duchy.ts](../packages/game-engine/src/nations/duchy.ts) |
| neutral | 中立 | 10 | [map.ts](../packages/game-engine/src/map.ts) (`NEUTRAL_STATES`) |

## 作業フロー

### 1. マッピング YAML を作る (人手)

`assets/admin1-mapping.yaml` に「game-engine の州 ID → Natural Earth admin-1 の集合」を書く。**`iso_3166_2` フィールドをキーにする** ことで mapshaper の dissolve がそのまま使える。

例:

```yaml
# 帝国 (emp): ドイツ + 一部周辺国
emp_capital:
  name: 皇帝都
  nation: emp
  admin1: ["DE-BE"]            # Berlin (首都)
emp_bavaria:
  name: バイエルン
  nation: emp
  admin1: ["DE-BY"]            # Bayern
emp_swabia:
  name: シュヴァーベン
  nation: emp
  admin1: ["DE-BW"]            # Baden-Württemberg
emp_brabant:
  name: ブラバント
  nation: emp
  admin1: ["BE-VAN", "BE-VBR", "BE-VOV", "BE-VWV", "BE-VLI"]  # フランドル 5 県
# ... 以下 74 州
```

割当ルール:

- **首都 (`*_capital`)**: 各国の現実の首都に置く (例: emp_capital=Berlin, kgd_capital=Île-de-France)
- **複数 admin-1 をまとめる**: 1 つの game-engine 州を実県の複数集合に対応させる (例: emp_brabant = フランドル 5 県)
- **架空名 (西辺境州/聖王国首都など)** は隣接関係 (neighbors) と合うよう適当に近接 admin-1 を割り当てる
- **島嶼や海峡州** (hol_morocco, hol_palermo, fed_iceland 等) は対応する島を直接当てる
- **中立州** (neu_rhine, neu_alps 等) は隣接国の境界に位置する admin-1 を 1〜数個まとめる

このマッピングは判断量が多いので、6 ヶ国 + 中立に分けて段階的にドラフトする。

### 2. dissolve 用スクリプト

`tools/build-provinces.mjs` (新規) を作る:

1. `admin1-mapping.yaml` を読む
2. `/tmp/ne_10m_admin1/europe_admin1.geojson` を読む
3. 各 game-engine 州について、対応する admin-1 features を集めて `nation/id/name` を上書き
4. mapshaper API (Node) で nation+id ごとに `-dissolve2 id` してジオメトリ統合
5. `assets/europe-provinces.geojson` に書き出す

mapshaper CLI 単体でも書ける:

```bash
mapshaper /tmp/ne_10m_admin1/europe_admin1.geojson \
  -each '
    var map = require("./assets/admin1-mapping.json");
    var hit = null;
    for (var k in map) {
      if (map[k].admin1.indexOf(iso_3166_2) > -1) { hit = k; break; }
    }
    province_id = hit;
    nation = hit ? map[hit].nation : null;
    name = hit ? map[hit].name : null;
  ' \
  -filter 'province_id != null' \
  -dissolve2 province_id copy-fields=nation,name \
  -rename-fields id=province_id \
  -o format=geojson assets/europe-provinces.geojson
```

(YAML→JSON 変換ステップを 1 つ挟む)

### 3. 検証

生成後:

- 全 74 州 ID が GeoJSON 内に存在するか (engine 側の `STATES_DEF` と突合)
- 各 feature の properties が `{id, name, nation}` の形式か
- ブラウザで [demo/index.html](../demo/index.html) を開き、6 ヶ国が色分けされて中央に収まることを確認
- `packages/game-engine/src/map.ts` の `validateNeighborGraph()` が空配列を返すか (隣接整合性)

### 4. 後始末

- 生成済み `assets/europe-provinces.geojson` をコミット
- `assets/admin1-mapping.yaml` もリポジトリに含める (将来の修正用)
- `docs/admin1-europe.md` は中間資料として残す or 削除
- `tools/build-provinces.mjs` は `package.json` の script に登録 (`pnpm build:map`)

## 次の作業 (このプランの後)

1. このプランへのレビュー
2. 1-1 から順に着手 — まず **帝国 (emp) 13 州のマッピング YAML をドラフト**してブラウザで確認、問題なければ残り 5 ヶ国 + 中立に展開
