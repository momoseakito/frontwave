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
// Padding around the projected bbox at the most-zoomed-out level.
const VIEWPORT_MARGIN = 0.05;
// Render at half resolution and let PIXI's autoDensity upscale via CSS. Full-res
// composition lagged the pan on WSL2 and similar weak pipelines; 1/2 cuts fill
// rate by 4x while staying readable for flat-color terrain.
const RENDER_RESOLUTION = 0.5;

const canvas = document.getElementById("map");
const tooltip = document.getElementById("tooltip");
const infoPanel = document.getElementById("info-panel");
const infoName = document.getElementById("info-name");
const infoCountry = document.getElementById("info-country");
const infoTroops = document.getElementById("info-troops");
const infoTroopsBar = document.getElementById("info-troops-bar");
const infoTerrain = document.getElementById("info-terrain");
const infoIndustry = document.getElementById("info-industry");
const infoNeighbors = document.getElementById("info-neighbors");
const infoUpgrade = document.getElementById("info-upgrade");
const infoUpgradeRemain = document.getElementById("info-upgrade-remain");
const infoUpgradeBar = document.getElementById("info-upgrade-bar");
const infoAttack = document.getElementById("info-attack");
const infoAttacker = document.getElementById("info-attacker");
const infoUpgradeBtn = document.getElementById("info-upgrade-btn");
const infoUpgradeCost = document.getElementById("info-upgrade-cost");
const infoUpgradeTime = document.getElementById("info-upgrade-time");
const diplomacyPanel = document.getElementById("diplomacy-panel");
const diplomacyRows = document.getElementById("diplomacy-rows");
const hud = document.getElementById("hud");
const victoryEl = document.getElementById("victory");
const victoryWinner = document.getElementById("victory-winner");
const victoryMsg = document.getElementById("victory-msg");

const TERRAIN_JP = {
  plains: "平原",
  mountains: "山岳",
  coast: "沿岸",
  forest: "森林",
  capital: "首都",
};

const camera = new Camera(WORLD_W, WORLD_H);
let gameState = null;   // chosen after start-screen
let app = null;
let mapDataRef = null;  // held so resize can refit to the same bbox
const PLAYABLE_NATIONS = ["emp", "kgd", "rep", "hol", "fed", "dch"];

function worldBounds(features) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const rec of features) {
    const [bx, by, bw, bh] = rec.bbox;
    if (bx < x0) x0 = bx;
    if (by < y0) y0 = by;
    if (bx + bw > x1) x1 = bx + bw;
    if (by + bh > y1) y1 = by + bh;
  }
  if (!Number.isFinite(x0)) return null;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

