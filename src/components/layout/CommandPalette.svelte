<!--
  Command palette (Ctrl/⌘ K or "/"): a searchable, keyboard-driven tool
  switcher implemented as an ARIA combobox inside a native modal <dialog>
  (which provides focus trapping and an inert background for free).
  Searches tool names in both languages, ids, keywords and summaries.
-->
<script lang="ts">
  import CornerDownLeft from '@lucide/svelte/icons/corner-down-left';
  import Search from '@lucide/svelte/icons/search';
  import { TOOLS } from '$engine/registry';
  import { en } from '$lib/i18n/en';
  import { fa } from '$lib/i18n/fa';
  import { t } from '$lib/i18n/index.svelte';
  import { categoryName, toolName, toolSummary } from '$lib/i18n/tools';
  import { router } from '$lib/state/router.svelte';
  import Glyph from '$components/ui/Glyph.svelte';

  let { open = $bindable(false) }: { open: boolean } = $props();

  let dialog = $state<HTMLDialogElement>();
  let input = $state<HTMLInputElement>();
  let query = $state('');
  let active = $state(0);

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .replace(/[\u200C\u200D]/g, '');

  type Entry = { id: string; names: string; keywords: string; summaries: string };
  const catalogTools = (c: typeof en) =>
    c.tools as Record<string, { name: string; summary: string }>;
  const index: Entry[] = TOOLS.map((tool) => ({
    id: tool.id,
    names: normalize(`${catalogTools(en)[tool.id]?.name} ${catalogTools(fa)[tool.id]?.name}`),
    keywords: normalize(`${tool.id} ${(tool.keywords ?? []).join(' ')}`),
    summaries: normalize(
      `${catalogTools(en)[tool.id]?.summary} ${catalogTools(fa)[tool.id]?.summary}`,
    ),
  }));

  function isSubsequence(needle: string, haystack: string): boolean {
    let i = 0;
    for (const ch of haystack) if (ch === needle[i]) i++;
    return i === needle.length;
  }

  function score(entry: Entry, q: string): number {
    if (!q) return 1;
    if (entry.names.split(' ').some((w) => w.startsWith(q))) return 100;
    if (entry.names.includes(q)) return 70;
    if (entry.keywords.includes(q)) return 50;
    if (entry.summaries.includes(q)) return 20;
    if (q.length > 2 && isSubsequence(q, entry.names.replace(/\s/g, ''))) return 10;
    return 0;
  }

  const results = $derived.by(() => {
    const q = normalize(query.trim());
    return index
      .map((entry) => ({ entry, score: score(entry, q) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => TOOLS.find((tool) => tool.id === r.entry.id)!);
  });

  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) {
      query = '';
      active = 0;
      dialog.showModal();
      queueMicrotask(() => input?.focus());
    } else if (!open && dialog.open) {
      dialog.close();
    }
  });

  $effect(() => {
    void query;
    active = 0;
  });

  function choose(id: string) {
    open = false;
    router.go(id);
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      active = (active + 1) % Math.max(1, results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      active = (active - 1 + results.length) % Math.max(1, results.length);
    } else if (event.key === 'Enter' && results[active]) {
      event.preventDefault();
      choose(results[active]!.id);
    }
  }

  // Keep the highlighted option visible — only while the palette is open, so the
  // page itself is never scrolled by an option inside the closed dialog.
  $effect(() => {
    if (!open) return;
    document.getElementById(`palette-option-${active}`)?.scrollIntoView({ block: 'nearest' });
  });
</script>

<dialog
  bind:this={dialog}
  class="palette"
  aria-label={t('app.searchLabel')}
  onclose={() => (open = false)}
  onclick={(e) => e.target === dialog && (open = false)}
>
  <div class="box">
    <div class="search">
      <Search aria-hidden="true" />
      <input
        bind:this={input}
        bind:value={query}
        onkeydown={onKeydown}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls="palette-list"
        aria-autocomplete="list"
        aria-activedescendant={results.length ? `palette-option-${active}` : undefined}
        placeholder={t('app.search')}
        aria-label={t('app.searchLabel')}
        autocomplete="off"
        spellcheck="false"
      />
      <kbd>Esc</kbd>
    </div>
    <ul id="palette-list" class="list" role="listbox" aria-label={t('app.tools')}>
      {#each results as tool, i (tool.id)}
        <li
          id="palette-option-{i}"
          role="option"
          aria-selected={i === active}
          class="option"
          onclick={() => choose(tool.id)}
          onmousemove={() => (active = i)}
          onkeydown={() => {}}
        >
          <span class="icon"><Glyph id={tool.id} /></span>
          <span class="text">
            <span class="name">{toolName(tool.id)}</span>
            <span class="summary">{toolSummary(tool.id)}</span>
          </span>
          <span class="cat chip">{categoryName(tool.category)}</span>
          {#if i === active}<CornerDownLeft class="enter flip-rtl" aria-hidden="true" />{/if}
        </li>
      {:else}
        <li class="empty" role="presentation">{t('app.noResults', { query })}</li>
      {/each}
    </ul>
  </div>
</dialog>

<style>
  .palette {
    inline-size: min(40rem, calc(100vw - 2rem));
    max-block-size: min(34rem, calc(100dvh - 6rem));
    margin: 12vh auto auto;
    padding: 0;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-lg);
    background: var(--surface-1);
    color: var(--text);
    box-shadow: var(--shadow-3);
    overflow: hidden;
  }

  .palette[open] {
    animation: pop var(--normal) var(--ease-spring);
  }

  .palette::backdrop {
    background: var(--overlay);
  }

  .box {
    display: flex;
    flex-direction: column;
    max-block-size: inherit;
  }

  .search {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-block-end: 1px solid var(--border);
  }

  .search :global(svg) {
    inline-size: 1.15rem;
    block-size: 1.15rem;
    color: var(--accent);
    flex: none;
  }

  .search input {
    flex: 1;
    min-inline-size: 0;
    border: 0;
    background: none;
    font-size: var(--text-lg);
    outline: none;
  }

  .list {
    overflow-y: auto;
    padding: var(--space-2);
    list-style: none;
  }

  .option {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius);
    cursor: pointer;
  }

  .option[aria-selected='true'] {
    background: var(--accent-soft);
  }

  .icon {
    display: grid;
    place-items: center;
    inline-size: 2rem;
    block-size: 2rem;
    flex: none;
    border-radius: var(--radius-sm);
    background: var(--surface-2);
    color: var(--text-2);
  }

  .option[aria-selected='true'] .icon {
    background: var(--accent);
    color: var(--accent-ink);
  }

  .icon :global(svg) {
    inline-size: 1rem;
    block-size: 1rem;
  }

  .text {
    display: grid;
    flex: 1;
    min-inline-size: 0;
  }

  .name {
    font-weight: 600;
    font-size: var(--text-sm);
  }

  .summary {
    overflow: hidden;
    color: var(--text-3);
    font-size: var(--text-xs);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cat {
    flex: none;
  }

  .option :global(.enter) {
    inline-size: 0.9rem;
    block-size: 0.9rem;
    color: var(--text-3);
    flex: none;
  }

  .empty {
    padding: var(--space-5);
    color: var(--text-3);
    text-align: center;
  }

  @media (max-width: 560px) {
    .cat {
      display: none;
    }
  }

  @keyframes pop {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.98);
    }
  }
</style>
