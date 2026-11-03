<!--
  The workbench for text transforms: header, mode switch, options, the
  input/output editor pair and any tool-specific extension panels.
  Every edit re-runs the transform in the engine worker (debounced for the
  expensive ones); results stream back without blocking the UI.
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
  import Check from '@lucide/svelte/icons/check';
  import CircleAlert from '@lucide/svelte/icons/circle-alert';
  import ClipboardPaste from '@lucide/svelte/icons/clipboard-paste';
  import Copy from '@lucide/svelte/icons/copy';
  import Download from '@lucide/svelte/icons/download';
  import Eraser from '@lucide/svelte/icons/eraser';
  import Lightbulb from '@lucide/svelte/icons/lightbulb';
  import Share2 from '@lucide/svelte/icons/share-2';
  import CornerLeftUp from '@lucide/svelte/icons/corner-left-up';
  import { t } from '$lib/i18n/index.svelte';
  import { errorMessage } from '$lib/i18n/tools';
  import { copyText, downloadText, readText } from '$lib/platform/clipboard';
  import type { ToolSession } from '$lib/state/session.svelte';
  import { toasts } from '$lib/state/toasts.svelte';
  import { EXTENSIONS } from '$components/views/extensions';
  import DirectionSwitch from './DirectionSwitch.svelte';
  import OptionsPanel from './OptionsPanel.svelte';
  import Pane from './Pane.svelte';
  import ToolHeader from './ToolHeader.svelte';

  let { session }: { session: ToolSession } = $props();

  const SYMBOL_TOOLS = ['fancy', 'flip', 'mirror', 'zalgo', 'decorations', 'braille', 'homoglyph'];
  const tool = $derived(session.tool);
  const extension = $derived(EXTENSIONS[tool.id]);
  const oneWay = $derived(tool.kind === 'transform' && !tool.decode);
  const symbols = $derived(SYMBOL_TOOLS.includes(tool.id));

  $effect(() => {
    void session.input;
    void session.direction;
    void JSON.stringify(session.options);
    untrack(() => session.schedule());
  });

  $effect(() => {
    void JSON.stringify(session.options);
    void session.direction;
    untrack(() => session.persist());
  });

  // The copy button answers in place (icon and label turn to a check) instead of only via a toast.
  let copied = $state(false);
  let copiedTimer: ReturnType<typeof setTimeout> | undefined;

  async function copyOutput() {
    if (!session.output) return;
    const ok = await copyText(session.output);
    if (!ok) {
      toasts.show(t('workbench.copyFailed'), 'error');
      return;
    }
    copied = true;
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => (copied = false), 1600);
  }

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

  function download() {
    downloadText(session.output, `eleet-${tool.id}-${session.direction}.txt`);
  }

  function onKeydown(event: KeyboardEvent) {
    const mod = event.metaKey || event.ctrlKey;
    if (event.altKey && !mod && event.code === 'KeyS') {
      event.preventDefault();
      session.swap();
    } else if (event.altKey && !mod && event.code === 'KeyD') {
      event.preventDefault();
      session.toggleDirection();
    } else if (mod && event.shiftKey && event.code === 'KeyC') {
      event.preventDefault();
      void copyOutput();
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<ToolHeader {tool}>
  {#snippet actions()}
    {#if session.canDecode}<DirectionSwitch {session} />{/if}
    <button class="btn" onclick={share} title={t('workbench.shareLabel')}>
      <Share2 aria-hidden="true" />{t('workbench.share')}
    </button>
  {/snippet}
</ToolHeader>

<div class="stack">
  {#if extension?.options && extension.optionsMode === 'replace'}
    <extension.options {session} />
  {:else}
    <OptionsPanel {session}>
      {#if extension?.options && extension.optionsMode === 'append' && session.direction === 'encode'}
        <extension.options {session} />
      {/if}
    </OptionsPanel>
  {/if}

  <div class="editors">
    <Pane
      id="input-{tool.id}"
      label={t('workbench.input')}
      value={session.input}
      placeholder={session.direction === 'decode'
        ? t('workbench.placeholderDecode')
        : t('workbench.placeholder')}
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
    </Pane>

    <button
      class="swap btn btn-icon"
      onclick={() => session.swap()}
      disabled={!session.output}
      aria-label={t('workbench.swap')}
      title="{t('workbench.swap')} (Alt+S)"
    >
      <ArrowLeftRight aria-hidden="true" />
    </button>

    <Pane
      id="output-{tool.id}"
      label={t('workbench.output')}
      value={session.output}
      readonly
      busy={session.busy}
      invalid={!!session.error}
      {symbols}
      placeholder={t('workbench.emptyOutput')}
    >
      {#snippet actions()}
        <button
          class="btn btn-ghost btn-sm btn-icon"
          onclick={() => session.swap()}
          disabled={!session.output}
          aria-label={t('workbench.useAsInput')}
          title={t('workbench.useAsInput')}
        >
          <CornerLeftUp aria-hidden="true" class="flip-rtl" />
        </button>
        <button
          class="btn btn-ghost btn-sm btn-icon"
          onclick={download}
          disabled={!session.output}
          aria-label={t('workbench.download')}
          title={t('workbench.download')}
        >
          <Download aria-hidden="true" />
        </button>
        <button
          class="btn btn-primary btn-sm copy"
          class:copied
          onclick={copyOutput}
          disabled={!session.output}
        >
          {#if copied}<Check aria-hidden="true" />{:else}<Copy aria-hidden="true" />{/if}
          <span aria-live="polite">{copied ? t('workbench.copiedShort') : t('workbench.copy')}</span
          >
        </button>
      {/snippet}
      {#snippet overlay()}
        {#if session.error}
          <div class="error" role="alert">
            <CircleAlert aria-hidden="true" />
            <div>
              <strong>{t('workbench.error')}</strong>
              <p>{errorMessage(session.error)}</p>
            </div>
          </div>
        {/if}
      {/snippet}
      {#snippet footer()}
        {#if session.busy}
          <span class="working">{t('workbench.working')}</span>
        {:else if session.ms !== null && session.output}
          <span
            >{t('workbench.duration', {
              n: Number(session.ms.toFixed(session.ms < 10 ? 1 : 0)),
            })}</span
          >
        {/if}
        {#if oneWay}
          <span class="chip">{t('workbench.oneWay')}</span>
        {/if}
      {/snippet}
    </Pane>
  </div>

  {#if extension?.after}
    <extension.after {session} />
  {/if}
</div>

<style>
  .stack {
    display: grid;
    gap: var(--space-4);
  }

  .editors {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: var(--space-4);
    align-items: stretch;
  }

  .swap {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    z-index: 2;
    border-radius: 50%;
    background: var(--surface-1);
    border-color: var(--border-strong);
    box-shadow: var(--shadow-2);
    transform: translate(-50%, -50%);
  }

  :global([dir='rtl']) .swap {
    transform: translate(50%, -50%);
  }

  .swap:hover:not(:disabled) {
    color: var(--accent);
    border-color: var(--accent);
  }

  .error {
    position: absolute;
    inset-inline: var(--space-3);
    inset-block-end: var(--space-3);
    display: flex;
    gap: var(--space-3);
    padding: var(--space-3);
    border: 1px solid color-mix(in srgb, var(--danger) 45%, transparent);
    border-radius: var(--radius);
    background: var(--surface-1);
    box-shadow: var(--shadow-2);
    color: var(--text);
    font-size: var(--text-sm);
  }

  .error :global(svg) {
    inline-size: 1.15rem;
    block-size: 1.15rem;
    flex: none;
    color: var(--danger);
    margin-block-start: 0.1rem;
  }

  .error strong {
    display: block;
    color: var(--danger);
    font-size: var(--text-xs);
  }

  .working {
    color: var(--accent);
  }

  .copy :global(svg) {
    transition: transform var(--slow) var(--ease-spring);
  }

  .copy.copied {
    --btn-bg: var(--accent-strong);
  }

  .copy.copied :global(svg) {
    animation: tick var(--slow) var(--ease-spring);
  }

  @keyframes tick {
    from {
      transform: scale(0.4) rotate(-20deg);
    }
  }

  @media (max-width: 860px) {
    .editors {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-6);
    }

    .swap,
    :global([dir='rtl']) .swap {
      transform: translate(-50%, -50%) rotate(90deg);
    }
  }
</style>
