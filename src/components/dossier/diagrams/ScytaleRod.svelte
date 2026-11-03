<!--
  The scytale, drawn: the grid written along the rod (one row per face, one
  column per turn of the strip) and the strip as it travels once unwound.
  Pointing at a turn highlights it in both views. Used live under the
  workbench and statically in the dossier.
-->
<script lang="ts">
  import { scytaleLayout, scytaleOrder } from '$engine/transforms/ciphers/scytale';
  import { t } from '$lib/i18n/index.svelte';

  let { text, diameter }: { text: string; diameter: number } = $props();

  const MAX = 96;
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const chars = $derived(
    [...segmenter.segment(text.slice(0, MAX * 2))].map((s) => s.segment).slice(0, MAX),
  );
  const layout = $derived(scytaleLayout(chars.length, diameter));
  const order = $derived(scytaleOrder(chars.length, diameter));
  /** Strip positions grouped by turn (column). */
  const turns = $derived(
    Array.from({ length: layout.columns }, (_, c) =>
      order.filter((k) => k % layout.columns === c).map((k) => chars[k]!),
    ),
  );
  let active = $state<number | null>(null);

  /** One handler on the figure: the turn under the pointer, wherever it is drawn. */
  function track(event: PointerEvent) {
    const turn = (event.target as Element).closest('[data-turn]')?.getAttribute('data-turn');
    active = turn === null || turn === undefined ? null : Number(turn);
  }
  const show = (ch: string | undefined) => (ch === ' ' ? '·' : (ch ?? ''));
</script>

{#if chars.length}
  <div
    class="rod-figure"
    dir="ltr"
    role="img"
    aria-label="{t('views.scytale.title')}: {t('views.scytale.turns', { n: layout.columns })}"
    onpointermove={track}
    onpointerleave={() => (active = null)}
  >
    <p class="label">{t('views.scytale.onRod')}</p>
    <div class="rod" style:--cols={layout.columns}>
      {#each { length: layout.columns } as _, c (c)}
        <div class="turn" class:odd={c % 2 === 1} class:active={active === c} data-turn={c}>
          {#each { length: layout.rows } as _, r (r)}
            {@const k = r * layout.columns + c}
            <span class="cell" class:blank={k >= chars.length}>{show(chars[k])}</span>
          {/each}
        </div>
      {/each}
    </div>

    <p class="label">{t('views.scytale.offRod')}</p>
    <div class="strip">
      {#each turns as letters, c (c)}
        <span class="segment" class:odd={c % 2 === 1} class:active={active === c} data-turn={c}>
          {#each letters as ch, i (i)}<span class="cell">{show(ch)}</span>{/each}
        </span>
      {/each}
    </div>
    <p class="hint">{t('views.scytale.hint')}</p>
  </div>
{:else}
  <p class="empty">{t('views.scytale.empty')}</p>
{/if}

<style>
  .rod-figure {
    display: grid;
    gap: var(--space-2);
    min-inline-size: 0;
  }

  .label {
    color: var(--text-3);
    font-size: var(--text-xs);
    font-weight: 600;
  }

  .label:not(:first-child) {
    margin-block-start: var(--space-3);
  }

  /* The staff: a rounded body with the strip's turns drawn as slanted bands. */
  .rod {
    position: relative;
    display: grid;
    grid-template-columns: repeat(var(--cols), minmax(1.6rem, 1fr));
    overflow-x: auto;
    padding: 0.4rem 0.6rem;
    border-radius: 999px / 1.4rem;
    background: var(--surface-3);
    box-shadow:
      inset 0 0.35rem 0.6rem -0.4rem oklch(1 0 0 / 0.5),
      inset 0 -0.45rem 0.7rem -0.4rem oklch(0.2 0.02 60 / 0.25);
  }

  .turn {
    position: relative;
    display: grid;
    justify-items: center;
    padding-block: 0.1rem;
    cursor: default;
  }

  .turn::before,
  .segment::before {
    content: '';
    position: absolute;
    inset: 0 1px;
    z-index: 0;
    border-radius: 3px;
    background: var(--surface-1);
    transform: skewX(-14deg);
    transition: background var(--fast) var(--ease);
  }

  .turn.odd::before,
  .segment.odd::before {
    background: color-mix(in srgb, var(--surface-1) 70%, var(--rubric-soft));
  }

  .turn.active::before,
  .segment.active::before {
    background: var(--accent-soft);
    box-shadow: inset 0 0 0 1px var(--accent-line);
  }

  .cell {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
    min-inline-size: 1.4rem;
    block-size: 1.7rem;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text);
  }

  .cell.blank {
    color: transparent;
  }

  .active .cell {
    color: var(--accent);
  }

  .strip {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
  }

  .segment {
    position: relative;
    display: inline-flex;
    padding-inline: 0.2rem;
  }

  .hint,
  .empty {
    color: var(--text-3);
    font-size: var(--text-sm);
  }

  .hint {
    margin-block-start: var(--space-2);
  }
</style>
