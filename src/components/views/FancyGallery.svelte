<!-- Renders the input in every Unicode style at once; click a card to copy that version. -->
<script lang="ts">
  import Copy from '@lucide/svelte/icons/copy';
  import Sparkles from '@lucide/svelte/icons/sparkles';
  import { FANCY_STYLE_NAMES, fancyEncode } from '$engine/transforms/unicode/fancy';
  import { t } from '$lib/i18n/index.svelte';
  import { choiceLabel } from '$lib/i18n/tools';
  import { copyText } from '$lib/platform/clipboard';
  import type { ToolSession } from '$lib/state/session.svelte';
  import { toasts } from '$lib/state/toasts.svelte';

  let { session }: { session: ToolSession } = $props();

  const text = $derived(
    (session.direction === 'encode' && session.input.trim() ? session.input : 'Eleet 1337').slice(
      0,
      160,
    ),
  );
  const spec = { key: 'style' };

  async function copy(style: (typeof FANCY_STYLE_NAMES)[number]) {
    const ok = await copyText(fancyEncode(text, style));
    toasts.show(ok ? t('workbench.copied') : t('workbench.copyFailed'), ok ? 'success' : 'error');
  }
</script>

<section class="panel" aria-labelledby="fancy-gallery">
  <header class="panel-header">
    <h2 class="panel-title" id="fancy-gallery">
      <Sparkles aria-hidden="true" />{t('views.gallery.title')}
    </h2>
    <span class="muted">{t('views.gallery.hint')}</span>
  </header>
  <div class="grid panel-body">
    {#each FANCY_STYLE_NAMES as style (style)}
      {@const label = choiceLabel('fancy', spec, { value: style })}
      <button
        class="card"
        class:current={session.options.style === style}
        onclick={() => copy(style)}
        aria-label={t('views.gallery.copy', { style: label })}
      >
        <span class="label caps">{label}</span>
        <span class="sample" dir="ltr">{fancyEncode(text, style)}</span>
        <Copy class="copy" aria-hidden="true" />
      </button>
    {/each}
  </div>
</section>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
    gap: var(--space-2);
  }

  .card {
    position: relative;
    display: grid;
    gap: var(--space-1);
    padding: var(--space-3) var(--space-3) var(--space-3) var(--space-3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-2);
    text-align: start;
    transition:
      border-color var(--fast) var(--ease),
      transform var(--fast) var(--ease);
  }

  .card:hover {
    border-color: var(--accent);
    transform: translateY(-1px);
  }

  .card.current {
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  .sample {
    font-feature-settings: 'calt' 0;
    overflow: hidden;
    font-family: var(--font-symbols);
    font-size: 1.15rem;
    line-height: 1.5;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card :global(.copy) {
    position: absolute;
    inset-block-start: var(--space-3);
    inset-inline-end: var(--space-3);
    inline-size: 0.9rem;
    block-size: 0.9rem;
    color: var(--text-3);
    opacity: 0;
    transition: opacity var(--fast) var(--ease);
  }

  .card:hover :global(.copy),
  .card:focus-visible :global(.copy) {
    opacity: 1;
  }
</style>
