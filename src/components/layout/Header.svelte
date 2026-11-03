<!-- Top application bar: navigation toggle, wordmark, tool search and global preferences. -->
<script lang="ts">
  import Keyboard from '@lucide/svelte/icons/keyboard';
  import Menu from '@lucide/svelte/icons/menu';
  import Search from '@lucide/svelte/icons/search';
  import X from '@lucide/svelte/icons/x';
  import { t } from '$lib/i18n/index.svelte';
  import GithubMark from './GithubMark.svelte';
  import LanguageToggle from './LanguageToggle.svelte';
  import Logo from './Logo.svelte';
  import ThemeToggle from './ThemeToggle.svelte';

  interface Props {
    navOpen: boolean;
    onToggleNav: () => void;
    onOpenPalette: () => void;
    onOpenShortcuts: () => void;
  }

  let { navOpen, onToggleNav, onOpenPalette, onOpenShortcuts }: Props = $props();

  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const shortcut = isMac ? '⌘K' : 'Ctrl K';
</script>

<header class="header">
  <button
    class="btn btn-ghost btn-icon nav-toggle"
    aria-label={navOpen ? t('app.closeMenu') : t('app.menu')}
    aria-expanded={navOpen}
    aria-controls="tool-nav"
    onclick={onToggleNav}
  >
    {#if navOpen}<X aria-hidden="true" />{:else}<Menu aria-hidden="true" />{/if}
  </button>

  <Logo />

  <button
    class="search"
    onclick={onOpenPalette}
    aria-label={t('app.searchShortcut', { key: shortcut })}
  >
    <Search aria-hidden="true" />
    <span class="search-text">{t('app.search')}</span>
    <kbd dir="ltr">{shortcut}</kbd>
  </button>

  <div class="actions">
    <LanguageToggle />
    <ThemeToggle />
    <button
      class="btn btn-ghost btn-icon shortcuts"
      aria-label={t('app.shortcuts')}
      title={t('app.shortcuts')}
      onclick={onOpenShortcuts}
    >
      <Keyboard aria-hidden="true" />
    </button>
    <a
      class="btn btn-ghost btn-icon"
      href="https://github.com/Noormohammadiazad/Eleet"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('app.github')}
      title={t('app.github')}
    >
      <GithubMark />
    </a>
  </div>
</header>

<style>
  .header {
    grid-area: header;
    position: sticky;
    inset-block-start: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding-inline: var(--space-3) var(--space-4);
    border-block-end: 1px solid var(--border);
    background: var(--bg);
  }

  .nav-toggle {
    display: none;
  }

  .search {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex: 0 1 26rem;
    min-inline-size: 0;
    margin-inline: auto;
    block-size: 2.25rem;
    padding-inline: var(--space-3) var(--space-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-1);
    color: var(--text-3);
    font-size: var(--text-sm);
    transition:
      border-color var(--fast) var(--ease),
      color var(--fast) var(--ease);
  }

  .search:hover {
    border-color: var(--border-strong);
    color: var(--text-2);
  }

  .search :global(svg) {
    inline-size: 1rem;
    block-size: 1rem;
    flex: none;
  }

  .search-text {
    flex: 1;
    overflow: hidden;
    text-align: start;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  @media (max-width: 960px) {
    .nav-toggle {
      display: inline-flex;
    }
  }

  @media (max-width: 640px) {
    .search {
      flex: 0 0 auto;
      inline-size: 2.25rem;
      margin-inline-start: auto;
      margin-inline-end: 0;
      padding: 0;
      justify-content: center;
    }

    .search-text,
    .search kbd,
    .shortcuts {
      display: none;
    }
  }
</style>
