<!--
  The specimen sheet: one line of text, set by a dozen instruments at once —
  the way a type foundry shows a typeface in every size. Results are computed
  in the engine worker as you type; following a row opens that tool with the
  same text and settings.
-->
<script lang="ts">
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import { defaultOptions } from '$engine/core/options';
  import type { OptionValues } from '$engine/core/types';
  import { getTransform } from '$engine/registry';
  import { t } from '$lib/i18n/index.svelte';
  import { eraLabel, toolName } from '$lib/i18n/tools';
  import { engine } from '$lib/platform/engine';
  import { sessionFor } from '$lib/state/session.svelte';
  import { catalogueNumber, ERAS } from '$lib/ui/catalogue';

  interface Row {
    readonly tool: string;
    readonly options?: OptionValues;
  }

  const ROWS: readonly Row[] = [
    { tool: 'leet' },
    { tool: 'atbash' },
    { tool: 'caesar', options: { shift: 3 } },
    { tool: 'scytale', options: { diameter: 4 } },
    { tool: 'vigenere', options: { variant: 'vigenere', key: 'LEMON' } },
    { tool: 'enigma' },
    { tool: 'bacon', options: { mode: 'symbols' } },
    { tool: 'polybius' },
    { tool: 'morse' },
    { tool: 'braille' },
    { tool: 'base64' },
    { tool: 'hash', options: { algorithm: 'sha256', format: 'hex' } },
    { tool: 'fancy', options: { style: 'fraktur' } },
    { tool: 'flip' },
  ];

  let text = $state(t('home.specimen.sample'));
  let results = $state<Record<string, string>>({});
  let pending: number[] = [];

  const options = (row: Row): OptionValues => ({
    ...defaultOptions(getTransform(row.tool)!.options),
    ...row.options,
  });

  $effect(() => {
    const input = text;
    for (const id of pending) engine.cancel(id);
    pending = [];
    const timer = setTimeout(() => {
      for (const row of ROWS) {
        const job = engine.transform(row.tool, 'encode', input, options(row));
        pending.push(job.id);
        void job.promise.then((result) => {
          if ('cancelled' in result) return;
          results[row.tool] = result.ok ? result.value : '';
        });
      }
    }, 90);
    return () => clearTimeout(timer);
  });

  /** Hands the line to the tool's own workbench before the link navigates. */
  function open(row: Row) {
    const session = sessionFor(getTransform(row.tool)!);
    session.setDirection('encode');
    for (const [key, value] of Object.entries(row.options ?? {})) session.setOption(key, value);
    session.input = text;
  }
</script>

<div class="sheet">
  <div class="field-row">
    <label class="visually-hidden" for="specimen-input">{t('home.specimen.label')}</label>
    <input
      id="specimen-input"
      class="specimen-input serif"
      bind:value={text}
      maxlength="120"
      autocomplete="off"
      spellcheck="false"
      dir="auto"
    />
    <button
      class="btn btn-ghost btn-icon"
      onclick={() => (text = t('home.specimen.sample'))}
      aria-label={t('home.specimen.reset')}
      title={t('home.specimen.reset')}
    >
      <RotateCcw aria-hidden="true" />
    </button>
  </div>

  <ol class="rows" role="list">
    {#each ROWS as row (row.tool)}
      {@const tool = getTransform(row.tool)!}
      {@const era = eraLabel(ERAS[row.tool])}
      <li>
        <a
          class="row"
          href="#/{row.tool}"
          onclick={() => open(row)}
          aria-label={t('home.specimen.open', { tool: toolName(row.tool) })}
        >
          <span class="meta">
            <span class="number rubric">{catalogueNumber(tool)}</span>
            <span class="name">{toolName(row.tool)}</span>
            {#if era}<span class="era">{era}</span>{/if}
          </span>
          <output
            class="result"
            dir="auto"
            class:symbols={['braille', 'fancy', 'flip'].includes(row.tool)}
            >{results[row.tool] ?? ''}</output
          >
        </a>
      </li>
    {/each}
  </ol>
</div>

<style>
  .sheet {
    border-block: 1px solid var(--border-strong);
  }

  .field-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding-block: var(--space-3);
    border-block-end: 1px solid var(--border-strong);
  }

  .specimen-input {
    flex: 1;
    min-inline-size: 0;
    padding: var(--space-2) 0;
    border: 0;
    background: transparent;
    color: var(--text);
    font-size: clamp(1.4rem, 1rem + 1.6vw, 2.1rem);
    font-style: italic;
    font-weight: 400;
    letter-spacing: -0.01em;
    caret-color: var(--rubric);
  }

  .specimen-input:focus {
    outline: none;
  }

  .field-row:focus-within {
    border-block-end-color: var(--accent);
    box-shadow: 0 1px 0 var(--accent);
  }

  .rows {
    padding: 0;
  }

  .row {
    display: grid;
    grid-template-columns: minmax(12rem, 16rem) minmax(0, 1fr);
    align-items: baseline;
    gap: var(--space-4);
    padding: 0.7rem var(--space-2);
    margin-inline: calc(-1 * var(--space-2));
    border-block-end: 1px solid var(--border);
    color: var(--text);
    text-decoration: none;
    transition: background var(--fast) var(--ease);
  }

  li:last-child .row {
    border-block-end: 0;
  }

  .row:hover {
    background: var(--surface-2);
  }

  .meta {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    min-inline-size: 0;
  }

  .number {
    min-inline-size: 2.6em;
    font-size: var(--text-sm);
    font-style: italic;
  }

  .name {
    font-size: var(--text-sm);
    font-weight: 600;
    white-space: nowrap;
  }

  .era {
    color: var(--text-3);
    font-size: var(--text-xs);
    white-space: nowrap;
  }

  .result {
    overflow: hidden;
    font-family: var(--font-mono);
    font-feature-settings: 'calt' 0;
    font-size: var(--text-md);
    text-overflow: ellipsis;
    white-space: nowrap;
    unicode-bidi: plaintext;
  }

  .result.symbols {
    font-family: var(--font-symbols);
  }

  .row:hover .result {
    color: var(--accent);
  }

  @media (max-width: 720px) {
    .row {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-1);
    }
  }
</style>
