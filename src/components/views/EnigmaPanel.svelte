<!--
  A visual Enigma machine: reflector, three rotors with ring settings and
  thumb-wheel start positions, a plugboard, live rotor windows and a lampboard
  that lights the last enciphered letter. Bound to the same option keys as the
  generic form, so share links and pipelines stay compatible.
-->
<script lang="ts">
  import { slidingIndicator } from '$lib/ui/attachments';
  import ChevronDown from '@lucide/svelte/icons/chevron-down';
  import ChevronUp from '@lucide/svelte/icons/chevron-up';
  import Dices from '@lucide/svelte/icons/dices';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import {
    EnigmaMachine,
    ROTOR_NAMES,
    settingsFromOptions,
  } from '$engine/transforms/ciphers/enigma';
  import type { OptionSpec } from '$engine/core/types';
  import { t } from '$lib/i18n/index.svelte';
  import type { ToolSession } from '$lib/state/session.svelte';
  import OptionControl from '$components/workbench/OptionControl.svelte';

  let { session }: { session: ToolSession } = $props();

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LAMP_ROWS = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML'];
  const slots = [1, 2, 3] as const;
  const slotLabel = {
    1: 'views.enigma.left',
    2: 'views.enigma.middle',
    3: 'views.enigma.right',
  } as const;

  const o = $derived(session.options as Record<string, string>);
  const spec = (key: string) => session.tool.options.find((s) => s.key === key) as OptionSpec;

  /** Machine state after typing the current input: window letters and the last lamp. */
  const live = $derived.by(() => {
    try {
      const machine = new EnigmaMachine(settingsFromOptions(o as never));
      const lit = machine.process(session.input.slice(-5000), false);
      return { windows: machine.windows, lamp: lit.at(-1) ?? null, ok: true };
    } catch {
      return { windows: '···', lamp: null, ok: false };
    }
  });

  function shift(key: string, delta: number) {
    const i = LETTERS.indexOf(o[key] ?? 'A');
    session.setOption(key, LETTERS[(i + delta + 26) % 26]!);
  }

  function randInt(n: number): number {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0]! % n;
  }

  function shuffle<T>(items: readonly T[]): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = randInt(i + 1);
      [out[i], out[j]] = [out[j]!, out[i]!];
    }
    return out;
  }

  /** Random daily key: three distinct rotors, rings, start positions and ten plugboard cables. */
  function randomize() {
    const rotors = shuffle(ROTOR_NAMES);
    slots.forEach((slot, i) => {
      session.setOption(`rotor${slot}`, rotors[i]!);
      session.setOption(`ring${slot}`, LETTERS[randInt(26)]!);
      session.setOption(`pos${slot}`, LETTERS[randInt(26)]!);
    });
    const letters = shuffle([...LETTERS]);
    const pairs = Array.from({ length: 10 }, (_, i) => letters[2 * i]! + letters[2 * i + 1]!);
    session.setOption('plugboard', pairs.join(' '));
    session.setOption('reflector', randInt(2) ? 'B' : 'C');
  }
</script>

