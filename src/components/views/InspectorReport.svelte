<!--
  Unicode Inspector report: statistics, security findings, mixed-script words
  and a character-by-character grid where invisible characters become visible
  labels. Selecting a cell shows its code points, category, script and bytes.
-->
<script lang="ts">
  import ScanSearch from '@lucide/svelte/icons/scan-search';
  import ShieldAlert from '@lucide/svelte/icons/shield-alert';
  import ShieldCheck from '@lucide/svelte/icons/shield-check';
  import type { Flag, GraphemeInfo, InspectorReport } from '$engine/analysis/inspector';
  import { i18n, t } from '$lib/i18n/index.svelte';

  let { report }: { report: InspectorReport } = $props();

  const SHORT: Record<number, string> = {
    0x09: 'TAB',
    0x0a: 'LF',
    0x0d: 'CR',
    0x20: 'SP',
    0xa0: 'NBSP',
    0xad: 'SHY',
    0x34f: 'CGJ',
    0x61c: 'ALM',
    0x180e: 'MVS',
    0x200b: 'ZWSP',
    0x200c: 'ZWNJ',
    0x200d: 'ZWJ',
    0x200e: 'LRM',
    0x200f: 'RLM',
    0x202a: 'LRE',
    0x202b: 'RLE',
    0x202c: 'PDF',
    0x202d: 'LRO',
    0x202e: 'RLO',
    0x2060: 'WJ',
    0x2061: 'FA',
    0x2062: 'IT',
    0x2063: 'IS',
    0x2064: 'IP',
    0x2066: 'LRI',
    0x2067: 'RLI',
    0x2068: 'FSI',
    0x2069: 'PDI',
    0x3000: 'IDSP',
    0xfeff: 'BOM',
    0x3164: 'HF',
    0xffa0: 'HWHF',
  };

  const FLAG_ORDER: Flag[] = [
    'bidi',
    'tag',
    'invisible',
    'confusable',
    'control',
    'privateUse',
    'combining',
    'whitespace',
    'variation',
  ];
  const SEVERE = new Set<Flag>(['bidi', 'tag', 'invisible', 'confusable', 'control', 'privateUse']);
  /** ZWNJ (Persian half-space) and ZWJ (emoji sequences) are legitimate; they are shown but not alarmed. */
  const JOINERS = new Set([0x200c, 0x200d]);
  const isSevere = (g: GraphemeInfo) =>
    g.codePoints.some((cp) => !JOINERS.has(cp.cp) && cp.flags.some((f) => SEVERE.has(f)));

  let onlySuspicious = $state(false);
  let selected = $state<number | null>(null);

  const findings = $derived(FLAG_ORDER.filter((f) => report.findings[f] > 0));
  const severe = $derived(report.graphemes.some(isSevere) || report.mixedScriptWords.length > 0);
  const cells = $derived(
    report.graphemes
      .map((g, index) => ({ g, index }))
      .filter(({ g }) => !onlySuspicious || g.flags.length > 0),
  );

  function label(g: GraphemeInfo): string | null {
    const cps = g.codePoints;
    if (cps.length === 1 && SHORT[cps[0]!.cp]) return SHORT[cps[0]!.cp]!;
    if (cps.every((c) => c.flags.includes('tag'))) {
      return cps
        .map((c) => (c.cp > 0xe0001 && c.cp < 0xe007f ? String.fromCharCode(c.cp - 0xe0000) : '◇'))
        .join('');
    }
    if (
      cps.every((c) => c.flags.some((f) => f === 'invisible' || f === 'bidi' || f === 'control'))
    ) {
      return cps.map((c) => SHORT[c.cp] ?? c.hex).join('+');
    }
    return null;
  }

  const detail = $derived(selected === null ? null : report.graphemes[selected]);
  const stats = $derived([
    ['graphemes', report.stats.graphemes],
    ['codePoints', report.stats.codePoints],
    ['utf16', report.stats.utf16],
    ['utf8', report.stats.utf8],
    ['words', report.stats.words],
    ['lines', report.stats.lines],
    ['unique', report.stats.unique],
  ] as const);
</script>

