<!--
  Cycles system → light → dark. Where the View Transitions API is available the
  new theme is revealed by a circle expanding from the button.
-->
<script lang="ts">
  import Monitor from '@lucide/svelte/icons/monitor';
  import Moon from '@lucide/svelte/icons/moon';
  import Sun from '@lucide/svelte/icons/sun';
  import { t } from '$lib/i18n/index.svelte';
  import { prefs } from '$lib/state/prefs.svelte';

  const labels = $derived({
    system: t('app.themes.system'),
    light: t('app.themes.light'),
    dark: t('app.themes.dark'),
  });

  function cycle(event: MouseEvent) {
    const apply = () => {
      prefs.cycleTheme();
      document.documentElement.dataset.theme = prefs.resolvedTheme;
    };
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduced) {
      apply();
      return;
    }
    const x = event.clientX || innerWidth / 2;
    const y = event.clientY || 0;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const transition = document.startViewTransition(apply);
    void transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 480,
          easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      );
    });
  }
</script>

<button
  class="btn btn-ghost btn-icon"
  onclick={cycle}
  aria-label={t('app.switchTheme', { theme: labels[prefs.theme] })}
  title={t('app.switchTheme', { theme: labels[prefs.theme] })}
>
  {#if prefs.theme === 'system'}
    <Monitor aria-hidden="true" />
  {:else if prefs.theme === 'light'}
    <Sun aria-hidden="true" />
  {:else}
    <Moon aria-hidden="true" />
  {/if}
</button>
