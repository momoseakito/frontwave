#!/usr/bin/env node
// Extract nation id/name/color from src/nations/*.ts and emit assets/nation-defs.json.
// The demo/ ESM bundle reads this JSON directly so it doesn't have to import the
// engine's CJS dist build.

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const NATIONS_DIR = resolve(__dirname, "../src/nations");
const OUT = resolve(__dirname, "../../../assets/nation-defs.json");

const defs = {};
for (const f of readdirSync(NATIONS_DIR)) {
  if (!f.endsWith(".ts")) continue;
  const src = readFileSync(join(NATIONS_DIR, f), "utf8");
  const id = src.match(/id:\s*"([^"]+)"/)?.[1];
  const name = src.match(/name:\s*"([^"]+)"/)?.[1];
  const color = src.match(/color:\s*"([^"]+)"/)?.[1];
  if (!id || !name || !color) {
    console.warn(`skipped ${f}: missing id/name/color`);
    continue;
  }
  defs[id] = { name, color };
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(defs, null, 2) + "\n");
console.log(`wrote ${Object.keys(defs).length} nation defs to ${OUT}`);
for (const [id, d] of Object.entries(defs)) console.log(`  ${id} -> ${d.name} (${d.color})`);
