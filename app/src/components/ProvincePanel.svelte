<script>
  import { engineState, gameBridge, doStartUpgrade } from '../stores/gameStore.js';
  import { selectedProvinceId } from '../stores/uiStore.js';
  import { pixiAppRef } from '../stores/mapStore.js';
  import { get } from 'svelte/store';

  $: info = ($selectedProvinceId != null && $engineState)
    ? get(gameBridge)?.getProvinceInfo($selectedProvinceId)
    : null;

  $: troopPct = info ? Math.round((info.troops / info.maxTroops) * 100) : 0;
  $: upgradePct = info ? Math.round(info.upgradeProgress * 100) : 0;
  $: canUpgrade = info && !info.upgradeInProgress && info.nextCost != null
    && ($engineState?.playerFunds ?? 0) >= info.nextCost
    && info.ownerId === get(gameBridge)?.getPlayerNationId();

  function handleUpgrade() {
    const ok = doStartUpgrade($selectedProvinceId);
    if (ok) get(pixiAppRef)?.requestFrame();
  }
</script>

{#if info}
  <div id="info-panel" style="display:block;">
    <h3>選択中の州</h3>
    <div id="info-name">{info.name}</div>
    <div id="info-country" style="color:{get(gameBridge)?.getCountryColorHex(info.ownerId) ?? '#fff'}">
      {get(gameBridge)?.getCountryName(info.ownerId) ?? '—'}
    </div>
    <div class="row"><span class="k">兵力</span><span>{info.troops} / {info.maxTroops}</span></div>
    <div class="bar troop-bar"><span style="width:{troopPct}%"></span></div>
    <div class="row"><span class="k">地形</span><span>{info.terrain}</span></div>
    <div class="row"><span class="k">産業Lv</span><span>Lv. {info.industryLevel}{info.isCapital ? ' (首都)' : ''}</span></div>
    <div class="row"><span class="k">隣接</span><span>{info.neighborCount}</span></div>

    {#if info.upgradeInProgress}
      <div class="upgrade">
        <div>開発中… 残り {Math.ceil(info.upgradeRemain)}s</div>
        <div class="bar"><span style="width:{upgradePct}%"></span></div>
      </div>
    {/if}

    {#if info.underAttack && info.attackerId}
      <div class="attack">攻撃中: {get(gameBridge)?.getCountryName(info.attackerId) ?? info.attackerId}</div>
    {/if}

    {#if info.nextCost != null && !info.upgradeInProgress}
      <button class="upgrade-btn" disabled={!canUpgrade} on:click={handleUpgrade}>
        開発 Lv{info.nextLevel}: {info.nextCost}g / {info.nextDuration}s
      </button>
    {/if}
  </div>
{/if}
