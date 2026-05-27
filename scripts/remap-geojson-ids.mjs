/**
 * GeoJSONのポリゴンIDを入れ替えることで、ポリゴンの地理的位置と
 * ゲームエンジンの隣接定義を整合させるスクリプト。
 *
 * 問題: rep_*(共和国)ポリゴンがドイツ中部(lat≈50)に配置されており、
 *       バルカンの dch_*(公国)から遠すぎるため攻撃矢印が飛び越えて見える。
 *       hol_*(聖王国)ポリゴンはイタリア半島(lat≈44)に正しく配置されている。
 *
 * 解決: rep_* と hol_* のポリゴン間でIDを入れ替え、
 *       共和国がイタリア北部に来るようにする。
 *
 * 使い方:
 *   node scripts/remap-geojson-ids.mjs           # dry-run（変更内容を表示）
 *   node scripts/remap-geojson-ids.mjs --apply   # GeoJSONを実際に書き換え
 */

import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const GEOJSON_PATH = join(__dirname, '../app/public/europe-provinces.geojson');
const { STATES_DEF } = require('../packages/game-engine/dist/map.js');

const DRY_RUN = !process.argv.includes('--apply');

// --- ユーティリティ ---

function centroid(feat) {
  const coords = feat.geometry.coordinates;
  const pts = feat.geometry.type === 'Polygon' ? coords[0] : coords[0][0];
  const x = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const y = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return [x, y];
}

function dist([ax, ay], [bx, by]) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

// --- GeoJSON 読み込み ---

const geojson = JSON.parse(readFileSync(GEOJSON_PATH, 'utf-8'));
const byId = {};
for (const f of geojson.features) byId[f.properties.id] = f;

// --- 入れ替えペア定義 ---
// [現在GeoJSONにあるID_A, 現在GeoJSONにあるID_B]
// → A のポリゴンに B のID・nation を付ける（A の形状を B として扱う）
// → B のポリゴンに A のID・nation を付ける（B の形状を A として扱う）
//
// 判断根拠：
//   - rep_venice(14,50)↔hol_veneto(12,46): ヴェネツィア/ヴェネトは同一地域
//   - rep_piedmont(11,49)↔hol_piedmont(8,45): 同名（ピエモンテ）
//   - rep_lombardy(12,51)↔hol_lombardy(9.8,46): 同名（ロンバルディア）
//   - rep_tuscany(9,49)↔hol_tuscany_n(11,44): 同名（トスカーナ）
//   - rep_calabria(17,49)↔hol_calabria_s(15,41): 同名（カラブリア）
//   - rep_romagna(15,50)↔hol_emilia(11.5,44): ロマーニャ/エミリア（隣接地域）
//   - rep_naples(9,53)↔hol_lazio(12.8,42): ナポリ/ラツィオ（南イタリア方向）
//   - rep_friuli(11,54)↔hol_apulia(16.7,41): フリウリ/プーリア（東部沿岸）
//   - rep_capital(13,53)↔hol_capital(15,48): 両国首都を対応する位置に
//   - rep_genoa(8,51)↔hol_navarre(12.6,47): ジェノヴァ/ナバラ（余った対）

const SWAP_PAIRS = [
  ['rep_venice',   'hol_veneto'],
  ['rep_piedmont', 'hol_piedmont'],
  ['rep_lombardy', 'hol_lombardy'],
  ['rep_tuscany',  'hol_tuscany_n'],
  ['rep_calabria', 'hol_calabria_s'],
  ['rep_romagna',  'hol_emilia'],
  ['rep_naples',   'hol_lazio'],
  ['rep_friuli',   'hol_apulia'],
  ['rep_capital',  'hol_capital'],
  ['rep_genoa',    'hol_navarre'],
];

// --- dry-run レポート ---

console.log(`\n=== GeoJSON IDリマッピング (${DRY_RUN ? 'DRY-RUN' : 'APPLY'}) ===\n`);
console.log('入れ替えペア（AのポリゴンにBのIDを、BのポリゴンにAのIDを付ける）:\n');

