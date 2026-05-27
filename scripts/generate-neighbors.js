#!/usr/bin/env node
/**
 * GeoJSON のポリゴン境界共有から隣接 neighbors を自動生成するスクリプト。
 * 使用方法: node scripts/generate-neighbors.js
 *
 * 出力: 各州の id と生成された neighbors の JSON を stdout に出力。
 */

const fs = require("fs");
const path = require("path");

const GEOJSON_PATH = path.join(__dirname, "../app/public/europe-provinces.geojson");
// 2頂点が「近い」とみなす距離しきい値（GeoJSON座標系の度数単位）
const THRESHOLD = 0.12;
// 隣接判定に必要な近傍点数の最小値
const MIN_SHARED_POINTS = 2;

const geojson = JSON.parse(fs.readFileSync(GEOJSON_PATH, "utf-8"));

/** ポリゴンの全頂点を平坦なリストで返す */
function extractPoints(geometry) {
  const points = [];
  function traverse(coords) {
    if (typeof coords[0] === "number") {
      points.push(coords);
    } else {
      coords.forEach(traverse);
    }
  }
  traverse(geometry.coordinates);
  return points;
}

/** 2点間の距離 */
function dist(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 2つのポリゴンが境界を共有しているか判定。
 * featA の頂点と featB の頂点が THRESHOLD 以内の距離にある点の数が
 * MIN_SHARED_POINTS 以上あれば隣接と見なす。
 */
function sharesBoundary(pointsA, pointsB) {
  let count = 0;
  // グリッドベースで高速化: B の点を bucket に入れる
  const bucket = new Map();
  const cellSize = THRESHOLD;
  for (const p of pointsB) {
    const cx = Math.floor(p[0] / cellSize);
    const cy = Math.floor(p[1] / cellSize);
    const key = `${cx},${cy}`;
    if (!bucket.has(key)) bucket.set(key, []);
    bucket.get(key).push(p);
  }

  for (const a of pointsA) {
    const cx = Math.floor(a[0] / cellSize);
    const cy = Math.floor(a[1] / cellSize);
    // 隣接セルも検索
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cx + dx},${cy + dy}`;
        const cell = bucket.get(key);
        if (!cell) continue;
        for (const b of cell) {
          if (dist(a, b) <= THRESHOLD) {
            count++;
            if (count >= MIN_SHARED_POINTS) return true;
          }
        }
      }
    }
  }
  return false;
}

// 各 feature の points を事前計算
const features = geojson.features
  .filter((f) => f.properties?.id)
  .map((f) => ({
    id: f.properties.id,
    nation: f.properties.nation,
    name: f.properties.name,
    points: extractPoints(f.geometry),
  }));

console.error(`州数: ${features.length}`);
console.error(`しきい値: ${THRESHOLD}, 最小共有点数: ${MIN_SHARED_POINTS}`);

// 全ペアの隣接判定
const adjacencyMap = new Map();
for (const f of features) {
  adjacencyMap.set(f.id, new Set());
}

const total = features.length;
for (let i = 0; i < total; i++) {
  const fa = features[i];
  for (let j = i + 1; j < total; j++) {
    const fb = features[j];
    if (sharesBoundary(fa.points, fb.points)) {
      adjacencyMap.get(fa.id).add(fb.id);
      adjacencyMap.get(fb.id).add(fa.id);
    }
  }
  if ((i + 1) % 20 === 0) {
    process.stderr.write(`進捗: ${i + 1}/${total}\n`);
  }
}

// 結果を出力
const result = {};
for (const [id, neighbors] of adjacencyMap) {
  result[id] = [...neighbors].sort();
}

console.log(JSON.stringify(result, null, 2));
console.error("完了");
