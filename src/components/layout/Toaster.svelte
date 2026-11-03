<!-- Toast notifications, announced politely to screen readers. -->
<script lang="ts">
  import CircleAlert from '@lucide/svelte/icons/circle-alert';
  import CircleCheck from '@lucide/svelte/icons/circle-check';
  import Info from '@lucide/svelte/icons/info';
  import X from '@lucide/svelte/icons/x';
  import { t } from '$lib/i18n/index.svelte';
  import { toasts } from '$lib/state/toasts.svelte';
  import { fly } from 'svelte/transition';
</script>

<div class="toaster" role="status" aria-live="polite" aria-atomic="false">
  {#each toasts.items as toast (toast.id)}
    <div class="toast {toast.kind}" transition:fly={{ y: 16, duration: 220 }}>
      {#if toast.kind === 'success'}
        <CircleCheck aria-hidden="true" />
      {:else if toast.kind === 'error'}
        <CircleAlert aria-hidden="true" />
      {:else}
        <Info aria-hidden="true" />
      {/if}
      <p>{toast.message}</p>
      {#if toast.action}
        <button
          class="btn btn-primary btn-sm"
          onclick={() => {
            toast.action?.run();
            toasts.dismiss(toast.id);
          }}>{toast.action.label}</button
        >
      {/if}
      <button
        class="btn btn-ghost btn-icon btn-sm"
        aria-label={t('app.dismiss')}
        onclick={() => toasts.dismiss(toast.id)}
      >
        <X aria-hidden="true" />
      </button>
    </div>
  {/each}
</div>

<style>
  .toaster {
    position: fixed;
    inset-block-end: var(--space-4);
    inset-inline-end: var(--space-4);
    z-index: 90;
    display: grid;
    gap: var(--space-2);
    inline-size: min(24rem, calc(100vw - 2rem));
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius);
    background: var(--surface-1);
    box-shadow: var(--shadow-2);
    font-size: var(--text-sm);
    pointer-events: auto;
  }

  .toast > :global(svg) {
    inline-size: 1.1rem;
    block-size: 1.1rem;
    flex: none;
    color: var(--accent-2);
  }

  .toast.success > :global(svg) {
    color: var(--accent);
  }

  .toast.error {
    border-color: color-mix(in srgb, var(--danger) 50%, var(--border));
  }

  .toast.error > :global(svg) {
    color: var(--danger);
  }

  p {
    flex: 1;
    line-height: 1.45;
  }
</style>
