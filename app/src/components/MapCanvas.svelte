<script>
  import { onMount, onDestroy } from 'svelte';
  import { Camera } from '../input/Camera.js';
  import { PixiMapApp } from '../render/PixiMapApp.js';
  import { InputController } from '../InputController.js';
  import { HitTester } from '../hit/HitTester.js';
  import { TickDriver } from '../engine/TickDriver.js';
  import { gameBridge, notifyEngineUpdate } from '../stores/gameStore.js';
  import { selectedProvinceId, tooltipState, speedState, gamePhase } from '../stores/uiStore.js';
  import { cameraRef, pixiAppRef, driverRef } from '../stores/mapStore.js';
  import { get } from 'svelte/store';

  export let mapData;
  export let bridge;

  const WORLD_W = 2000;
  const WORLD_H = 1000;
  const VIEWPORT_MARGIN = 0.05;
  const RENDER_RESOLUTION = 0.5;

  let canvasEl;
  let troopLabelsEl;
  let pixiApp;

  function worldBounds(features) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const rec of features) {
      const [bx, by, bw, bh] = rec.bbox;
      if (bx < x0) x0 = bx;
      if (by < y0) y0 = by;
      if (bx + bw > x1) x1 = bx + bw;
      if (by + bh > y1) y1 = by + bh;
    }
    return Number.isFinite(x0) ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
  }

  function fitMapToViewport(camera) {
    const b = worldBounds(mapData.features);
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.screenW = w;
    camera.screenH = h;
    if (!b) { camera.fitTo(w, h); return; }
    camera.mapBounds = b;
    const fit = Math.min(w / (b.w * (1 + 2 * VIEWPORT_MARGIN)), h / (b.h * (1 + 2 * VIEWPORT_MARGIN)));
    camera.minScale = fit;
    camera.scale = fit;
    camera.tx = w / 2 - (b.x + b.w / 2) * fit;
    camera.ty = h / 2 - (b.y + b.h / 2) * fit;
  }

  function focusOnNation(camera, nationId) {
    const features = mapData.features.filter(f => f.nation === nationId);
    if (!features.length) return;
    const b = worldBounds(features);
    if (!b) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.screenW = w;
    camera.screenH = h;
    const fit = Math.min(w / (b.w * (1 + 2 * VIEWPORT_MARGIN)), h / (b.h * (1 + 2 * VIEWPORT_MARGIN)));
    camera.scale = Math.max(fit, camera.minScale);
    camera.tx = w / 2 - (b.x + b.w / 2) * camera.scale;
    camera.ty = h / 2 - (b.y + b.h / 2) * camera.scale;
  }

  function hexStringToNumber(hex) {
    if (typeof hex !== 'string') return 0x64748b;
    const s = hex.startsWith('#') ? hex.slice(1) : hex;
    const n = parseInt(s, 16);
    return Number.isFinite(n) ? n : 0x64748b;
  }

  function handleHover(rec, screenPos) {
    if (!rec) {
      tooltipState.set({ visible: false, x: 0, y: 0, text: '' });
      return;
    }
    const b = get(gameBridge);
    const ownerName = b.getCountryName(b.getOwner(rec.id));
    tooltipState.set({ visible: true, x: screenPos.x + 14, y: screenPos.y + 14,
                       text: `${rec.name}（${ownerName}）` });
  }

  function handleClick(rec) {
    const id = rec?.id ?? null;
    selectedProvinceId.set(id);
    bridge.selectProvince(id);
    get(pixiAppRef)?.requestFrame();
  }

  function handleRightClick(targetRec) {
    if (!targetRec) return;
    const sourceId = get(selectedProvinceId);
    if (sourceId == null) return;
    const ok = bridge.tryAttack(sourceId, targetRec.id);
    if (ok) {
      notifyEngineUpdate(bridge);
      get(pixiAppRef)?.invalidateOwners();
    }
  }

  onMount(async () => {
    const camera = new Camera(WORLD_W, WORLD_H);
    cameraRef.set(camera);

    pixiApp = new PixiMapApp(canvasEl, camera, mapData, bridge, {
      resolution: RENDER_RESOLUTION,
      troopLabelContainer: troopLabelsEl,
    });
    await pixiApp.init();
    pixiAppRef.set(pixiApp);

    fitMapToViewport(camera);
    focusOnNation(camera, bridge.getPlayerNationId());

    const hitTester = new HitTester(mapData);

    new InputController(canvasEl, camera, pixiApp, hitTester, {
      onHover: handleHover,
      onClick: handleClick,
      onRightClick: handleRightClick,
      onTick: () => {},
    });

    const driver = new TickDriver(bridge, pixiApp, {
      onTick: (next, prev) => {
        const ids = [];
        for (const s of Object.values(next.states)) {
          if (s.underAttack) {
            const fid = bridge.stateIdToFeatureId.get(s.stateId);
            if (fid != null) ids.push(fid);
          }
        }
        pixiApp.setUnderAttack(ids);

        const arrows = [];
        for (const atk of next.ongoingAttacks) {
          const sFid = bridge.stateIdToFeatureId.get(atk.sourceStateId);
          const tFid = bridge.stateIdToFeatureId.get(atk.targetStateId);
          if (sFid == null || tFid == null) continue;
          arrows.push({
            sourceFeatureId: sFid,
            targetFeatureId: tFid,
            color: hexStringToNumber(bridge.getCountryColorHex(atk.attackerId)),
          });
        }
        pixiApp.setArrows(arrows);

        notifyEngineUpdate(bridge);

        if (next.phase === 'finished' && prev.phase !== 'finished') {
          gamePhase.set('finished');
          driver.stop();
        }
      },
    });
    driverRef.set(driver);
    driver.start();
    speedState.set({ paused: false, speed: 1 });

    pixiApp.requestFrame();
    pixiApp.draw();
  });

  onDestroy(() => {
    get(driverRef)?.stop();
    pixiApp?._app?.destroy(true);
  });

  function handleResize() {
    const camera = get(cameraRef);
    if (!camera) return;
    const b = worldBounds(mapData.features);
    if (!b) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.screenW = w;
    camera.screenH = h;
    const fit = Math.min(w / (b.w * (1 + 2 * VIEWPORT_MARGIN)), h / (b.h * (1 + 2 * VIEWPORT_MARGIN)));
    camera.minScale = fit;
    if (camera.scale < camera.minScale) {
      camera.scale = camera.minScale;
      camera.tx = w / 2 - (b.x + b.w / 2) * camera.scale;
      camera.ty = h / 2 - (b.y + b.h / 2) * camera.scale;
    }
    get(pixiAppRef)?.requestFrame();
  }
</script>

<svelte:window on:resize={handleResize} />

<canvas bind:this={canvasEl} id="map"></canvas>
<div bind:this={troopLabelsEl} id="troop-labels"></div>