// Fit the full feature bbox into the window and lock that as minScale, so the
// initial view is the most-zoomed-out state and the wheel can only zoom in.
function fitMapToViewport(mapData) {
  const b = worldBounds(mapData.features);
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (!b) {
    camera.fitTo(w, h);
    return;
  }
  const bw = b.w * (1 + 2 * VIEWPORT_MARGIN);
  const bh = b.h * (1 + 2 * VIEWPORT_MARGIN);
  const fit = Math.min(w / bw, h / bh);
  camera.minScale = fit;
  camera.scale = fit;
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  camera.tx = w / 2 - cx * fit;
  camera.ty = h / 2 - cy * fit;
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

function refreshInfoPanel() {
  const fid = gameState.selectedProvince;
  if (fid == null) {
    infoPanel.style.display = "none";
    return;
  }
  const info = gameState.getProvinceInfo(fid);
  if (!info) {
    infoPanel.style.display = "none";
    return;
  }
  infoName.textContent = info.name;
  infoCountry.textContent = gameState.getCountryName(info.ownerId);
  infoCountry.style.color = gameState.getCountryColorHex(info.ownerId);
  infoTroops.textContent = `${info.troops} / ${info.maxTroops}`;
  infoTroopsBar.style.width = `${Math.min(100, (info.troops / info.maxTroops) * 100)}%`;
  infoTerrain.textContent = TERRAIN_JP[info.terrain] ?? info.terrain;
  infoIndustry.textContent = `Lv. ${info.industryLevel}${info.isCapital ? " (首都)" : ""}`;
  infoNeighbors.textContent = `${info.neighborCount}`;

  if (info.upgradeInProgress) {
    infoUpgrade.style.display = "block";
    infoUpgradeRemain.textContent = info.upgradeRemain.toFixed(0);
    infoUpgradeBar.style.width = `${info.upgradeProgress * 100}%`;
  } else {
    infoUpgrade.style.display = "none";
  }

  if (info.underAttack && info.attackerId) {
    infoAttack.style.display = "block";
    infoAttacker.textContent = gameState.getCountryName(info.attackerId);
    infoAttacker.style.color = gameState.getCountryColorHex(info.attackerId);
  } else {
    infoAttack.style.display = "none";
  }

  // Upgrade button: own province, not capped at Lv5, not already upgrading,
  // and we have the gold. startUpgrade in the engine enforces this too but the
  // disabled state needs a hint locally.
  const isOwn = info.ownerId === gameState.getPlayerNationId();
  const canShow = isOwn && info.nextCost != null;
  if (canShow) {
    infoUpgradeBtn.style.display = "block";
    infoUpgradeCost.textContent = info.nextCost;
    infoUpgradeTime.textContent = info.nextDuration;
    const haveGold = gameState.getPlayerFunds() >= info.nextCost;
    infoUpgradeBtn.disabled = info.upgradeInProgress || !haveGold;
    infoUpgradeBtn.textContent = info.upgradeInProgress
      ? "開発中…"
      : `開発 Lv${info.nextLevel}: ${info.nextCost}g / ${info.nextDuration}s`;
  } else {
    infoUpgradeBtn.style.display = "none";
  }

  infoPanel.style.display = "block";
}

const STATUS_LABEL = { peaceful: "平和", ally: "同盟", war: "戦争" };

function dipAction(label, cls, fn) {
  const b = document.createElement("button");
  b.textContent = label;
  if (cls) b.classList.add(cls);
  b.addEventListener("click", fn);
  return b;
}

let _lastDipKey = "";
function refreshDiplomacyPanel(force = false) {
  if (!gameState) return;
  const rows = gameState.getDiplomacySnapshot();
  const key = rows
    .map((r) => `${r.id}:${r.status}:${r.isAlive ? 1 : 0}:${r.incomingProposalId ?? ""}:${r.outgoingProposalId ?? ""}`)
    .join("|");
  if (!force && key === _lastDipKey) return;
  _lastDipKey = key;
  diplomacyRows.replaceChildren();
  for (const r of rows) {
    const row = document.createElement("div");
    row.className = "dip-row";

    const sw = document.createElement("span");
    sw.className = "swatch";
    sw.style.background = r.color;
    row.appendChild(sw);

    const nm = document.createElement("span");
    nm.className = "name";
    nm.textContent = r.name;
    row.appendChild(nm);

    const st = document.createElement("span");
    if (!r.isAlive) {
      st.className = "status dead";
      st.textContent = "滅亡";
      row.appendChild(st);
      diplomacyRows.appendChild(row);
      continue;
    }
    st.className = `status ${r.status}`;
    st.textContent = STATUS_LABEL[r.status] ?? r.status;
    row.appendChild(st);

    const actions = document.createElement("div");
    actions.className = "actions";

    if (r.incomingProposalId) {
      // Accept / reject from this nation.
      actions.appendChild(dipAction("受諾", "accept", () => {
        const ok = gameState.tryAcceptAlliance(r.id);
        flashHud(ok ? `${r.name}と同盟成立` : "同盟成立できません");
        refreshDiplomacyPanel();
      }));
      actions.appendChild(dipAction("拒否", "reject", () => {
        const ok = gameState.tryRejectAlliance(r.id);
        flashHud(ok ? `${r.name}の提案を拒否` : "拒否できません");
        refreshDiplomacyPanel();
      }));
      row.classList.add("full");
    } else if (r.status === "peaceful") {
      if (!r.outgoingProposalId) {
        actions.appendChild(dipAction("同盟", null, () => {
          const ok = gameState.tryProposeAlliance(r.id);
          flashHud(ok ? `${r.name}に同盟を提案` : "提案できません");
          refreshDiplomacyPanel();
        }));
      }
      actions.appendChild(dipAction("宣戦", "reject", () => {
        const ok = gameState.tryDeclareWar(r.id);
        flashHud(ok ? `${r.name}に宣戦布告` : "宣戦できません");
        refreshDiplomacyPanel();
      }));
    } else if (r.status === "ally") {
      actions.appendChild(dipAction("破棄", "reject", () => {
        const ok = gameState.tryBreakAlliance(r.id);
        flashHud(ok ? `${r.name}との同盟を破棄` : "破棄できません");
        refreshDiplomacyPanel();
      }));
    }
    // war: no actions available from engine API

    row.appendChild(actions);
    diplomacyRows.appendChild(row);
  }
  diplomacyPanel.style.display = "block";
}

infoUpgradeBtn?.addEventListener("click", () => {
  const fid = gameState?.selectedProvince;
  if (fid == null) return;
  const ok = gameState.tryStartUpgrade(fid);
  if (ok) {
    refreshInfoPanel();
    app.requestFrame();
    flashHud("開発を開始しました");
  } else {
    flashHud("開発できません (条件を満たしません)");
  }
});

function onClick(rec) {
  gameState.selectProvince(rec?.id ?? null);
  refreshInfoPanel();
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
  if (!mapDataRef) return;
  const b = worldBounds(mapDataRef.features);
  if (!b) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const bw = b.w * (1 + 2 * VIEWPORT_MARGIN);
  const bh = b.h * (1 + 2 * VIEWPORT_MARGIN);
  const fit = Math.min(w / bw, h / bh);
  camera.minScale = fit;
  if (camera.scale < camera.minScale) {
    camera.scale = camera.minScale;
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    camera.tx = w / 2 - cx * camera.scale;
    camera.ty = h / 2 - cy * camera.scale;
  }
  app?.requestFrame();
});

