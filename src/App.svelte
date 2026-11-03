<!--
  Application shell: header, tool navigation, the active tool, and global
  overlays (command palette, shortcuts dialog, toasts). Also owns document-level
  side effects: <html lang/dir/data-theme>, the page title and global shortcuts.
-->
<script lang="ts">
  import { i18n, t } from '$lib/i18n/index.svelte';
  import { prefs } from '$lib/state/prefs.svelte';
  import { router } from '$lib/state/router.svelte';
  import { toasts } from '$lib/state/toasts.svelte';
  import CommandPalette from '$components/layout/CommandPalette.svelte';
  import Header from '$components/layout/Header.svelte';
  import ShortcutsDialog from '$components/layout/ShortcutsDialog.svelte';
  import Sidebar from '$components/layout/Sidebar.svelte';
  import Toaster from '$components/layout/Toaster.svelte';
  import ToolView from '$components/ToolView.svelte';
  import Home from '$components/home/Home.svelte';

  let paletteOpen = $state(false);
  let shortcutsOpen = $state(false);
  let navOpen = $state(false);

  $effect(() => {
    const root = document.documentElement;
    root.lang = i18n.locale;
    root.dir = i18n.dir;
  });

  $effect(() => {
    document.documentElement.dataset.theme = prefs.resolvedTheme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', prefs.resolvedTheme === 'dark' ? '#110f0d' : '#f8f5f0');
  });

  // The document title is the brand alone, on every page.
  $effect(() => {
    document.title = t('meta.title');
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t('meta.description'));
  });

  $effect(() => {
    if (router.unknown) toasts.show(t('app.notFound'), 'info');
  });

  // Close the mobile navigation and return to the top whenever the route changes.
  $effect(() => {
    void router.tool;
    navOpen = false;
    scrollTo({ top: 0 });
  });

  function isTyping(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  }

  function onKeydown(event: KeyboardEvent) {
    const mod = event.metaKey || event.ctrlKey;
    if (mod && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      paletteOpen = !paletteOpen;
    } else if (event.key === '/' && !isTyping(event.target) && !paletteOpen) {
      event.preventDefault();
      paletteOpen = true;
    } else if (event.key === '?' && !isTyping(event.target)) {
      event.preventDefault();
      shortcutsOpen = true;
    } else if (event.key === 'Escape' && navOpen) {
      navOpen = false;
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<a class="skip-link" href="#main">{t('app.skip')}</a>

<div class="shell" class:nav-open={navOpen}>
  <Header
    {navOpen}
    onToggleNav={() => (navOpen = !navOpen)}
    onOpenPalette={() => (paletteOpen = true)}
    onOpenShortcuts={() => (shortcutsOpen = true)}
  />
  <Sidebar open={navOpen} onClose={() => (navOpen = false)} />
  <main id="main" tabindex="-1">
    {#key router.tool}
      {#if router.tool}
        <ToolView toolId={router.tool} />
      {:else}
        <Home />
      {/if}
    {/key}
  </main>
</div>

<CommandPalette bind:open={paletteOpen} />
<ShortcutsDialog bind:open={shortcutsOpen} />
<Toaster />

<style>
  .skip-link {
    position: fixed;
    inset-block-start: var(--space-2);
    inset-inline-start: var(--space-2);
    z-index: 100;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius);
    background: var(--accent);
    color: var(--accent-ink);
    font-weight: 600;
    text-decoration: none;
    transform: translateY(-200%);
    transition: transform var(--fast) var(--ease);
  }

  .skip-link:focus {
    transform: none;
  }

  .shell {
    display: grid;
    grid-template-columns: var(--sidebar-w) minmax(0, 1fr);
    grid-template-rows: var(--header-h) 1fr;
    grid-template-areas:
      'header header'
      'nav main';
    min-block-size: 100dvh;
  }

  main {
    grid-area: main;
    min-inline-size: 0;
    padding: var(--space-5) clamp(var(--space-4), 3vw, var(--space-6)) var(--space-7);
  }

  main:focus {
    outline: none;
  }

  @media (max-width: 960px) {
    .shell {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas:
        'header'
        'main';
    }
  }
</style>
