<script>
  import { gamePhase, handleKeydown } from './stores/uiStore.js';
  import { gameBridge } from './stores/gameStore.js';
  import StartScreen from './components/StartScreen.svelte';
  import LoadingScreen from './components/LoadingScreen.svelte';
  import MapCanvas from './components/MapCanvas.svelte';
  import StatusBar from './components/StatusBar.svelte';
  import ProvincePanel from './components/ProvincePanel.svelte';
  import DiplomacyPanel from './components/DiplomacyPanel.svelte';
  import CardPanel from './components/CardPanel.svelte';
  import Tooltip from './components/Tooltip.svelte';
  import VictoryScreen from './components/VictoryScreen.svelte';

  // plain JS variables — Svelte 4 legacy mode, no runes
  let mapData = null;
  let bridge = null;

  async function handleNationSelected(nationId) {
    gamePhase.set('loading');
    try {
      const geoJSON = await fetch('/europe-provinces.geojson').then(r => r.json());

      const { createEuropeProjection } = await import('./projection/Projection.js');
      const { buildMapData } = await import('./data/MapData.js');
      const { GameBridge } = await import('./engine/GameBridge.js');

      const projection = createEuropeProjection(geoJSON, 2000, 1000);
      mapData = buildMapData(geoJSON, projection, 2000, 1000);

      bridge = new GameBridge(nationId);
      bridge.initFromGeoJSON(geoJSON);
      gameBridge.set(bridge);

      gamePhase.set('playing');
    } catch (err) {
      console.error('Init failed:', err);
      gamePhase.set('start');
    }
  }
</script>

<svelte:window on:keydown={(e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  handleKeydown(e);
}} />

<div id="map-container">
  {#if $gamePhase === 'start'}
    <StartScreen onNationSelected={handleNationSelected} />
  {:else if $gamePhase === 'loading'}
    <LoadingScreen />
  {:else}
    {#if mapData && bridge}
      <MapCanvas {mapData} {bridge} />
    {/if}
    <StatusBar />
    <div id="right-sidebar">
      <DiplomacyPanel />
      <ProvincePanel />
    </div>
    <CardPanel />
    <Tooltip />
    {#if $gamePhase === 'finished'}
      <VictoryScreen />
    {/if}
  {/if}
</div>
