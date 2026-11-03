<!--
  A labelled text pane used for both input and output: header with actions,
  the text area itself, and a footer with live statistics.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { i18n, t } from '$lib/i18n/index.svelte';
  import { textStats } from '$lib/ui/text-stats';

  interface Props {
    id: string;
    label: string;
    value: string;
    readonly?: boolean;
    placeholder?: string;
    busy?: boolean;
    invalid?: boolean;
    /** Render the text with the wide Unicode fallback stack (for fancy/zalgo/braille output). */
    symbols?: boolean;
    oninput?: (value: string) => void;
    actions?: Snippet;
    footer?: Snippet;
    overlay?: Snippet;
  }

  let {
    id,
    label,
    value,
    readonly = false,
    placeholder = '',
    busy = false,
    invalid = false,
    symbols = false,
    oninput,
    actions,
    footer,
    overlay,
  }: Props = $props();

  const stats = $derived(textStats(value));
</script>

<section class="pane" class:readonly class:busy class:invalid aria-labelledby="{id}-label">
  <header class="pane-header">
    <h2 class="caps" id="{id}-label">
      <span class="marker" class:out={readonly} aria-hidden="true"></span>{label}
    </h2>
    <div class="pane-actions">{@render actions?.()}</div>
  </header>
  <div class="body">
    <textarea
      {id}
      class:symbols
      aria-labelledby="{id}-label"
      aria-invalid={invalid || undefined}
      aria-busy={busy || undefined}
      dir={value ? 'auto' : i18n.dir}
      spellcheck="false"
      autocapitalize="off"
      autocomplete="off"
      {readonly}
      {placeholder}
      {value}
      oninput={(e) => oninput?.(e.currentTarget.value)}></textarea>
    {@render overlay?.()}
    {#if busy}<span class="progress" aria-hidden="true"></span>{/if}
  </div>
  <footer class="pane-footer">
    <span>{t('workbench.characters', { n: stats.chars })}</span>
    <span>{t('workbench.bytes', { n: stats.bytes })}</span>
    <span>{t('workbench.lines', { n: stats.lines })}</span>
    <span class="spacer"></span>
    {@render footer?.()}
  </footer>
</section>

<style>
  .pane {
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--surface-1);
    transition:
      border-color var(--fast) var(--ease),
      box-shadow var(--fast) var(--ease);
  }

  .pane:not(.readonly):focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent);
  }

  .pane.readonly {
    background: color-mix(in srgb, var(--surface-2) 55%, var(--surface-1));
  }

  .pane.invalid {
    border-color: color-mix(in srgb, var(--danger) 55%, var(--border));
  }

  .pane-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    min-block-size: 2.75rem;
    padding: var(--space-1) var(--space-2) var(--space-1) var(--space-4);
    border-block-end: 1px solid var(--border);
  }

  h2 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  /* A small filled mark for the output, an open one for the input. */
  .marker {
    inline-size: 0.5rem;
    block-size: 0.5rem;
    border: 1.5px solid var(--text-3);
    border-radius: 50%;
  }

  .marker.out {
    border-color: var(--rubric);
    background: var(--rubric);
  }

  .pane-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 2px;
  }

  .body {
    position: relative;
    flex: 1;
    display: flex;
  }

  textarea {
    flex: 1;
    inline-size: 100%;
    min-block-size: 15rem;
    padding: var(--space-4);
    border: 0;
    background: transparent;
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 0.95rem;
    line-height: 1.6;
    resize: vertical;
    outline: none;
    tab-size: 4;
    overflow-wrap: anywhere;
  }

  textarea.symbols {
    font-family: var(--font-symbols);
    font-size: 1.05rem;
  }

  :global(:lang(fa)) textarea {
    line-height: 1.9;
  }

  textarea::placeholder {
    color: var(--text-3);
  }

  .progress {
    position: absolute;
    inset-inline: 0;
    inset-block-start: 0;
    block-size: 2px;
    background: var(--accent) no-repeat;
    background-size: 30% 100%;
    animation: scan 1.1s var(--ease) infinite;
  }

  .pane-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-3);
    min-block-size: 2.25rem;
    padding: var(--space-1) var(--space-4);
    border-block-start: 1px solid var(--border);
    color: var(--text-3);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
  }

  .spacer {
    flex: 1;
  }

  @keyframes scan {
    from {
      background-position: -40% 0;
    }
    to {
      background-position: 140% 0;
    }
  }
</style>
