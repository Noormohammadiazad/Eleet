<!--
  Frequency analysis report: a verdict, key statistics, an A–Z column chart of
  observed letter frequency against the English reference (with hover
  tooltips and an equivalent data table for screen readers), n-gram lists and,
  for polyalphabetic text, a key-length estimate.
-->
<script lang="ts">
  import ChartColumn from '@lucide/svelte/icons/chart-column';
  import Gauge from '@lucide/svelte/icons/gauge';
  import KeyRound from '@lucide/svelte/icons/key-round';
  import type { FrequencyReport } from '$engine/analysis/frequency';
  import { ENGLISH_IOC } from '$engine/analysis/stats';
  import { i18n, t } from '$lib/i18n/index.svelte';

  let { report }: { report: FrequencyReport } = $props();

  const BAND = 28;
  const H = 180;
  const PAD = { top: 12, right: 8, bottom: 26, left: 36 };
  const W = PAD.left + PAD.right + BAND * 26;

  const max = $derived(Math.max(5, ...report.letters.map((l) => Math.max(l.percent, l.expected))));
  const step = $derived(max > 20 ? 10 : max > 10 ? 5 : 2.5);
  const top = $derived(Math.ceil(max / step) * step);
  const ticks = $derived(Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step));
  const y = (v: number) => PAD.top + (H - PAD.top - PAD.bottom) * (1 - v / top);
  const x = (i: number) => PAD.left + i * BAND + BAND / 2;

  /** Column with a 4px rounded data-end, square at the baseline. */
  function column(i: number, value: number): string {
    const w = 14;
    const x0 = x(i) - w / 2;
    const base = y(0);
    const tip = y(value);
    const r = Math.min(4, (base - tip) / 2);
    if (base - tip < 0.5) return '';
    return `M${x0},${base}V${tip + r}Q${x0},${tip} ${x0 + r},${tip}H${x0 + w - r}Q${x0 + w},${tip} ${x0 + w},${tip + r}V${base}Z`;
  }

  let hover = $state<number | null>(null);
  const fmt = (n: number, digits = 1) =>
    i18n.number(n, { maximumFractionDigits: digits, minimumFractionDigits: 0 });

  const keyMax = $derived(Math.max(ENGLISH_IOC, ...report.keyLengths.map((k) => k.ioc)));
  const bestKey = $derived(
    report.keyLengths.length
      ? report.keyLengths.reduce((a, b) => (b.ioc > a.ioc + 0.004 ? b : a)).length
      : null,
  );
</script>

