<!-- Morse transmitter: hear it, see it on a signal lamp, or download it as a WAV file. -->
<script lang="ts">
  import Download from '@lucide/svelte/icons/download';
  import Play from '@lucide/svelte/icons/play';
  import Radio from '@lucide/svelte/icons/radio';
  import Square from '@lucide/svelte/icons/square';
  import { onDestroy } from 'svelte';
  import { i18n, t } from '$lib/i18n/index.svelte';
  import { downloadBlob } from '$lib/platform/clipboard';
  import { MorseTransmitter, renderWav } from '$lib/platform/morse-audio';
  import type { ToolSession } from '$lib/state/session.svelte';

  let { session }: { session: ToolSession } = $props();

  let wpm = $state(20);
  let effective = $state(20);
  let frequency = $state(640);
  let volume = $state(0.5);
  let playing = $state(false);
  let lamp = $state(false);

  const transmitter = new MorseTransmitter();
  const code = $derived(session.direction === 'decode' ? session.input : session.output);
  const hasCode = $derived(/[.\-•·−—]/.test(code));
  const options = $derived({ wpm, effectiveWpm: Math.min(effective, wpm), frequency, volume });

  function toggle() {
    if (playing) {
      transmitter.stop();
      playing = false;
      lamp = false;
      return;
    }
    playing = true;
    transmitter.play(
      code,
      options,
      (on) => (lamp = on),
      () => (playing = false),
    );
  }

  function download() {
    downloadBlob(renderWav(code, options), 'eleet-morse.wav');
  }

  onDestroy(() => transmitter.stop());
</script>

<section class="panel" aria-labelledby="morse-player">
  <header class="panel-header">
    <h2 class="panel-title" id="morse-player">
      <Radio aria-hidden="true" />{t('views.morse.title')}
    </h2>
  </header>
  <div class="panel-body body">
    <div class="lamp-wrap">
      <span class="lamp" class:on={lamp} role="img" aria-label={t('views.morse.light')}></span>
      <div class="buttons">
        <button class="btn btn-primary" onclick={toggle} disabled={!hasCode && !playing}>
          {#if playing}<Square aria-hidden="true" />{t('views.morse.stop')}{:else}<Play
              aria-hidden="true"
              class="flip-rtl"
            />{t('views.morse.play')}{/if}
        </button>
        <button class="btn" onclick={download} disabled={!hasCode}>
          <Download aria-hidden="true" />{t('views.morse.download')}
        </button>
      </div>
    </div>
    <div class="controls">
      <label class="field">
        <span class="field-label"
          >{t('views.morse.wpm')}<output class="field-value"
            >{t('views.morse.unit', { n: wpm })}</output
          ></span
        >
        <input class="range" type="range" min="5" max="45" bind:value={wpm} />
      </label>
      <label class="field">
        <span class="field-label"
          >{t('views.morse.farnsworth')}<output class="field-value"
            >{t('views.morse.unit', { n: Math.min(effective, wpm) })}</output
          ></span
        >
        <input class="range" type="range" min="5" max="45" bind:value={effective} />
      </label>
      <label class="field">
        <span class="field-label"
          >{t('views.morse.tone')}<output class="field-value">{i18n.number(frequency)} Hz</output
          ></span
        >
        <input class="range" type="range" min="300" max="1200" step="10" bind:value={frequency} />
      </label>
      <label class="field">
        <span class="field-label"
          >{t('views.morse.volume')}<output class="field-value"
            >{i18n.number(Math.round(volume * 100))}%</output
          ></span
        >
        <input class="range" type="range" min="0.05" max="1" step="0.05" bind:value={volume} />
      </label>
    </div>
  </div>
</section>

<style>
  .body {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-5);
    align-items: center;
  }

  .lamp-wrap {
    display: grid;
    justify-items: center;
    gap: var(--space-3);
  }

  .lamp {
    inline-size: 5.5rem;
    block-size: 5.5rem;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, oklch(0.4 0.01 70), oklch(0.2 0.008 70));
    box-shadow:
      inset 0 3px 10px oklch(0 0 0 / 0.6),
      0 0 0 6px var(--surface-3);
    transition:
      background 30ms linear,
      box-shadow 30ms linear;
  }

  .lamp.on {
    /* An Aldis signal lamp: incandescent white-gold, not a screen glow. */
    background: radial-gradient(circle at 35% 30%, oklch(0.99 0.03 95), oklch(0.86 0.13 80));
    box-shadow:
      0 0 26px oklch(0.86 0.13 80 / 0.85),
      0 0 70px oklch(0.86 0.13 80 / 0.4),
      0 0 0 6px var(--surface-3);
  }

  .buttons {
    display: flex;
    gap: var(--space-2);
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
    gap: var(--space-3) var(--space-5);
  }

  .range {
    inline-size: 100%;
    accent-color: var(--accent);
  }

  @media (max-width: 640px) {
    .body {
      grid-template-columns: 1fr;
    }
  }
</style>
