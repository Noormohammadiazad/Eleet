<!--
  Vail's principle: letters in order of English frequency with their Morse
  signals, drawn as dots and dashes so the lengths can be compared at a glance.
-->
<script lang="ts">
  import { MORSE_LATIN } from '$engine/transforms/codes/morse';
  import { i18n } from '$lib/i18n/index.svelte';

  /** English letter frequencies, per cent (typical published values). */
  const FREQUENCY: readonly [string, number][] = [
    ['E', 12.7],
    ['T', 9.1],
    ['A', 8.2],
    ['O', 7.5],
    ['I', 7.0],
    ['N', 6.7],
    ['S', 6.3],
    ['H', 6.1],
    ['R', 6.0],
    ['D', 4.3],
    ['L', 4.0],
    ['C', 2.8],
    ['U', 2.8],
    ['M', 2.4],
    ['W', 2.4],
    ['F', 2.2],
    ['G', 2.0],
    ['Y', 2.0],
    ['P', 1.9],
    ['B', 1.5],
    ['V', 1.0],
    ['K', 0.8],
    ['J', 0.15],
    ['X', 0.15],
    ['Q', 0.1],
    ['Z', 0.07],
  ];
  const UNIT = 6;
  const width = (code: string) =>
    [...code].reduce((w, s) => w + (s === '.' ? UNIT : UNIT * 3) + UNIT, -UNIT);
</script>

<ol class="morse" dir="ltr">
  {#each FREQUENCY as [letter, share] (letter)}
    {@const code = MORSE_LATIN[letter] ?? ''}
    <li>
      <span class="letter">{letter}</span>
      <svg
        class="signal"
        viewBox="0 0 {width(code)} 6"
        width={width(code)}
        height="6"
        aria-label={code}
      >
        {#each [...code] as symbol, i (i)}
          {@const x = [...code]
            .slice(0, i)
            .reduce((w, s) => w + (s === '.' ? UNIT : UNIT * 3) + UNIT, 0)}
          {#if symbol === '.'}
            <circle cx={x + UNIT / 2} cy="3" r="2.6" />
          {:else}
            <rect {x} y="0.5" width={UNIT * 3} height="5" rx="2.5" />
          {/if}
        {/each}
      </svg>
      <span class="share">{i18n.number(share, { maximumFractionDigits: 2 })}%</span>
    </li>
  {/each}
</ol>

<style>
  .morse {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
    gap: 0.15rem var(--space-4);
    padding: 0;
    list-style: none;
  }

  li {
    display: grid;
    grid-template-columns: 1.4rem 1fr auto;
    align-items: center;
    gap: var(--space-2);
    padding-block: 0.2rem;
    border-block-end: 1px solid var(--border);
  }

  .letter {
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    font-weight: 600;
  }

  .signal {
    fill: var(--text);
  }

  li:nth-child(-n + 2) .signal {
    fill: var(--rubric);
  }

  .share {
    color: var(--text-3);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
  }
</style>
