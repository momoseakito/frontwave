<script>
  import { engineState } from '../stores/gameStore.js';
  import { speedState, setSpeed } from '../stores/uiStore.js';

  $: elapsed = $engineState?.elapsedSeconds ?? 0;
  $: gold = $engineState ? Math.floor($engineState.playerFunds) : 0;
  $: paused = $speedState.paused;
  $: speed = $speedState.speed;

  function fmt(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }
</script>

<div id="top-left-controls">
  <div id="speed-controls">
    <button class="speed-btn" class:active={paused} data-speed="0" title="一時停止 [Space]"
      on:click={() => setSpeed(0)}>⏸</button>
    <button class="speed-btn" class:active={!paused && speed === 1} data-speed="1" title="通常速度 [1]"
      on:click={() => setSpeed(1)}>1×</button>
    <button class="speed-btn" class:active={!paused && speed === 2} data-speed="2" title="2倍速 [2]"
      on:click={() => setSpeed(2)}>2×</button>
    <button class="speed-btn" class:active={!paused && speed === 4} data-speed="4" title="4倍速 [3]"
      on:click={() => setSpeed(4)}>4×</button>
  </div>
</div>

<div id="hud">
  {paused ? '⏸ PAUSE' : `▶ ${speed}×`}
  &nbsp;|&nbsp;
  {fmt(elapsed)}
  &nbsp;|&nbsp;
  💰 {gold}g
</div>
