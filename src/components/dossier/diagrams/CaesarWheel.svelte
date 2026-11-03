<!-- Two concentric alphabet rings: the plain alphabet outside, the shifted one inside. -->
<script lang="ts">
  let { shift = 3 }: { shift?: number } = $props();

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const at = (i: number, r: number) => {
    const angle = (i / 26) * 2 * Math.PI - Math.PI / 2;
    return { x: 160 + r * Math.cos(angle), y: 160 + r * Math.sin(angle) };
  };
</script>

<svg class="wheel" viewBox="0 0 320 320" role="img" aria-label="A→D, B→E, C→F …">
  <circle class="ring" cx="160" cy="160" r="150" />
  <circle class="ring" cx="160" cy="160" r="118" />
  <circle class="ring inner" cx="160" cy="160" r="86" />
  {#each LETTERS as letter, i (letter)}
    {@const outer = at(i, 134)}
    {@const inner = at(i, 102)}
    {@const tick = at(i, 118)}
    {@const tick2 = at(i, 123)}
    <line class="tick" x1={tick.x} y1={tick.y} x2={tick2.x} y2={tick2.y} />
    <text class="plain" class:hot={i < 3} x={outer.x} y={outer.y}>{letter}</text>
    <text class="cipher" class:hot={i < 3} x={inner.x} y={inner.y}>{LETTERS[(i + shift) % 26]}</text
    >
  {/each}
  <text class="key" x="160" y="152">+{shift}</text>
  <text class="key-label" x="160" y="176">A → D</text>
</svg>

<style>
  .wheel {
    direction: ltr;
    inline-size: 100%;
    max-inline-size: 22rem;
    margin-inline: auto;
  }

  .ring {
    fill: none;
    stroke: var(--border-strong);
    stroke-width: 1;
  }

  .ring.inner {
    fill: var(--surface-2);
  }

  .tick {
    stroke: var(--border-strong);
  }

  text {
    text-anchor: middle;
    dominant-baseline: central;
    font-family: var(--font-mono);
    font-size: 15px;
    font-weight: 600;
  }

  .plain {
    fill: var(--text);
  }

  .cipher {
    fill: var(--text-2);
  }

  .hot {
    fill: var(--rubric);
  }

  .key {
    font-family: var(--font-serif);
    font-size: 34px;
    font-weight: 500;
    fill: var(--text);
  }

  .key-label {
    font-size: 12px;
    font-weight: 500;
    fill: var(--text-3);
  }
</style>
