<!--
  Tool navigation, grouped by category. A persistent column on wide screens and
  an off-canvas drawer (with scrim and focus management) on small ones.
-->
<script lang="ts">
  import { toolsByCategory } from '$engine/registry';
  import { t } from '$lib/i18n/index.svelte';
  import { categoryName, toolName } from '$lib/i18n/tools';
  import { router } from '$lib/state/router.svelte';
  import { roman } from '$lib/ui/catalogue';
  import Glyph from '$components/ui/Glyph.svelte';

  interface Props {
    open: boolean;
    onClose: () => void;
  }

  let { open, onClose }: Props = $props();

  const groups = toolsByCategory();
  let nav = $state<HTMLElement>();

  $effect(() => {
    if (open) nav?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
  });
</script>

{#if open}
  <button class="scrim" aria-label={t('app.closeMenu')} tabindex="-1" onclick={onClose}></button>
{/if}

<nav id="tool-nav" class="sidebar" class:open aria-label={t('app.tools')} bind:this={nav}>
  <div class="groups">
    <a
      class="item overview"
      href="#/"
      aria-current={router.tool === null ? 'page' : undefined}
      onclick={onClose}
    >
      <svg class="index-mark" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5h14M5 9.5h14M5 14h9M5 18.5h11" />
      </svg>
      <span>{t('app.overview')}</span>
    </a>

    {#each groups as group, g (group.category)}
      <section class="group" aria-labelledby="cat-{group.category}">
        <h2 class="heading" id="cat-{group.category}">
          <span class="numeral rubric" aria-hidden="true">{roman(g + 1)}</span>
          <span class="caps">{categoryName(group.category)}</span>
        </h2>
        <ul role="list">
          {#each group.tools as tool (tool.id)}
            <li>
              <a
                class="item"
                href="#/{tool.id}"
                aria-current={router.tool === tool.id ? 'page' : undefined}
                onclick={onClose}
              >
                <Glyph id={tool.id} />
                <span>{toolName(tool.id)}</span>
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>

  <footer class="foot">
    <p>{t('app.privacy')}</p>
    <p class="meta">
      <span>{t('app.version', { version: __APP_VERSION__ })}</span>
      <span aria-hidden="true">·</span>
      <span>{t('app.footer')}</span>
    </p>
  </footer>
</nav>

<style>
  .sidebar {
    grid-area: nav;
    position: sticky;
    inset-block-start: var(--header-h);
    display: flex;
    flex-direction: column;
    block-size: calc(100dvh - var(--header-h));
    overflow-y: auto;
    overscroll-behavior: contain;
    border-inline-end: 1px solid var(--border);
    background: var(--bg);
  }

  .groups {
    flex: 1;
    padding: var(--space-4) var(--space-3) var(--space-5);
  }

  .group {
    margin-block-start: var(--space-5);
  }

  .heading {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    padding-inline: var(--space-3);
    margin-block-end: var(--space-1);
    font-size: inherit;
  }

  /* The numeral column lines up with the glyph column below it (1.05rem + 0.75rem gap). */
  .numeral {
    min-inline-size: 1.3rem;
    font-size: var(--text-sm);
    font-style: italic;
  }

  .item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.36rem var(--space-3);
    border-radius: var(--radius);
    color: var(--text-2);
    font-size: var(--text-sm);
    font-weight: 500;
    text-decoration: none;
    transition:
      background var(--fast) var(--ease),
      color var(--fast) var(--ease);
  }

  .item :global(.glyph),
  .index-mark {
    inline-size: 1.05rem;
    block-size: 1.05rem;
    color: var(--text-3);
    transition: color var(--fast) var(--ease);
  }

  .index-mark {
    flex: none;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
  }

  .item:hover {
    background: var(--surface-2);
    color: var(--text);
  }

  .item:hover :global(.glyph) {
    color: var(--text-2);
  }

  .item[aria-current='page'] {
    background: var(--surface-2);
    color: var(--text);
    font-weight: 600;
  }

  .item[aria-current='page'] :global(.glyph),
  .item[aria-current='page'] .index-mark {
    color: var(--accent);
  }

  .item[aria-current='page']::before {
    content: '';
    position: absolute;
    inset-block: 0.5rem;
    inset-inline-start: 0;
    inline-size: 2px;
    border-radius: 2px;
    background: var(--accent);
  }

  .foot {
    display: grid;
    gap: var(--space-2);
    padding: var(--space-4) var(--space-5) var(--space-5);
    border-block-start: 1px solid var(--border);
    font-size: var(--text-xs);
    line-height: 1.55;
    color: var(--text-3);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .scrim {
    display: none;
  }

  @media (max-width: 960px) {
    .sidebar {
      position: fixed;
      inset-block: var(--header-h) 0;
      inset-inline-start: 0;
      z-index: 40;
      inline-size: min(20rem, 86vw);
      block-size: auto;
      background: var(--surface-1);
      box-shadow: var(--shadow-3);
      transform: translateX(-105%);
      visibility: hidden;
      transition:
        transform var(--normal) var(--ease-out),
        visibility 0s linear var(--normal);
    }

    :global([dir='rtl']) .sidebar {
      transform: translateX(105%);
    }

    .sidebar.open,
    :global([dir='rtl']) .sidebar.open {
      transform: none;
      visibility: visible;
      transition: transform var(--normal) var(--ease-out);
    }

    .scrim {
      display: block;
      position: fixed;
      inset: var(--header-h) 0 0;
      z-index: 35;
      background: var(--overlay);
      animation: fade var(--normal) var(--ease);
    }
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
  }
</style>
