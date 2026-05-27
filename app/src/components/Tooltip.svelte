<script>
  import { tooltipState } from '../stores/uiStore.js';
</script>

{#if $tooltipState.visible}
  <div
    id="tooltip"
    style="left:{$tooltipState.x}px; top:{$tooltipState.y}px; display:block;"
  >
    {$tooltipState.text}
  </div>
{/if}
