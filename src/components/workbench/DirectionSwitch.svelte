<!-- Encode / decode mode switch, labelled with each tool's own verbs ("Hide" / "Reveal", "Encrypt" / "Decrypt"…). -->
<script lang="ts">
  import { slidingIndicator } from '$lib/ui/attachments';
  import LockKeyholeOpen from '@lucide/svelte/icons/lock-keyhole-open';
  import LockKeyhole from '@lucide/svelte/icons/lock-keyhole';
  import { t } from '$lib/i18n/index.svelte';
  import { actionLabel } from '$lib/i18n/tools';
  import type { ToolSession } from '$lib/state/session.svelte';

  let { session }: { session: ToolSession } = $props();

  function onkeydown(event: KeyboardEvent) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      session.toggleDirection();
      const group = (event.currentTarget as HTMLElement).closest('[role="radiogroup"]');
      queueMicrotask(() => group?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus());
    }
  }
</script>

<div
  class="segmented direction"
  role="radiogroup"
  aria-label={t('workbench.direction')}
  {@attach slidingIndicator}
>
  {#each ['encode', 'decode'] as const as direction (direction)}
    <button
      type="button"
      role="radio"
      aria-checked={session.direction === direction}
      tabindex={session.direction === direction ? 0 : -1}
      onclick={() => session.setDirection(direction)}
      {onkeydown}
    >
      {#if direction === 'encode'}<LockKeyhole aria-hidden="true" />{:else}<LockKeyholeOpen
          aria-hidden="true"
        />{/if}
      {actionLabel(session.tool.id, direction)}
    </button>
  {/each}
</div>

<style>
  .direction button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-block-size: 2.1rem;
    padding-inline: 0.9rem;
  }

  .direction button :global(svg) {
    inline-size: 0.95rem;
    block-size: 0.95rem;
  }

  .direction button[aria-checked='true'] {
    background: var(--accent);
    color: var(--accent-ink);
  }

  .direction:global(.has-indicator)::before {
    background: var(--accent);
    box-shadow: none;
  }

  .direction button {
    transition: color var(--normal) var(--ease-out);
  }
</style>