<div class="report">
  <section class="panel verdict verdict-{report.verdict}" aria-labelledby="verdict-title">
    <Gauge aria-hidden="true" />
    <div>
      <h2 class="caps" id="verdict-title">{t('views.frequency.verdictTitle')}</h2>
      <p>{i18n.tr(`views.frequency.verdict.${report.verdict}`)}</p>
    </div>
  </section>

  <dl class="stat-grid">
    <div class="stat">
      <dt>{t('views.frequency.totalLetters')}</dt>
      <dd>{i18n.number(report.totalLetters)}</dd>
    </div>
    <div class="stat">
      <dt>{t('views.frequency.ioc')}</dt>
      <dd>{fmt(report.ioc, 4)}</dd>
    </div>
    <div class="stat">
      <dt>{t('views.frequency.chi')}</dt>
      <dd>{Number.isFinite(report.chiSquared) ? fmt(report.chiSquared, 0) : '—'}</dd>
    </div>
    <div class="stat">
      <dt>{t('views.frequency.entropy')}</dt>
      <dd>{t('views.frequency.bitsPerChar', { n: Number(report.entropy.toFixed(2)) })}</dd>
    </div>
    <div class="stat">
      <dt>{t('views.frequency.fitness')}</dt>
      <dd>{fmt(report.fitness, 2)}</dd>
    </div>
  </dl>

  {#if report.totalLetters}
    <section class="panel" aria-labelledby="freq-chart">
      <header class="panel-header">
        <h2 class="panel-title" id="freq-chart">
          <ChartColumn aria-hidden="true" />{t('views.frequency.letters')}
        </h2>
        <div class="legend" aria-hidden="true">
          <span><i class="swatch bar"></i>{t('views.frequency.observed')}</span>
          <span><i class="swatch ref"></i>{t('views.frequency.expected')}</span>
        </div>
      </header>
      <div class="chart" dir="ltr">
        <svg
          viewBox="0 0 {W} {H}"
          role="img"
          aria-labelledby="freq-chart"
          onmouseleave={() => (hover = null)}
        >
          {#each ticks as tick (tick)}
            <line class="grid" x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} />
            <text
              class="axis"
              x={PAD.left - 6}
              y={y(tick)}
              text-anchor="end"
              dominant-baseline="middle">{tick}%</text
            >
          {/each}
          {#each report.letters as letter, i (letter.letter)}
            <g class="band" class:dim={hover !== null && hover !== i}>
              <path class="bar" d={column(i, letter.percent)} />
              <line
                class="ref"
                x1={x(i) - 10}
                x2={x(i) + 10}
                y1={y(letter.expected)}
                y2={y(letter.expected)}
              />
              <text class="axis letter" x={x(i)} y={H - 8} text-anchor="middle"
                >{letter.letter}</text
              >
              <rect
                class="hit"
                x={x(i) - BAND / 2}
                y={PAD.top}
                width={BAND}
                height={H - PAD.top}
                role="presentation"
                onmouseenter={() => (hover = i)}
              />
            </g>
          {/each}
        </svg>
        {#if hover !== null}
          {@const l = report.letters[hover]!}
          <div class="tooltip" style:inset-inline-start="{(x(hover) / W) * 100}%">
            <strong>{l.letter}</strong>
            <span
              ><i class="swatch bar"></i>{t('views.frequency.observed')}: {fmt(l.percent)}% ({i18n.number(
                l.count,
              )})</span
            >
            <span
              ><i class="swatch ref"></i>{t('views.frequency.expected')}: {fmt(l.expected)}%</span
            >
          </div>
        {/if}
      </div>
      <table class="visually-hidden">
        <caption>{t('views.frequency.letters')}</caption>
        <thead
          ><tr
            ><th scope="col">A–Z</th><th scope="col">{t('views.frequency.observed')}</th><th
              scope="col">{t('views.frequency.expected')}</th
            ></tr
          ></thead
        >
        <tbody>
          {#each report.letters as l (l.letter)}
            <tr
              ><th scope="row">{l.letter}</th><td>{fmt(l.percent)}%</td><td>{fmt(l.expected)}%</td
              ></tr
            >
          {/each}
        </tbody>
      </table>
    </section>
  {/if}

  <div class="columns">
    {#if report.bigrams.length}
      <section class="panel list-panel">
        <h3 class="caps">{t('views.frequency.bigrams')}</h3>
        <ul class="grams" role="list" dir="ltr">
          {#each report.bigrams as g (g.gram)}<li>
              <span class="mono">{g.gram}</span><span class="n">{i18n.number(g.count)}</span>
            </li>{/each}
        </ul>
      </section>
    {/if}
    {#if report.trigrams.length}
      <section class="panel list-panel">
        <h3 class="caps">{t('views.frequency.trigrams')}</h3>
        <ul class="grams" role="list" dir="ltr">
          {#each report.trigrams as g (g.gram)}<li>
              <span class="mono">{g.gram}</span><span class="n">{i18n.number(g.count)}</span>
            </li>{/each}
        </ul>
      </section>
    {/if}
    {#if report.characters.length}
      <section class="panel list-panel">
        <h3 class="caps">{t('views.frequency.characters')}</h3>
        <ul class="grams chars" role="list">
          {#each report.characters.slice(0, 18) as c (c.char)}
            <li><span class="glyph">{c.char}</span><span class="n">{fmt(c.percent)}%</span></li>
          {/each}
        </ul>
      </section>
    {/if}
  </div>

  {#if report.keyLengths.length}
    <section class="panel" aria-labelledby="key-lengths">
      <header class="panel-header">
        <h2 class="panel-title" id="key-lengths">
          <KeyRound aria-hidden="true" />{t('views.frequency.keyLengths')}
        </h2>
      </header>
      <ol class="periods" role="list">
        {#each report.keyLengths as k (k.length)}
          <li class:best={k.length === bestKey}>
            <span class="period mono">{i18n.number(k.length)}</span>
            <span class="meter"><span style:inline-size="{(k.ioc / keyMax) * 100}%"></span></span>
            <span class="val mono">{fmt(k.ioc, 3)}</span>
          </li>
        {/each}
      </ol>
    </section>
  {/if}
</div>

<style>
  .report {
    display: grid;
    gap: var(--space-4);
  }

  .verdict {
    display: flex;
    gap: var(--space-3);
    padding: var(--space-4);
    border-inline-start: 4px solid var(--accent-2);
  }

  .verdict :global(svg) {
    inline-size: 1.4rem;
    block-size: 1.4rem;
    flex: none;
    color: var(--accent-2);
  }

  .verdict-english,
  .verdict-english :global(svg) {
    border-inline-start-color: var(--accent);
    color: inherit;
  }

  .verdict-english :global(svg) {
    color: var(--accent);
  }

  .verdict p {
    margin-block-start: 0.2rem;
  }

  .legend {
    display: flex;
    gap: var(--space-4);
    color: var(--text-2);
    font-size: var(--text-xs);
  }

  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .swatch {
    display: inline-block;
    inline-size: 10px;
    block-size: 10px;
    border-radius: 2px;
  }

  .swatch.bar {
    background: var(--chart-1);
  }

  .swatch.ref {
    block-size: 2px;
    inline-size: 14px;
    background: var(--chart-ref);
  }

  .chart {
    position: relative;
    padding: var(--space-3) var(--space-3) var(--space-2);
    overflow-x: auto;
  }

  svg {
    inline-size: 100%;
    min-inline-size: 40rem;
    block-size: auto;
    overflow: visible;
  }

  .grid {
    stroke: var(--chart-grid);
    stroke-width: 1;
  }

  .axis {
    fill: var(--text-3);
    font-family: var(--font-mono);
    font-size: 10px;
  }

  .letter {
    fill: var(--text-2);
    font-weight: 600;
  }

  .bar {
    fill: var(--chart-1);
    transition: opacity var(--fast) var(--ease);
  }

  .ref {
    stroke: var(--chart-ref);
    stroke-width: 2;
    stroke-linecap: round;
  }

  .band.dim .bar,
  .band.dim .ref {
    opacity: 0.35;
  }

  .hit {
    fill: transparent;
  }

  .tooltip {
    position: absolute;
    inset-block-start: var(--space-2);
    display: grid;
    gap: 2px;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    background: var(--surface-1);
    box-shadow: var(--shadow-2);
    font-size: var(--text-xs);
    white-space: nowrap;
    pointer-events: none;
    transform: translateX(-50%);
  }

  .tooltip span {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--text-2);
  }

  .columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    gap: var(--space-4);
  }

  .list-panel {
    padding: var(--space-4);
  }

  .grams {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-block-start: var(--space-3);
  }

  .grams li {
    display: inline-flex;
    align-items: baseline;
    gap: 0.4rem;
    padding: 0.2rem 0.55rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface-2);
  }

  .grams .mono {
    font-weight: 700;
  }

  .grams .n {
    color: var(--text-3);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
  }

  .chars .glyph {
    min-inline-size: 1ch;
    font-family: var(--font-symbols);
    font-weight: 700;
    text-align: center;
  }

  .periods {
    display: grid;
    gap: var(--space-1);
    padding: var(--space-3) var(--space-4) var(--space-4);
  }

  .periods li {
    display: grid;
    grid-template-columns: 2rem 1fr 3.5rem;
    align-items: center;
    gap: var(--space-3);
    font-size: var(--text-sm);
  }

  .period {
    color: var(--text-3);
    text-align: end;
  }

  .best .period {
    color: var(--text);
    font-weight: 700;
  }

  .meter {
    block-size: 10px;
    border-radius: 0 4px 4px 0;
    background: var(--surface-2);
  }

  .meter span {
    display: block;
    block-size: 100%;
    border-radius: inherit;
    background: color-mix(in srgb, var(--chart-1) 45%, var(--surface-3));
  }

  .best .meter span {
    background: var(--chart-1);
  }

  .val {
    color: var(--text-2);
    font-size: var(--text-xs);
  }
</style>
