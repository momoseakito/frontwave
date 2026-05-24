import * as PIXI from "https://cdn.jsdelivr.net/npm/pixi.js@8/dist/pixi.min.mjs";
import { GameState, loadNationDefs } from "./GameState.js";
import { Camera } from "./input/Camera.js";
import { InputController } from "./InputController.js";
import { createEuropeProjection } from "./projection/Projection.js";
import { buildMapData } from "./data/MapData.js";
import { HitTester } from "./hit/HitTester.js";
import { PixiMapApp } from "./render/PixiMapApp.js";
import { TickDriver } from "./tickDriver.js";

const GEOJSON_URL = "../assets/europe-provinces.geojson";

// World-space dimensions. Chosen with ~2:1 aspect to match Europe's bbox so
// fitSize doesn't waste much area on letterboxing.
const WORLD_W = 2000;
const WORLD_H = 1000;
// Multiplier applied after fitSize so the playable area starts visibly large.
const INITIAL_ZOOM_BOOST = 1.6;
// Bounds used to choose the initial viewport center — independent peripheries
// like Iceland shouldn't drag the camera away from the core 6.
const FOCUS_NATIONS = ["emp", "kgd", "rep", "hol", "fed", "dch"];
// Render at half resolution and let PIXI's autoDensity upscale via CSS. Full-res
// composition lagged the pan on WSL2 and similar weak pipelines; 1/2 cuts fill
// rate by 4x while staying readable for flat-color terrain.
const RENDER_RESOLUTION = 0.5;

const canvas = document.getElementById("map");
const tooltip = document.getElementById("tooltip");
const infoPanel = document.getElementById("info-panel");
const infoName = document.getElementById("info-name");
const infoCountry = document.getElementById("info-country");
const hud = document.getElementById("hud");
const victoryEl = document.getElementById("victory");
const victoryWinner = document.getElementById("victory-winner");
const victoryMsg = document.getElementById("victory-msg");

const gameState = new GameState();
const camera = new Camera(WORLD_W, WORLD_H);
let app = null;

function focusBounds(mapData, nationIds) {
  const set = new Set(nationIds);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const rec of mapData.features) {
    if (!set.has(rec.nation)) continue;
    const [bx, by, bw, bh] = rec.bbox;
    if (bx < x0) x0 = bx;
    if (by < y0) y0 = by;
    if (bx + bw > x1) x1 = bx + bw;
    if (by + bh > y1) y1 = by + bh;
  }
  if (!Number.isFinite(x0)) return null;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

function fitMapToViewport(mapData) {
  const focus = focusBounds(mapData, FOCUS_NATIONS);
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (!focus) {
    camera.fitTo(w, h);
    return;
  }
  // Manually center on focus bbox at boosted zoom (Camera.fitTo would center
  // on the full worldW/H instead).
  const sx = w / focus.w;
  const sy = h / focus.h;
  camera.minScale = Math.min(w / WORLD_W, h / WORLD_H);
  camera.scale = Math.min(sx, sy) * INITIAL_ZOOM_BOOST;
  if (camera.scale > camera.maxScale) camera.scale = camera.maxScale;
  const cx = focus.x + focus.w / 2;
  const cy = focus.y + focus.h / 2;
  camera.tx = w / 2 - cx * camera.scale;
  camera.ty = h / 2 - cy * camera.scale;
}

function onHover(rec, screenPos) {
  if (!rec) {
    tooltip.style.display = "none";
    return;
  }
  const ownerName = gameState.getCountryName(gameState.getOwner(rec.id));
  tooltip.style.display = "block";
  tooltip.style.left = `${screenPos.x + 14}px`;
  tooltip.style.top = `${screenPos.y + 14}px`;
  tooltip.textContent = `${rec.name}（${ownerName}）`;
}