<section class="panel enigma" aria-labelledby="enigma-title">
  <header class="panel-header">
    <h2 class="panel-title" id="enigma-title">{t('views.enigma.machine')}</h2>
    <div class="tools">
      <button class="btn btn-ghost btn-sm" onclick={randomize}
        ><Dices aria-hidden="true" />{t('views.enigma.random')}</button
      >
      <button class="btn btn-ghost btn-sm" onclick={() => session.resetOptions()}>
        <RotateCcw aria-hidden="true" />{t('workbench.resetOptions')}
      </button>
    </div>
  </header>

  <div class="panel-body body">
    <div class="machine" dir="ltr">
      <div class="reflector">
        <span class="caps">{t('views.enigma.reflector')}</span>
        <div
          class="segmented"
          role="radiogroup"
          aria-label={t('views.enigma.reflector')}
          {@attach slidingIndicator}
        >
          {#each ['A', 'B', 'C'] as r (r)}
            <button
              role="radio"
              aria-checked={o.reflector === r}
              onclick={() => session.setOption('reflector', r)}>UKW-{r}</button
            >
          {/each}
        </div>
      </div>

      {#each slots as slot (slot)}
        <div class="rotor">
          <span class="caps">{t(slotLabel[slot])}</span>
          <select
            class="select mono"
            aria-label="{t('views.enigma.rotors')} — {t(slotLabel[slot])}"
            value={o[`rotor${slot}`]}
            onchange={(e) => session.setOption(`rotor${slot}`, e.currentTarget.value)}
          >
            {#each ROTOR_NAMES as name (name)}<option value={name}>{name}</option>{/each}
          </select>
          <div
            class="wheel"
            role="group"
            aria-label="{t('views.enigma.start')} — {t(slotLabel[slot])}"
          >
            <button
              class="btn btn-ghost btn-icon btn-sm"
              aria-label="+1"
              onclick={() => shift(`pos${slot}`, 1)}
            >
              <ChevronUp aria-hidden="true" />
            </button>
            <span class="window" aria-live="polite">{o[`pos${slot}`]}</span>
            <button
              class="btn btn-ghost btn-icon btn-sm"
              aria-label="−1"
              onclick={() => shift(`pos${slot}`, -1)}
            >
              <ChevronDown aria-hidden="true" />
            </button>
          </div>
          <label class="ring">
            <span class="muted ring-label">{t('views.enigma.rings')}</span>
            <select
              class="select mono"
              aria-label="{t('views.enigma.rings')} — {t(slotLabel[slot])}"
              value={o[`ring${slot}`]}
              onchange={(e) => session.setOption(`ring${slot}`, e.currentTarget.value)}
            >
              {#each LETTERS as l, i (l)}<option value={l}
                  >{l} · {String(i + 1).padStart(2, '0')}</option
                >{/each}
            </select>
          </label>
        </div>
      {/each}

      <div class="status">
        <span class="caps">{t('views.enigma.windows')}</span>
        <span class="windows" class:bad={!live.ok}>{live.windows}</span>
      </div>
    </div>

    <div class="lampboard" dir="ltr" aria-label={t('views.enigma.lampboard')} role="img">
      {#each LAMP_ROWS as row (row)}
        <div class="lamp-row">
          {#each row as letter (letter)}
            <span class="lamp" class:lit={live.lamp === letter}>{letter}</span>
          {/each}
        </div>
      {/each}
    </div>

    <div class="grid">
      <OptionControl
        toolId="enigma"
        spec={spec('plugboard')}
        value={session.options.plugboard}
        onchange={(v) => session.setOption('plugboard', v)}
      />
      <OptionControl
        toolId="enigma"
        spec={spec('format')}
        value={session.options.format}
        onchange={(v) => session.setOption('format', v)}
      />
    </div>
    <p class="muted note">{t('views.enigma.reciprocal')}</p>
  </div>
</section>

<style>
  .tools {
    display: flex;
    gap: var(--space-1);
  }

  .body {
    display: grid;
    gap: var(--space-4);
  }

  .machine {
    display: grid;
    grid-template-columns: auto repeat(3, minmax(6.5rem, 1fr)) auto;
    gap: var(--space-3);
    align-items: stretch;
    padding: var(--space-4);
    border-radius: var(--radius);
    background: linear-gradient(180deg, oklch(0.3 0.02 60 / 0.35), transparent), var(--surface-2);
    border: 1px solid var(--border);
    overflow-x: auto;
  }

  .reflector,
  .rotor,
  .status {
    display: grid;
    gap: var(--space-2);
    align-content: start;
    justify-items: center;
    text-align: center;
  }

  .reflector .segmented {
    flex-direction: column;
  }

  .rotor {
    padding: var(--space-2);
    border-radius: var(--radius);
    background: var(--surface-1);
    border: 1px solid var(--border);
  }

  .wheel {
    display: grid;
    justify-items: center;
  }

  .window {
    display: grid;
    place-items: center;
    inline-size: 3rem;
    block-size: 3.2rem;
    border-radius: var(--radius-sm);
    background: linear-gradient(
      180deg,
      oklch(0.94 0.02 90),
      oklch(0.84 0.03 85) 50%,
      oklch(0.94 0.02 90)
    );
    color: oklch(0.2 0.02 60);
    font-family: var(--font-mono);
    font-size: 1.6rem;
    font-weight: 800;
    box-shadow:
      inset 0 3px 6px oklch(0 0 0 / 0.35),
      0 0 0 3px var(--border-strong);
  }

  .ring {
    display: grid;
    gap: 2px;
    inline-size: 100%;
    font-size: var(--text-xs);
  }

  .ring-label {
    overflow: hidden;
    font-size: 0.6875rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .select {
    min-block-size: 2rem;
    padding-block: 0.2rem;
    font-size: var(--text-sm);
  }

  .windows {
    font-family: var(--font-mono);
    font-size: 1.4rem;
    font-weight: 800;
    letter-spacing: 0.25em;
    color: var(--accent);
  }

  .windows.bad {
    color: var(--danger);
  }

  .lampboard {
    display: grid;
    gap: var(--space-2);
    justify-content: center;
    padding: var(--space-4);
    border-radius: var(--radius);
    background: oklch(0.14 0.01 265);
  }

  .lamp-row {
    display: flex;
    justify-content: center;
    gap: var(--space-2);
  }

  .lamp {
    display: grid;
    place-items: center;
    inline-size: 2.2rem;
    block-size: 2.2rem;
    border-radius: 50%;
    background: oklch(0.26 0.01 265);
    color: oklch(0.55 0.02 265);
    font-family: var(--font-mono);
    font-weight: 700;
    box-shadow: inset 0 2px 4px oklch(0 0 0 / 0.6);
    transition:
      background var(--fast) var(--ease),
      color var(--fast) var(--ease),
      box-shadow var(--fast) var(--ease);
  }

  .lamp.lit {
    background: oklch(0.9 0.16 90);
    color: oklch(0.25 0.05 70);
    box-shadow:
      0 0 18px oklch(0.9 0.16 90 / 0.8),
      0 0 40px oklch(0.85 0.16 80 / 0.4);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
    gap: var(--space-4);
  }

  .note {
    font-size: var(--text-xs);
  }

  @media (max-width: 720px) {
    .machine {
      grid-template-columns: repeat(3, minmax(6rem, 1fr));
    }

    .reflector,
    .status {
      grid-column: 1 / -1;
    }

    .reflector .segmented {
      flex-direction: row;
    }

    .lamp {
      inline-size: 1.7rem;
      block-size: 1.7rem;
      font-size: var(--text-xs);
    }

    .lamp-row {
      gap: 4px;
    }
  }
</style>
