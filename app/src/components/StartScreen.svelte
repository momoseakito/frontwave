<script>
  import { onMount } from 'svelte';

  export let onNationSelected;

  const PLAYABLE_NATIONS = ['emp', 'kgd', 'rep', 'hol', 'fed', 'dch'];
  let nationDefs = {};

  onMount(async () => {
    const res = await fetch('/nation-defs.json');
    nationDefs = await res.json();
  });
</script>

<div id="start-screen">
  <h1>FrontWave</h1>
  <p>プレイする国を選択してください</p>
  <div id="nation-grid">
    {#each PLAYABLE_NATIONS as id}
      {#if nationDefs[id]}
        <button
          class="nation-btn"
          style="border-color:{nationDefs[id].color}"
          on:click={() => onNationSelected(id)}
        >
          <div class="swatch" style="background:{nationDefs[id].color}"></div>
          <div class="nm">{nationDefs[id].name}</div>
          <div class="id">{id}</div>
        </button>
      {/if}
    {/each}
  </div>
</div>
