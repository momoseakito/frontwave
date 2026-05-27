<script>
  import { engineState, gameBridge, doDeclareWar, doProposeAlliance, doAcceptAlliance, doRejectAlliance, doBreakAlliance } from '../stores/gameStore.js';
  import { get } from 'svelte/store';

  $: rows = $engineState ? get(gameBridge)?.getDiplomacySnapshot() ?? [] : [];
</script>

{#if rows.length > 0}
  <div id="diplomacy-panel">
    <h3>外交</h3>
    <div id="diplomacy-rows">
      {#each rows as row}
        <div class="dip-row full">
          <div class="swatch" style="background:{row.color}"></div>
          <div class="name">{row.name}</div>
          <div class="status {row.isAlive ? row.status : 'dead'}">
            {row.isAlive ? (row.status === 'peaceful' ? '平和' : row.status === 'ally' ? '同盟' : '戦争') : '滅亡'}
          </div>
          {#if row.isAlive}
            <div class="actions">
              {#if row.incomingProposalId}
                <button class="accept" on:click={() => doAcceptAlliance(row.id)}>受諾</button>
                <button class="reject" on:click={() => doRejectAlliance(row.id)}>拒否</button>
              {:else if row.status === 'peaceful' && !row.outgoingProposalId}
                <button on:click={() => doProposeAlliance(row.id)}>同盟提案</button>
                <button on:click={() => doDeclareWar(row.id)}>宣戦</button>
              {:else if row.status === 'ally'}
                <button on:click={() => doBreakAlliance(row.id)}>同盟破棄</button>
                <button on:click={() => doDeclareWar(row.id)}>宣戦</button>
              {:else if row.outgoingProposalId}
                <span style="font-size:10px;color:#64748b;">提案中…</span>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}
