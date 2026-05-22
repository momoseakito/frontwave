import { ProvinceMap } from "./ProvinceMap.js";
import { Renderer } from "./Renderer.js";
import { GameState } from "./GameState.js";

const GEOJSON_URL = "../assets/europe-provinces.geojson";

const canvas = document.getElementById("map");
const tooltip = document.getElementById("tooltip");
const infoPanel = document.getElementById("info-panel");
const infoName = document.getElementById("info-name");
const infoCountry = document.getElementById("info-country");

const provinceMap = new ProvinceMap();
const gameState = new GameState();
const renderer = new Renderer(canvas);

let currentMode = "political";

function getCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (canvas.width / rect.width),
    y: (e.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function renderMap() {
  renderer.render(provinceMap, gameState, currentMode);
}

canvas.addEventListener("mousemove", (e) => {
  const { x, y } = getCanvasCoords(e);
  const pid = provinceMap.getProvinceId(x, y);

  if (pid) {
    const props = provinceMap.getFeatureByProvinceId(pid);
    const ownerName = gameState.getCountryName(gameState.getOwner(pid));
    tooltip.style.display = "block";
    tooltip.style.left = `${e.clientX + 14}px`;
    tooltip.style.top = `${e.clientY + 14}px`;
    tooltip.textContent = `${props.name}（${ownerName}）`;
  } else {
    tooltip.style.display = "none";
  }
});

canvas.addEventListener("mouseleave", () => {
  tooltip.style.display = "none";
});

canvas.addEventListener("click", (e) => {
  const { x, y } = getCanvasCoords(e);
  const pid = provinceMap.getProvinceId(x, y);

  gameState.selectProvince(pid ?? null);

  if (pid && gameState.selectedProvince !== null) {
    const props = provinceMap.getFeatureByProvinceId(pid);
    const ownerId = gameState.getOwner(pid);
    const ownerName = gameState.getCountryName(ownerId);
    infoName.textContent = props.name;
    infoCountry.textContent = ownerName;
    const [r, g, b] = gameState.getCountryColor(ownerId);
    infoCountry.style.color = `rgb(${r},${g},${b})`;
    infoPanel.style.display = "block";
  } else {
    infoPanel.style.display = "none";
  }

  renderMap();
});

document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentMode = btn.dataset.mode;
    document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderMap();
  });
});

async function init() {
  const res = await fetch(GEOJSON_URL);
  if (!res.ok) throw new Error(`Failed to load GeoJSON: ${res.status}`);
  const geoJSON = await res.json();

  provinceMap.build(geoJSON, canvas.width, canvas.height);
  gameState.initFromGeoJSON(geoJSON);
  renderMap();

  document.getElementById("loading").style.display = "none";
}

init().catch((err) => {
  console.error(err);
  document.getElementById("loading").textContent = `エラー: ${err.message}`;
});
