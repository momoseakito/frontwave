<script>
  import { engineState } from '../stores/gameStore.js';

  $: hand = $engineState?.playerHand ?? [];
  $: draftPending = $engineState?.cardDraftPending ?? false;
  $: draftChoices = $engineState?.cardDraftChoices ?? [];
  $: visible = hand.length > 0 || draftPending;
</script>

{#if visible}
  <div id="card-panel">
    {#if draftPending}
      <div class="draft-header">カードを選択してください</div>
      <div class="card-row">
        {#each draftChoices as card}
          <div class="card draft-card">
            <div class="card-name">{card.definitionId}</div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="card-row">
        {#each hand as card}
          <div class="card">
            <div class="card-name">{card.definitionId}</div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  #card-panel {
    position: absolute;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 10px 14px;
    z-index: 10;
  }
  .draft-header { font-size: 12px; color: #facc15; margin-bottom: 8px; text-align: center; }
  .card-row { display: flex; gap: 8px; }
  .card {
    width: 80px; min-height: 110px;
    background: rgba(30, 41, 59, 0.95);
    border: 1px solid #475569;
    border-radius: 6px; padding: 8px 6px;
    font-size: 11px; color: #e2e8f0;
    cursor: pointer; transition: border-color 0.1s, transform 0.1s;
  }
  .card:hover { border-color: #facc15; transform: translateY(-4px); }
  .draft-card { border-color: #facc15; }
  .card-name { font-size: 10px; color: #94a3b8; word-break: break-all; }
</style>
