<script>
  import { engineState, gameBridge } from '../stores/gameStore.js';
  import { get } from 'svelte/store';

  $: winner = $engineState?.winner ?? null;
  $: winnerName = winner ? get(gameBridge)?.getCountryName(winner) : '—';
  $: msg = $engineState?.eventLog?.[0] ?? '';
</script>

<div id="victory" style="display:flex;">
  <div class="label">Victory</div>
  <div class="winner">{winnerName}</div>
  {#if msg}
    <div class="msg">{msg}</div>
  {/if}
</div>
