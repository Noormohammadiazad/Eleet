<!-- Keyboard shortcut reference ("?"). -->
<script lang="ts">
  import X from '@lucide/svelte/icons/x';
  import { t, type MessageKey } from '$lib/i18n/index.svelte';

  let { open = $bindable(false) }: { open: boolean } = $props();
  let dialog = $state<HTMLDialogElement>();

  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const mod = isMac ? '⌘' : 'Ctrl';

  const rows: { keys: string[]; label: MessageKey }[] = [
    { keys: [mod, 'K'], label: 'shortcuts.palette' },
    { keys: ['/'], label: 'shortcuts.palette' },
    { keys: ['Alt', 'S'], label: 'shortcuts.swap' },
    { keys: ['Alt', 'D'], label: 'shortcuts.direction' },
    { keys: [mod, 'Shift', 'C'], label: 'shortcuts.copy' },
    { keys: ['?'], label: 'shortcuts.help' },
  ];

  $effect(() => {
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  });
</script>

<dialog
  bind:this={dialog}
  class="dialog"
  aria-labelledby="shortcuts-title"
  onclose={() => (open = false)}
  onclick={(e) => e.target === dialog && (open = false)}
>
  <header>
    <h2 id="shortcuts-title">{t('app.shortcuts')}</h2>
    <button
      class="btn btn-ghost btn-icon btn-sm"
      aria-label={t('app.dismiss')}
      onclick={() => (open = false)}
    >
      <X aria-hidden="true" />
    </button>
  </header>
  <dl>
    {#each rows as row, i (i)}
      <div class="row">
        <dt>{t(row.label)}</dt>
        <dd dir="ltr">
          {#each row.keys as key, k (k)}<kbd>{key}</kbd>{#if k < row.keys.length - 1}<span
                class="plus">+</span
              >{/if}{/each}
        </dd>
      </div>
    {/each}
  </dl>
</dialog>

<style>
  .dialog {
    inline-size: min(26rem, calc(100vw - 2rem));
    margin: auto;
    padding: 0;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-lg);
    background: var(--surface-1);
    color: var(--text);
    box-shadow: var(--shadow-3);
  }

  .dialog::backdrop {
    background: var(--overlay);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    border-block-end: 1px solid var(--border);
  }

  h2 {
    font-size: var(--text-md);
  }

  dl {
    display: grid;
    gap: var(--space-1);
    padding: var(--space-3) var(--space-4) var(--space-4);
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding-block: var(--space-1);
  }

  dt {
    color: var(--text-2);
    font-size: var(--text-sm);
  }

  dd {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .plus {
    color: var(--text-3);
    font-size: var(--text-xs);
  }
</style>
