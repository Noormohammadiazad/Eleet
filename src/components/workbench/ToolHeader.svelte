<!--
  Tool title block, set like a catalogue entry: the drawer and number, the
  instrument's name in display type, its era, a one-line summary, a
  collapsible note, and the header actions.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import type { AnyTool } from '$engine/core/types';
  import { hasDossier } from '$lib/content/dossiers';
  import { t } from '$lib/i18n/index.svelte';
  import { categoryName, eraLabel, toolDescription, toolName, toolSummary } from '$lib/i18n/tools';
  import { catalogueNumber, ERAS } from '$lib/ui/catalogue';
  import Glyph from '$components/ui/Glyph.svelte';

  let { tool, actions }: { tool: AnyTool; actions?: Snippet } = $props();

  const era = $derived(eraLabel(ERAS[tool.id]));

  function toDossier() {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('dossier')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }
</script>

<header class="tool-header">
  <div class="title-row">
    <div class="titles">
      <p class="eyebrow">
        <span class="number rubric">{catalogueNumber(tool)}</span>
        <span>{categoryName(tool.category)}</span>
        {#if era}<span class="era">{era}</span>{/if}
      </p>
      <h1 class="serif"><Glyph id={tool.id} class="mark" />{toolName(tool.id)}</h1>
      <p class="summary">{toolSummary(tool.id)}</p>
    </div>
    {#if actions}<div class="actions">{@render actions()}</div>{/if}
  </div>
  <div class="notes">
    <details class="about">
      <summary>
        <ChevronDown class="chevron" aria-hidden="true" />
        {t('workbench.about')}
      </summary>
      <p class="serif">{toolDescription(tool.id)}</p>
    </details>
    {#if hasDossier(tool.id)}
      <button class="dossier-link" onclick={toDossier}>
        <span class="rubric" aria-hidden="true">§</span>{t('dossier.read')}
      </button>
    {/if}
  </div>
</header>

<style>
  .tool-header {
    display: grid;
    gap: var(--space-3);
    margin-block-end: var(--space-5);
  }

  .title-row {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: var(--space-4);
  }

  .titles {
    flex: 1 1 22rem;
    min-inline-size: 0;
  }

  .eyebrow {
    flex-wrap: wrap;
  }

  .number {
    font-size: var(--text-md);
    font-style: italic;
    font-weight: 500;
    letter-spacing: 0;
    text-transform: none;
  }

  .era {
    color: var(--rubric);
    font-family: var(--font-serif);
    font-size: var(--text-md);
    font-style: italic;
    font-weight: 450;
    letter-spacing: 0;
    text-transform: none;
  }

  .era::before {
    content: '·';
    margin-inline-end: 0.6em;
    color: var(--text-3);
  }

  h1 {
    display: flex;
    align-items: center;
    gap: 0.4em;
    margin-block: var(--space-2) var(--space-1);
    font-size: var(--text-2xl);
    font-weight: 500;
    letter-spacing: -0.015em;
    line-height: var(--leading-tight);
  }

  h1 :global(.mark) {
    inline-size: 0.82em;
    block-size: 0.82em;
    color: var(--rubric);
    --glyph-stroke: 1.35;
  }

  :global(:lang(fa)) h1 {
    letter-spacing: 0;
    font-weight: 600;
  }

  .summary {
    color: var(--text-2);
    font-size: var(--text-lg);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .notes {
    display: flex;
    flex-wrap: wrap;
    align-items: start;
    gap: var(--space-2) var(--space-5);
  }

  .about {
    max-inline-size: 75ch;
    color: var(--text-2);
  }

  .about summary,
  .dossier-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--text-3);
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
    list-style: none;
    border-radius: var(--radius-sm);
    transition: color var(--fast) var(--ease);
  }

  .dossier-link {
    gap: 0.45em;
  }

  .about summary::-webkit-details-marker {
    display: none;
  }

  .about summary:hover,
  .dossier-link:hover {
    color: var(--text);
  }

  .about :global(.chevron) {
    inline-size: 1rem;
    block-size: 1rem;
    transition: transform var(--normal) var(--ease-out);
  }

  .about[open] :global(.chevron) {
    transform: rotate(180deg);
  }

  .about p {
    margin-block-start: var(--space-2);
    padding-inline-start: var(--space-4);
    border-inline-start: 1px solid var(--rubric);
    font-size: var(--text-prose);
    line-height: var(--leading-prose);
  }

  .about[open] {
    flex-basis: 100%;
    order: 1;
  }
</style>
