<!-- Brute-forces all Caesar shifts of the current input and ranks them by χ² against English. -->
<script lang="ts">
  import ListOrdered from '@lucide/svelte/icons/list-ordered';
  import { caesarBruteForce } from '$engine/transforms/ciphers/caesar';
  import { i18n, t } from '$lib/i18n/index.svelte';
  import type { ToolSession } from '$lib/state/session.svelte';

  let { session }: { session: ToolSession } = $props();

  const rows = $derived(
    session.input.trim()
      ? caesarBruteForce(session.input.slice(0, 400)).filter((r) => r.shift !== 0)
      : [],
  );
  const best = $derived(rows[0]?.chi ?? 0);

  function use(shift: number) {
    session.setOption('shift', shift);
    session.setDirection('decode');
  }
</script>

{#if rows.length}
  <section class="panel" aria-labelledby="caesar-brute">
    <header class="panel-header">
      <h2 class="panel-title" id="caesar-brute">
        <ListOrdered aria-hidden="true" />{t('views.caesar.title')}
      </h2>
    </header>
    <p class="muted hint">{t('views.caesar.hint')}</p>
    <ol class="rows" role="list">
      {#each rows as row, i (row.shift)}
        <li class:top={i === 0}>
          <button
            class="row"
            onclick={() => use(row.shift)}
            title={t('views.caesar.use', { n: row.shift })}
          >
            <span class="shift mono">ROT{i18n.number(row.shift)}</span>
            <span class="text mono" dir="auto">{row.text}</span>
            <span class="meter" aria-hidden="true">
              <span
                style:inline-size="{Math.max(
                  4,
                  Math.min(100, (best / Math.max(row.chi, 1e-9)) * 100),
                )}%"
              ></span>
            </span>
          </button>
        </li>
      {/each}
    </ol>
  </section>
{/if}

<style>
  .hint {
    padding: var(--space-3) var(--space-4) 0;
  }

  .rows {
    display: grid;
    gap: 2px;
    max-block-size: 26rem;
    overflow-y: auto;
    padding: var(--space-3);
  }

  .row {
    display: grid;
    grid-template-columns: 4.5rem minmax(0, 1fr) 5rem;
    align-items: center;
    gap: var(--space-3);
    inline-size: 100%;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    text-align: start;
  }

  .row:hover {
    background: var(--surface-2);
  }

  .top .row {
    background: var(--accent-soft);
  }

  .shift {
    color: var(--text-3);
    font-size: var(--text-xs);
    font-weight: 700;
  }

  .top .shift {
    color: var(--accent);
  }

  .text {
    overflow: hidden;
    font-size: var(--text-sm);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meter {
    block-size: 6px;
    border-radius: 3px;
    background: var(--surface-3);
    overflow: hidden;
  }

  .meter span {
    display: block;
    block-size: 100%;
    border-radius: inherit;
    background: var(--accent);
  }
</style>