<div class="report">
  <dl class="stat-grid">
    {#each stats as [key, value] (key)}
      <div class="stat">
        <dt>{i18n.tr(`views.inspector.${key}`)}</dt>
        <dd>{i18n.number(value)}</dd>
      </div>
    {/each}
    <div class="stat">
      <dt>{t('views.inspector.entropy')}</dt>
      <dd>{t('views.frequency.bitsPerChar', { n: Number(report.stats.entropy.toFixed(2)) })}</dd>
    </div>
  </dl>

  <section class="panel findings" class:severe aria-labelledby="findings-title">
    <header class="panel-header">
      <h2 class="panel-title" id="findings-title">
        {#if severe}<ShieldAlert aria-hidden="true" />{:else}<ShieldCheck aria-hidden="true" />{/if}
        {t('views.inspector.findings')}
      </h2>
      {#if report.scripts.length}
        <div class="scripts" aria-label={t('views.inspector.scripts')}>
          {#each report.scripts as s (s.script)}<span class="chip"
              >{s.script} · {i18n.number(s.count)}</span
            >{/each}
        </div>
      {/if}
    </header>
    <div class="panel-body">
      {#if !findings.length}
        <p class="clean">{t('views.inspector.clean')}</p>
      {:else}
        <ul class="flag-list" role="list">
          {#each findings as flag (flag)}
            <li>
              <span
                class="chip"
                class:chip-danger={SEVERE.has(flag)}
                class:chip-info={!SEVERE.has(flag)}
              >
                {i18n.tr(`views.inspector.flags.${flag}`)} · {i18n.number(report.findings[flag])}
              </span>
              <span class="help">{i18n.tr(`views.inspector.flagHelp.${flag}`)}</span>
            </li>
          {/each}
        </ul>
      {/if}
      {#if report.mixedScriptWords.length}
        <div class="mixed">
          <h3 class="caps">{t('views.inspector.mixedScript')}</h3>
          <div class="words">
            {#each report.mixedScriptWords as word (word)}<code class="chip chip-danger"
                >{word}</code
              >{/each}
          </div>
        </div>
      {/if}
    </div>
  </section>

  <section class="panel" aria-labelledby="chars-title">
    <header class="panel-header">
      <h2 class="panel-title" id="chars-title">
        <ScanSearch aria-hidden="true" />{t('views.inspector.characters')}
      </h2>
      <button
        class="btn btn-sm"
        class:btn-primary={onlySuspicious}
        aria-pressed={onlySuspicious}
        onclick={() => (onlySuspicious = !onlySuspicious)}
      >
        {t('views.inspector.onlySuspicious')}
      </button>
    </header>
    <div class="panel-body">
      {#if report.truncated}<p class="muted note">
          {t('views.inspector.truncated', { n: report.graphemes.length })}
        </p>{/if}
      <div class="grid" dir="ltr">
        {#each cells as { g, index } (index)}
          {@const special = label(g)}
          <button
            class="cell"
            class:flagged={isSevere(g)}
            class:soft={g.flags.length > 0 && !isSevere(g)}
            class:selected={selected === index}
            aria-pressed={selected === index}
            onclick={() => (selected = selected === index ? null : index)}
            title={g.codePoints.map((c) => c.hex).join(' ')}
          >
            {#if special}<span class="special">{special}</span>{:else}<span class="glyph"
                >{g.text}</span
              >{/if}
            <span class="cp"
              >{g.codePoints[0]?.hex.slice(2)}{g.codePoints.length > 1 ? '+' : ''}</span
            >
          </button>
        {/each}
      </div>

      {#if detail}
        <div class="detail" dir="ltr">
          {#each detail.codePoints as cp, i (i)}
            <div class="cp-row">
              <code class="hex">{cp.hex}</code>
              <span class="name">{cp.name ?? ''}</span>
              <span class="chip">{t('views.inspector.category')}: {cp.category}</span>
              <span class="chip">{t('views.inspector.script')}: {cp.script}</span>
              <span class="chip mono">{t('views.inspector.bytes')}: {cp.utf8}</span>
              {#each cp.flags as flag (flag)}
                <span
                  class="chip"
                  class:chip-danger={SEVERE.has(flag)}
                  class:chip-info={!SEVERE.has(flag)}
                  >{i18n.tr(`views.inspector.flags.${flag}`)}</span
                >
              {/each}
              {#if cp.lookalike}<span class="chip chip-warning"
                  >{t('views.inspector.lookalikeOf', { letter: cp.lookalike })}</span
                >{/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </section>
</div>

<style>
  .report {
    display: grid;
    gap: var(--space-4);
  }

  .findings.severe {
    border-color: color-mix(in srgb, var(--danger) 45%, var(--border));
  }

  .findings.severe .panel-title :global(svg) {
    color: var(--danger);
  }

  .scripts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .clean {
    color: var(--accent);
    font-weight: 600;
  }

  .flag-list {
    display: grid;
    gap: var(--space-2);
  }

  .flag-list li {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-2);
  }

  .help {
    color: var(--text-2);
    font-size: var(--text-sm);
  }

  .mixed {
    margin-block-start: var(--space-4);
  }

  .words {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-block-start: var(--space-2);
  }

  .note {
    margin-block-end: var(--space-2);
    font-size: var(--text-xs);
  }

  .grid {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    max-block-size: 28rem;
    overflow-y: auto;
  }

  .cell {
    display: grid;
    justify-items: center;
    min-inline-size: 2.75rem;
    padding: 0.3rem 0.25rem 0.2rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface-2);
  }

  .cell:hover {
    border-color: var(--border-strong);
  }

  .cell.soft {
    border-color: color-mix(in srgb, var(--accent-2) 55%, var(--border));
    background: var(--accent-2-soft);
  }

  .cell.flagged {
    border-color: var(--danger);
    background: var(--danger-soft);
  }

  .cell.selected {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .glyph {
    font-feature-settings: 'calt' 0;
    min-block-size: 1.6rem;
    font-family: var(--font-symbols);
    font-size: 1.1rem;
    line-height: 1.5;
    white-space: pre;
  }

  .special {
    font-feature-settings: 'calt' 0;
    display: grid;
    place-items: center;
    min-block-size: 1.6rem;
    padding-inline: 0.2rem;
    border: 1px dashed currentColor;
    border-radius: 3px;
    color: var(--text-2);
    font-family: var(--font-mono);
    font-size: 0.625rem;
    font-weight: 700;
  }

  .flagged .special {
    color: var(--danger);
  }

  .cp {
    color: var(--text-3);
    font-family: var(--font-mono);
    font-size: 0.625rem;
  }

  .detail {
    display: grid;
    gap: var(--space-2);
    margin-block-start: var(--space-3);
    padding: var(--space-3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-2);
  }

  .cp-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .hex {
    font-weight: 700;
    color: var(--accent);
  }

  .name {
    font-size: var(--text-xs);
    color: var(--text-2);
  }
</style>
