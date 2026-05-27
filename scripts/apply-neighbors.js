#!/usr/bin/env node
/**
 * generate-neighbors.js の出力を元に、各 nation ファイルの neighbors を更新する。
 * 使用方法: node scripts/apply-neighbors.js
 */

const fs = require("fs");
const path = require("path");

const GENERATED = JSON.parse(
  fs.readFileSync(path.join(__dirname, "neighbors-output.json"), "utf-8")
);

const NATION_FILES = [
  path.join(__dirname, "../packages/game-engine/src/nations/empire.ts"),
  path.join(__dirname, "../packages/game-engine/src/nations/kingdom.ts"),
  path.join(__dirname, "../packages/game-engine/src/nations/federation.ts"),
  path.join(__dirname, "../packages/game-engine/src/nations/duchy.ts"),
  path.join(__dirname, "../packages/game-engine/src/nations/republic.ts"),
  path.join(__dirname, "../packages/game-engine/src/nations/holykingdom.ts"),
];

for (const filePath of NATION_FILES) {
  let src = fs.readFileSync(filePath, "utf-8");

  // neighbors: ["..."] を置換する
  // パターン: neighbors: ["a", "b", ...] (複数行にまたがる可能性あり)
  src = src.replace(
    /\{ id: "([^"]+)"([^}]*?)neighbors: \[([^\]]*)\]([^}]*?)\}/gs,
    (match, stateId, before, _oldNeighbors, after) => {
      const newNeighbors = GENERATED[stateId];
      if (!newNeighbors) {
        // GeoJSON に存在しない州（海峡経由のみでアクセスする島嶼など）はそのまま
        return match;
      }
      const neighborsStr = newNeighbors.map((n) => `"${n}"`).join(", ");
      return `{ id: "${stateId}"${before}neighbors: [${neighborsStr}]${after}}`;
    }
  );

  fs.writeFileSync(filePath, src, "utf-8");
  console.log("更新:", path.basename(filePath));
}

console.log("完了");