function hexStringToNumber(hex) {
  if (typeof hex !== "string") return 0x64748b;
  const s = hex.startsWith("#") ? hex.slice(1) : hex;
  const n = parseInt(s, 16);
  return Number.isFinite(n) ? n : 0x64748b;
}

function formatElapsed(seconds) {
  const s = Math.floor(seconds);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function updateHUD() {
  const elapsed = gameState?.engine?.elapsedSeconds ?? 0;
  const frameMs = app?.lastFrameMs ?? 0;
  const gold = gameState?.getPlayerFunds() ?? 0;
  hud.textContent = `t=${formatElapsed(elapsed)}  gold=${gold}  scale=${camera.scale.toFixed(2)}x  frame=${frameMs.toFixed(1)}ms`;
}

async function init(playerNationId) {
  document.getElementById("loading").style.display = "flex";
  const [, geoJSON] = await Promise.all([
    loadNationDefs(),
    fetch(GEOJSON_URL).then((r) => {
      if (!r.ok) throw new Error(`Failed to load GeoJSON: ${r.status}`);
      return r.json();
    }),
  ]);
  const projection = createEuropeProjection(geoJSON, WORLD_W, WORLD_H);
  const mapData = buildMapData(geoJSON, projection, WORLD_W, WORLD_H);
  mapDataRef = mapData;
  gameState = new GameState(playerNationId);
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

      const arrows = [];
      for (const atk of next.ongoingAttacks) {
        const sFid = gameState.stateIdToFeatureId.get(atk.sourceStateId);
        const tFid = gameState.stateIdToFeatureId.get(atk.targetStateId);
        if (sFid == null || tFid == null) continue;
        const hex = gameState.getCountryColorHex(atk.attackerId);
        arrows.push({
          sourceFeatureId: sFid,
          targetFeatureId: tFid,
          color: hexStringToNumber(hex),
        });
      }
      app.setArrows(arrows);

      // Selected province's troops / upgrade / attacker can change every tick.
      if (gameState.selectedProvince != null) refreshInfoPanel();
      refreshDiplomacyPanel();

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

  refreshDiplomacyPanel(true);
  app.requestFrame();
  app.draw();
  updateHUD();
  document.getElementById("loading").style.display = "none";
}

async function showStartScreen() {
  // nation-defs.json is the canonical name/color source; load early so the
  // start screen can render buttons without instantiating GameState yet.
  const defs = await loadNationDefs();
  const grid = document.getElementById("nation-grid");
  for (const id of PLAYABLE_NATIONS) {
    const d = defs[id];
    if (!d) continue;
    const btn = document.createElement("button");
    btn.className = "nation-btn";
    btn.style.borderColor = d.color;
    btn.innerHTML = `
      <div class="swatch" style="background:${d.color}"></div>
      <div class="nm">${d.name}</div>
      <div class="id">${id}</div>
    `;
    btn.addEventListener("click", () => {
      document.getElementById("start-screen").style.display = "none";
      init(id).catch((err) => {
        console.error(err);
        document.getElementById("loading").textContent = `エラー: ${err.message}`;
      });
    });
    grid.appendChild(btn);
  }
}

showStartScreen().catch((err) => {
  console.error(err);
  document.getElementById("start-screen").innerHTML = `<p style="color:#f87171">エラー: ${err.message}</p>`;
});
