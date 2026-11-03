<!--
  Draws one of Eleet's tool glyphs (see $lib/ui/glyphs). Decorative by default:
  the tool's name is always present as text next to it.
-->
<script lang="ts">
  import { glyphFor } from '$lib/ui/glyphs';

  let {
    id,
    size = '1em',
    class: className = '',
  }: { id: string; size?: string; class?: string } = $props();
  const shapes = $derived(glyphFor(id));
</script>

<svg
  class="glyph {className}"
  viewBox="0 0 24 24"
  width={size}
  height={size}
  aria-hidden="true"
  focusable="false"
>
  {#each shapes as shape, i (i)}
    {#if 'd' in shape}
      <path d={shape.d} class:solid={shape.fill} />
    {:else}
      <circle cx={shape.c[0]} cy={shape.c[1]} r={shape.c[2]} class:solid={shape.fill} />
    {/if}
  {/each}
</svg>

<style>
  .glyph {
    flex: none;
    fill: none;
    stroke: currentColor;
    stroke-width: var(--glyph-stroke, 1.5);
    stroke-linecap: round;
    stroke-linejoin: round;
    overflow: visible;
  }

  .solid {
    fill: currentColor;
    stroke: none;
  }
</style>
