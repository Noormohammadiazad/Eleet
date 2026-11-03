<!-- Layout for analysis tools: input on top, a rich report component below. -->
<script lang="ts">
  import { untrack } from 'svelte';
  import ClipboardPaste from '@lucide/svelte/icons/clipboard-paste';
  import Eraser from '@lucide/svelte/icons/eraser';
  import Lightbulb from '@lucide/svelte/icons/lightbulb';
  import Share2 from '@lucide/svelte/icons/share-2';
  import CircleAlert from '@lucide/svelte/icons/circle-alert';
  import { t } from '$lib/i18n/index.svelte';
  import { errorMessage } from '$lib/i18n/tools';
  import { copyText, readText } from '$lib/platform/clipboard';
  import type { ToolSession } from '$lib/state/session.svelte';
  import { toasts } from '$lib/state/toasts.svelte';
  import { REPORTS } from '$components/views/extensions';
  import OptionsPanel from './OptionsPanel.svelte';
  import Pane from './Pane.svelte';
  import ToolHeader from './ToolHeader.svelte';

  let { session }: { session: ToolSession } = $props();
  const Report = $derived(REPORTS[session.tool.id]);

  $effect(() => {
    void session.input;
    void JSON.stringify(session.options);
    untrack(() => session.schedule());
  });

  $effect(() => {
    void JSON.stringify(session.options);
    untrack(() => session.persist());
  });

  async function paste() {
    const text = await readText();
    if (text !== null) session.input = text;
  }

  async function share() {
    const { url, truncated } = await session.shareLink();
    const ok = await copyText(url);
    if (!ok) toasts.show(t('workbench.copyFailed'), 'error');
    else
      toasts.show(
        truncated ? t('workbench.shareTooLong') : t('workbench.shareCopied'),
        truncated ? 'info' : 'success',
      );
  }
</script>

<ToolHeader tool={session.tool}>
  {#snippet actions()}
    <button class="btn" onclick={share} title={t('workbench.shareLabel')}>
      <Share2 aria-hidden="true" />{t('workbench.share')}
    </button>
  {/snippet}
</ToolHeader>

<div class="stack">
  <OptionsPanel {session} />
  <Pane
    id="input-{session.tool.id}"
    label={t('workbench.input')}
    value={session.input}
    placeholder={t('workbench.placeholder')}
    busy={session.busy}
    oninput={(value) => (session.input = value)}
  >
    {#snippet actions()}
      <button
        class="btn btn-ghost btn-sm"
        onclick={() => session.loadSample()}
        title={t('workbench.sampleLabel')}
      >
        <Lightbulb aria-hidden="true" />{t('workbench.sample')}
      </button>
      <button
        class="btn btn-ghost btn-sm btn-icon"
        onclick={paste}
        aria-label={t('workbench.paste')}
        title={t('workbench.paste')}
      >
        <ClipboardPaste aria-hidden="true" />
      </button>
      <button
        class="btn btn-ghost btn-sm btn-icon"
        onclick={() => (session.input = '')}
        aria-label={t('workbench.clear')}
        title={t('workbench.clear')}
        disabled={!session.input}
      >
        <Eraser aria-hidden="true" />
      </button>
    {/snippet}
    {#snippet footer()}
      {#if session.busy}<span class="working">{t('views.analysis.running')}</span>{/if}
    {/snippet}
  </Pane>

  {#if session.error}
    <div class="error panel" role="alert">
      <CircleAlert aria-hidden="true" />
      <p>{errorMessage(session.error)}</p>
    </div>
  {:else if !session.input}
    <p class="empty muted">{t('views.analysis.empty')}</p>
  {:else if session.report && Report}
    <Report report={session.report as never} {session} />
  {/if}
</div>

<style>
  .stack {
    display: grid;
    gap: var(--space-4);
  }

  .stack :global(textarea) {
    min-block-size: 9rem;
  }

  .working {
    color: var(--accent);
  }

  .empty {
    padding: var(--space-5);
    text-align: center;
  }

  .error {
    display: flex;
    gap: var(--space-3);
    padding: var(--space-4);
    border-color: color-mix(in srgb, var(--danger) 45%, transparent);
    color: var(--danger);
  }

  .error :global(svg) {
    inline-size: 1.2rem;
    block-size: 1.2rem;
    flex: none;
  }
</style>
