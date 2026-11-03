<!-- Auto-generated options form: every visible option spec becomes a control. -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import { isOptionVisible } from '$engine/core/options';
  import { t } from '$lib/i18n/index.svelte';
  import type { ToolSession } from '$lib/state/session.svelte';
  import OptionControl from './OptionControl.svelte';

  interface Props {
    session: ToolSession;
    /** Option keys rendered by a bespoke editor instead of the generic form. */
    exclude?: readonly string[];
    children?: Snippet;
  }

  let { session, exclude = [], children }: Props = $props();

  const visible = $derived(
    session.tool.options.filter(
      (spec) =>
        spec.type !== 'json' &&
        !exclude.includes(spec.key) &&
        isOptionVisible(spec, session.canDecode ? session.direction : 'encode', session.options),
    ),
  );
</script>

{#if visible.length || children}
  <section class="panel options" aria-labelledby="options-{session.tool.id}">
    <header class="panel-header">
      <h2 class="panel-title" id="options-{session.tool.id}">
        <SlidersHorizontal aria-hidden="true" />{t('workbench.options')}
      </h2>
      <button class="btn btn-ghost btn-sm" onclick={() => session.resetOptions()}>
        <RotateCcw aria-hidden="true" />{t('workbench.resetOptions')}
      </button>
    </header>
    {#if visible.length}
      <div class="grid panel-body">
        {#each visible as spec (spec.key)}
          <OptionControl
            toolId={session.tool.id}
            {spec}
            value={session.options[spec.key]}
            onchange={(value) => session.setOption(spec.key, value)}
          />
        {/each}
      </div>
    {/if}
    {@render children?.()}
  </section>
{/if}

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 13.5rem), 1fr));
    gap: var(--space-4) var(--space-5);
    align-items: start;
  }
</style>
