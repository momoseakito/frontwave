#!/usr/bin/env node
// Build assets/europe-provinces.geojson by dissolving Natural Earth admin-1
// features according to assets/admin1-mapping.yaml.
//
// Usage:
//   node tools/build-provinces.mjs [--source <path>] [--out <path>]
// Defaults:
//   source: /tmp/ne_10m_admin1/europe_admin1.geojson  (run mapshaper to produce this first)
//   out:    assets/europe-provinces.geojson

import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = parseArgs(process.argv.slice(2));
const SOURCE = args.source ?? "/tmp/ne_10m_admin1/europe_admin1.geojson";
const MAPPING = args.mapping ?? "assets/admin1-mapping.yaml";
const OUT = args.out ?? "assets/europe-provinces.geojson";

const mapping = parseMappingYaml(readFileSync(MAPPING, "utf8"));
console.log(`loaded ${Object.keys(mapping).length} province mappings from ${MAPPING}`);

// iso_3166_2 -> { id, name, nation } reverse index for fast lookup inside mapshaper -each
const reverse = {};
for (const [id, def] of Object.entries(mapping)) {
  for (const iso of def.admin1) {
    if (reverse[iso]) {
      console.warn(`warning: ${iso} mapped to both ${reverse[iso].id} and ${id}`);
    }
    reverse[iso] = { id, name: def.name, nation: def.nation };
  }
}

// mapshaper -each runs in a sandbox without `require`. Inline the lookup table
// directly into the expression instead.
const tmp = mkdtempSync(join(tmpdir(), "provbuild-"));
const eachExpr = `
  var map = ${JSON.stringify(reverse)};
  var hit = map[iso_3166_2];
  if (hit) {
    province_id = hit.id;
    province_nation = hit.nation;
    province_name = hit.name;
  } else {
    province_id = null;
    province_nation = null;
    province_name = null;
  }
`;

const cmd = [
  "mapshaper",
  quote(SOURCE),
  "-each", quote(eachExpr),
  "-filter", quote("province_id != null"),
  "-dissolve2", "province_id", "copy-fields=province_nation,province_name",
  "-rename-fields", "id=province_id,nation=province_nation,name=province_name",
  "-simplify", "5%", "keep-shapes", "weighted",
  "-o", `format=geojson`, quote(OUT),
].join(" ");

console.log(`running mapshaper with ${Object.keys(reverse).length} admin1 mappings`);
try {
  const out = execSync(cmd, { encoding: "utf8" });
  process.stdout.write(out);
} catch (e) {
  if (e.stdout) process.stdout.write(String(e.stdout));
  if (e.stderr) process.stderr.write(String(e.stderr));
  process.exit(1);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

// Validate output
const out = JSON.parse(readFileSync(OUT, "utf8"));
const built = new Set(out.features.map((f) => f.properties.id));
const expected = new Set(Object.keys(mapping));
const missing = [...expected].filter((id) => !built.has(id));
const extra = [...built].filter((id) => !expected.has(id));
console.log(`\nbuilt ${out.features.length} features (${built.size} unique ids)`);
if (missing.length) console.log(`missing: ${missing.join(", ")}`);
if (extra.length) console.log(`unexpected: ${extra.join(", ")}`);
if (!missing.length && !extra.length) console.log("OK: all mapped provinces are present");

// ---- helpers ----

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      out[argv[i].slice(2)] = argv[i + 1];
      i++;
    }
  }
  return out;
}

function quote(s) {
  // Single-quote for shell; escape any embedded single-quotes.
  return `'${String(s).replace(/'/g, "'\\''")}'`;
}

// Minimal YAML parser for our schema:
//   <id>:
//     name: <str>
//     nation: <str>
//     admin1: ["A", "B"]
function parseMappingYaml(text) {
  const out = {};
  let current = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trimEnd();
    if (!line.trim()) continue;
    const top = line.match(/^([A-Za-z_][\w]*):\s*$/);
    if (top) {
      current = { id: top[1] };
      out[current.id] = { name: "", nation: "", admin1: [] };
      continue;
    }
    const kv = line.match(/^\s+([a-z0-9_]+):\s*(.+)$/i);
    if (kv && current) {
      const [, key, valueRaw] = kv;
      if (key === "admin1") {
        const arr = valueRaw.match(/\[(.*)\]/);
        if (!arr) throw new Error(`bad admin1 list at ${current.id}: ${valueRaw}`);
        out[current.id].admin1 = arr[1]
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
      } else {
        out[current.id][key] = valueRaw.trim().replace(/^["']|["']$/g, "");
      }
    }
  }
  return out;
}