function onClick(rec) {
  gameState.selectProvince(rec?.id ?? null);
  if (gameState.selectedProvince != null && rec) {
    const ownerId = gameState.getOwner(rec.id);
    infoName.textContent = rec.name;
    infoCountry.textContent = gameState.getCountryName(ownerId);
    infoCountry.style.color = gameState.getCountryColorHex(ownerId);
    infoPanel.style.display = "block";
  } else {
    infoPanel.style.display = "none";
  }
  app.requestFrame();
}

let _toastTimer = 0;
function flashHud(msg, ms = 1800) {
  hud.textContent = msg;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => updateHUD(), ms);
}

function onRightClick(targetRec) {
  if (!targetRec) return;
  const sourceFeatureId = gameState.selectedProvince;
  if (sourceFeatureId == null) {
    flashHud("自国州を選択してから右クリック");
    return;
  }
  const sourceOwner = gameState.getOwner(sourceFeatureId);
  if (sourceOwner !== gameState.getPlayerNationId()) {
    flashHud("自国の州からしか進軍できません");
    return;
  }
  const ok = gameState.tryAttack(sourceFeatureId, targetRec.id);
  if (ok) {
    app.invalidateOwners();
    flashHud(`進軍命令 → ${targetRec.name}`);
  } else {
    flashHud("進軍できません (隣接 / 兵力 / 講和期間を確認)");
  }
}

document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const m = btn.dataset.mode;
    document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    app?.setMode(m);
  });
});

window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.minScale = Math.min(w / WORLD_W, h / WORLD_H);
  if (camera.scale < camera.minScale) camera.scale = camera.minScale;
  app?.requestFrame();
});

function formatElapsed(seconds) {
  const s = Math.floor(seconds);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function updateHUD() {
  const elapsed = gameState.engine?.elapsedSeconds ?? 0;
  hud.textContent = `t=${formatElapsed(elapsed)}  scale=${camera.scale.toFixed(2)}x  frame=${app.lastFrameMs.toFixed(1)}ms`;
}

async function init() {
  const [, geoJSON] = await Promise.all([
    loadNationDefs(),
    fetch(GEOJSON_URL).then((r) => {
      if (!r.ok) throw new Error(`Failed to load GeoJSON: ${r.status}`);
      return r.json();
    }),
  ]);
  const projection = createEuropeProjection(geoJSON, WORLD_W, WORLD_H);
  const mapData = buildMapData(geoJSON, projection, WORLD_W, WORLD_H);
  gameState.initFromGeoJSON(geoJSON);
  const hitTester = new HitTester(mapData);

  app = new PixiMapApp(PIXI, canvas, camera, mapData, gameState, { resolution: RENDER_RESOLUTION });
  await app.init();

  fitMapToViewport(mapData);

  new InputController(canvas, camera, app, hitTester, {
    onHover,
    onClick,
    onRightClick,
    onTick: updateHUD,
  });

  const driver = new TickDriver(gameState, app, {
    onTick: (next, prev) => {
      const ids = [];
      for (const s of Object.values(next.states)) {
        if (s.underAttack) {
          const fid = gameState.stateIdToFeatureId.get(s.stateId);
          if (fid != null) ids.push(fid);
        }
      }
      app.setUnderAttack(ids);

      if (next.phase === "finished" && prev.phase !== "finished") {
        const winnerName = next.winner
          ? gameState.getCountryName(next.winner)
          : "引き分け";
        victoryWinner.textContent = winnerName;
        victoryWinner.style.color = next.winner
          ? gameState.getCountryColorHex(next.winner)
          : "#94a3b8";
        victoryMsg.textContent = next.eventLog[0] ?? "";
        victoryEl.style.display = "flex";
        driver.stop();
      }
    },
  });
  driver.start();
  window.addEventListener("blur", () => driver.setPaused(true));
  window.addEventListener("focus", () => driver.setPaused(false));

  app.requestFrame();
  app.draw();
  updateHUD();
  document.getElementById("loading").style.display = "none";
}

init().catch((err) => {
  console.error(err);
  document.getElementById("loading").textContent = `エラー: ${err.message}`;
});
