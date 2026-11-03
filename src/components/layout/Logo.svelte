<!--
  The Eleet mark and wordmark.

  The mark is a capital E whose middle arm has been substituted by a dot: "·"
  is E in Morse code, the shortest signal of all, given to E because it is the
  most frequent letter in English. One letter, two of the oldest ideas in the
  cabinet — substitution and frequency.

  On hover or focus the wordmark substitutes itself, letter by letter, using
  the default leet preset: E→3, e→3, t→7 — and l stays l, because "1" belongs
  to i. Honours prefers-reduced-motion (the swap becomes a plain cross-fade).
-->
<script lang="ts">
  import { t } from '$lib/i18n/index.svelte';

  const LETTERS: readonly [plain: string, leet: string][] = [
    ['E', '3'],
    ['l', 'l'],
    ['e', '3'],
    ['e', '3'],
    ['t', '7'],
  ];
</script>

<a class="logo" href="#/" aria-label={t('app.home')}>
  <svg class="mark" viewBox="0 0 32 32" aria-hidden="true">
    <rect class="tile" x="1" y="1" width="30" height="30" rx="7" />
    <path class="stroke" d="M11 8.5v15M11 8.5h10M11 23.5h10" />
    <circle class="dot" cx="17.5" cy="16" r="2.4" />
  </svg>
  <span class="word" dir="ltr" aria-hidden="true">
    {#each LETTERS as [plain, leet], i (i)}
      <span class="slot" class:fixed={plain === leet} style:--i={i}>
        <span class="plain">{plain}</span>
        {#if plain !== leet}<span class="leet">{leet}</span>{/if}
      </span>
    {/each}
  </span>
</a>

<style>
  .logo {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    color: var(--text);
    text-decoration: none;
    border-radius: var(--radius);
    padding: 0.2rem 0.35rem 0.2rem 0.2rem;
  }

  .mark {
    inline-size: 1.85rem;
    block-size: 1.85rem;
    flex: none;
    transition: transform var(--slow) var(--ease-spring);
  }

  .logo:active .mark {
    transform: scale(0.92);
    transition-duration: 60ms;
  }

  .tile {
    fill: var(--text);
  }

  .stroke {
    fill: none;
    stroke: var(--bg);
    stroke-width: 2.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .dot {
    fill: var(--rubric);
    transition: transform var(--slow) var(--ease-spring);
    transform-origin: 17.5px 16px;
  }

  .logo:hover .dot,
  .logo:focus-visible .dot {
    transform: scale(1.25);
  }

  .word {
    display: inline-flex;
    font-family: var(--font-serif);
    font-optical-sizing: auto;
    font-size: 1.45rem;
    font-weight: 560;
    letter-spacing: -0.015em;
    line-height: 1;
    white-space: nowrap;
  }

  /* Each letter is a one-line window; the leet glyph waits below and rolls up. */
  .slot {
    position: relative;
    display: inline-grid;
    overflow: hidden;
    padding-block: 0.08em 0.12em;
  }

  .plain,
  .leet {
    grid-area: 1 / 1;
    text-align: center;
    transition:
      transform var(--slow) var(--ease-out) calc(var(--i) * 45ms),
      opacity var(--normal) var(--ease) calc(var(--i) * 45ms);
  }

  .leet {
    color: var(--rubric);
    font-family: var(--font-mono);
    font-size: 0.86em;
    font-weight: 600;
    align-self: center;
    transform: translateY(160%);
  }

  .logo:hover .slot:not(.fixed) .plain,
  .logo:focus-visible .slot:not(.fixed) .plain {
    transform: translateY(-120%);
  }

  .logo:hover .leet,
  .logo:focus-visible .leet {
    transform: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .plain,
    .leet {
      transform: none !important;
    }

    .leet {
      opacity: 0;
    }

    .logo:hover .slot:not(.fixed) .plain {
      opacity: 0;
    }

    .logo:hover .leet {
      opacity: 1;
    }
  }

  @media (max-width: 380px) {
    .word {
      display: none;
    }
  }
</style>