for (const [a, b] of SWAP_PAIRS) {
  const fa = byId[a];
  const fb = byId[b];
  if (!fa) { console.log(`  ❌ ${a} がGeoJSONに存在しません`); continue; }
  if (!fb) { console.log(`  ❌ ${b} がGeoJSONに存在しません`); continue; }
  const ca = centroid(fa);
  const cb = centroid(fb);
  console.log(`  ${a.padEnd(20)} (${ca[0].toFixed(1)},${ca[1].toFixed(1)}) ↔ ${b.padEnd(20)} (${cb[0].toFixed(1)},${cb[1].toFixed(1)})`);
}

// --- バリデーション（入れ替え後の状態で確認） ---

// エンジン州IDセット
const engineIds = new Set(STATES_DEF.map(s => s.id));

// 入れ替え後のID→centroid マップ
const geoById = {};
for (const f of geojson.features) geoById[f.properties.id] = centroid(f);
const newGeo = { ...geoById };
for (const [a, b] of SWAP_PAIRS) {
  if (geoById[a] && geoById[b]) {
    newGeo[a] = geoById[b];
    newGeo[b] = geoById[a];
  }
}

// 重要な隣接ペアの距離チェック
const CHECK_PAIRS = [
  ['rep_venice', 'dch_croatia'],
  ['rep_venice', 'neu_adriatic'],
  ['rep_venice', 'rep_friuli'],
  ['rep_friuli', 'dch_croatia'],
  ['rep_capital', 'rep_lombardy'],
  ['rep_capital', 'rep_venice'],
  ['hol_veneto', 'neu_adriatic'],
  ['hol_capital', 'hol_veneto'],
  ['hol_capital', 'hol_lombardy'],
];

console.log('\n=== 入れ替え後の隣接ペア距離 ===');
for (const [a, b] of CHECK_PAIRS) {
  const ca = newGeo[a];
  const cb = newGeo[b];
  if (!ca || !cb) { console.log(`  ? ${a} <-> ${b}: ポリゴンなし`); continue; }
  const d = dist(ca, cb);
  const mark = d > 12 ? '⚠' : '✓';
  console.log(`  ${mark} ${a.padEnd(25)} <-> ${b.padEnd(25)} dist=${d.toFixed(1)}`);
}

// --- 適用 ---

if (!DRY_RUN) {
  for (const [a, b] of SWAP_PAIRS) {
    const fa = byId[a];
    const fb = byId[b];
    if (!fa || !fb) continue;

    // ID と nation を交換
    const tmpId = fa.properties.id;
    const tmpNation = fa.properties.nation;
    fa.properties.id = fb.properties.id;
    fa.properties.nation = fb.properties.nation;
    fb.properties.id = tmpId;
    fb.properties.nation = tmpNation;
  }

  // 最終バリデーション
  console.log('\n=== 適用後バリデーション ===');
  const ids = geojson.features.map(f => f.properties.id);

  // 重複チェック
  const idCount = {};
  for (const id of ids) idCount[id] = (idCount[id] ?? 0) + 1;
  const dups = Object.entries(idCount).filter(([, n]) => n > 1);
  if (dups.length > 0) {
    console.log(`❌ 重複ID: ${dups.map(([id]) => id).join(', ')}`);
  } else {
    console.log('✓ 重複IDなし');
  }

  // エンジン未定義IDチェック
  const unknown = ids.filter(id => !engineIds.has(id));
  if (unknown.length > 0) {
    console.log(`❌ エンジン未定義ID: ${[...new Set(unknown)].join(', ')}`);
  } else {
    console.log('✓ 全IDがエンジンに存在');
  }

  // nation prefix 一致チェック
  const mismatches = geojson.features.filter(f => {
    const prefix = f.properties.id.split('_')[0];
    return prefix !== 'neu' && prefix !== f.properties.nation;
  });
  if (mismatches.length > 0) {
    console.log(`❌ nation prefix 不一致: ${mismatches.map(f => f.properties.id).join(', ')}`);
  } else {
    console.log('✓ nation prefix 一致');
  }

  writeFileSync(GEOJSON_PATH, JSON.stringify(geojson, null, 2), 'utf-8');
  console.log(`\n✓ ${GEOJSON_PATH} を更新しました（${SWAP_PAIRS.length * 2} 件の変更）\n`);
} else {
  console.log(`\n--apply を付けて実行すると GeoJSON を更新します。\n`);
}
