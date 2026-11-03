<!--
  Renders one option from its declarative spec: switch, slider, stepper,
  segmented radio group, dropdown, text field, textarea or secret field.
  Labels, choices and ids are derived from the spec and the i18n catalog.
-->
<script lang="ts">
  import { slidingIndicator } from '$lib/ui/attachments';
  import Dices from '@lucide/svelte/icons/dices';
  import Eye from '@lucide/svelte/icons/eye';
  import EyeOff from '@lucide/svelte/icons/eye-off';
  import Minus from '@lucide/svelte/icons/minus';
  import Plus from '@lucide/svelte/icons/plus';
  import type { OptionSpec, OptionValue } from '$engine/core/types';
  import { i18n, t } from '$lib/i18n/index.svelte';
  import { choiceLabel, optionLabel } from '$lib/i18n/tools';

  interface Props {
    toolId: string;
    spec: OptionSpec;
    value: OptionValue | undefined;
    onchange: (value: OptionValue) => void;
  }

  let { toolId, spec, value, onchange }: Props = $props();

  const id = $derived(`opt-${toolId}-${spec.key}`);
  const label = $derived(optionLabel(toolId, spec));
  let reveal = $state(false);

  function clamp(n: number): number {
    if (spec.type !== 'number') return n;
    return Math.min(spec.max, Math.max(spec.min, Number.isFinite(n) ? n : spec.default));
  }

  function step(delta: number) {
    if (spec.type !== 'number') return;
    onchange(clamp((value as number) + delta * (spec.step ?? 1)));
  }

  function randomSeed() {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    onchange(buffer[0]! % 1_000_000);
  }

  function radioKeys(event: KeyboardEvent, values: string[]) {
    const keys = i18n.dir === 'rtl' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowRight', 'ArrowLeft'];
    const current = values.indexOf(value as string);
    let next: number;
    if (event.key === keys[0] || event.key === 'ArrowDown') next = (current + 1) % values.length;
    else if (event.key === keys[1] || event.key === 'ArrowUp')
      next = (current - 1 + values.length) % values.length;
    else return;
    event.preventDefault();
    onchange(values[next]!);
    const group = (event.currentTarget as HTMLElement).closest('[role="radiogroup"]');
    queueMicrotask(() => group?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus());
  }
</script>

{#if spec.type === 'boolean'}
  <div class="field switch-field">
    <button
      {id}
      type="button"
      role="switch"
      aria-checked={value === true}
      class="switch"
      onclick={() => onchange(!(value === true))}
    >
      <span class="track" aria-hidden="true"><span class="thumb"></span></span>
      <span class="switch-label">{label}</span>
    </button>
  </div>
{:else if spec.type === 'number' && spec.control === 'slider'}
  <div class="field">
    <label class="field-label" for={id}>
      <span>{label}</span>
      <output class="field-value" for={id}>{i18n.number(value as number)}{spec.unit ?? ''}</output>
    </label>
    <input
      {id}
      class="slider"
      type="range"
      min={spec.min}
      max={spec.max}
      step={spec.step ?? 1}
      value={value as number}
      style:--fill="{(((value as number) - spec.min) / (spec.max - spec.min)) * 100}%"
      oninput={(e) => onchange(Number(e.currentTarget.value))}
    />
  </div>
{:else if spec.type === 'number'}
  <div class="field">
    <label class="field-label" for={id}><span>{label}</span></label>
    <div class="stepper">
      <button
        type="button"
        class="btn btn-ghost btn-icon btn-sm"
        aria-label="−"
        onclick={() => step(-1)}
      >
        <Minus aria-hidden="true" />
      </button>
      <input
        {id}
        class="input mono"
        type="number"
        inputmode="numeric"
        min={spec.min}
        max={spec.max}
        step={spec.step ?? 1}
        value={value as number}
        onchange={(e) => onchange(clamp(Number(e.currentTarget.value)))}
      />
      <button
        type="button"
        class="btn btn-ghost btn-icon btn-sm"
        aria-label="+"
        onclick={() => step(1)}
      >
        <Plus aria-hidden="true" />
      </button>
      {#if spec.randomizable}
        <button
          type="button"
          class="btn btn-ghost btn-icon btn-sm"
          aria-label={t('workbench.randomize')}
          title={t('workbench.randomize')}
          onclick={randomSeed}
        >
          <Dices aria-hidden="true" />
        </button>
      {/if}
    </div>
  </div>
{:else if spec.type === 'select' && (spec.control ?? (spec.choices.length <= 3 ? 'segmented' : 'dropdown')) === 'segmented'}
  {@const values = spec.choices.map((c) => c.value)}
  <div class="field" class:span-2={spec.choices.length > 3}>
    <span class="field-label" id="{id}-label"><span>{label}</span></span>
    <div
      class="segmented"
      role="radiogroup"
      aria-labelledby="{id}-label"
      {@attach slidingIndicator}
    >
      {#each spec.choices as choice (choice.value)}
        <button
          type="button"
          role="radio"
          aria-checked={value === choice.value}
          tabindex={value === choice.value ? 0 : -1}
          onclick={() => onchange(choice.value)}
          onkeydown={(e) => radioKeys(e, values)}
        >
          {choiceLabel(toolId, spec, choice)}
        </button>
      {/each}
    </div>
  </div>
{:else if spec.type === 'select'}
  <div class="field">
    <label class="field-label" for={id}><span>{label}</span></label>
    <select
      {id}
      class="select"
      value={value as string}
      onchange={(e) => onchange(e.currentTarget.value)}
    >
      {#each spec.choices as choice (choice.value)}
        <option value={choice.value}>{choiceLabel(toolId, spec, choice)}</option>
      {/each}
    </select>
  </div>
{:else if spec.type === 'text' && spec.multiline}
  <div class="field wide">
    <label class="field-label" for={id}><span>{label}</span></label>
    <textarea
      {id}
      class="input"
      class:mono={spec.monospace}
      rows="3"
      dir="auto"
      maxlength={spec.maxLength}
      value={value as string}
      oninput={(e) => onchange(e.currentTarget.value)}></textarea>
  </div>
{:else if spec.type === 'text'}
  <div class="field">
    <label class="field-label" for={id}><span>{label}</span></label>
    <div class="text-wrap">
      <input
        {id}
        class="input"
        class:mono={spec.monospace || spec.secret}
        type={spec.secret && !reveal ? 'password' : 'text'}
        dir="auto"
        maxlength={spec.maxLength}
        autocomplete={spec.secret ? 'new-password' : 'off'}
        spellcheck="false"
        value={value as string}
        oninput={(e) => onchange(e.currentTarget.value)}
      />
      {#if spec.secret}
        <button
          type="button"
          class="btn btn-ghost btn-icon btn-sm reveal"
          aria-label={reveal ? t('workbench.hide') : t('workbench.show')}
          aria-pressed={reveal}
          onclick={() => (reveal = !reveal)}
        >
          {#if reveal}<EyeOff aria-hidden="true" />{:else}<Eye aria-hidden="true" />{/if}
        </button>
      {/if}
    </div>
  </div>
{/if}

<style>
  .wide {
    grid-column: 1 / -1;
  }

  .span-2 {
    grid-column: span 2;
  }

  .span-2 .segmented {
    flex-wrap: nowrap;
    inline-size: 100%;
  }

  @media (max-width: 640px) {
    .span-2 {
      grid-column: 1 / -1;
    }

    .span-2 .segmented {
      flex-wrap: wrap;
    }
  }

  .switch-field {
    align-self: end;
  }

  .switch {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-block-size: 2.25rem;
    color: var(--text-2);
    font-size: var(--text-sm);
    font-weight: 550;
    text-align: start;
  }

  .track {
    position: relative;
    inline-size: 2.1rem;
    block-size: 1.25rem;
    flex: none;
    border-radius: 999px;
    background: var(--surface-3);
    border: 1px solid var(--border-strong);
    transition: background var(--fast) var(--ease);
  }

  .thumb {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 2px;
    inline-size: 0.85rem;
    block-size: 0.85rem;
    border-radius: 50%;
    background: var(--text-3);
    transform: translateY(-50%);
    transition:
      inset-inline-start var(--normal) var(--ease-spring),
      background var(--fast) var(--ease);
  }

  .switch[aria-checked='true'] .track {
    background: var(--accent);
    border-color: transparent;
  }

  .switch[aria-checked='true'] .thumb {
    inset-inline-start: calc(100% - 0.85rem - 2px);
    background: var(--accent-ink);
  }

  .switch[aria-checked='true'] {
    color: var(--text);
  }

  .slider {
    --fill: 50%;
    appearance: none;
    inline-size: 100%;
    block-size: 2.25rem;
    background: transparent;
    cursor: pointer;
  }

  .slider::-webkit-slider-runnable-track {
    block-size: 4px;
    border-radius: 4px;
    background: linear-gradient(to right, var(--accent) var(--fill), var(--surface-3) var(--fill));
  }

  :global([dir='rtl']) .slider::-webkit-slider-runnable-track {
    background: linear-gradient(to left, var(--accent) var(--fill), var(--surface-3) var(--fill));
  }

  .slider::-moz-range-track {
    block-size: 4px;
    border-radius: 4px;
    background: var(--surface-3);
  }

  .slider::-moz-range-progress {
    block-size: 4px;
    border-radius: 4px;
    background: var(--accent);
  }

  .slider::-webkit-slider-thumb {
    appearance: none;
    inline-size: 1.05rem;
    block-size: 1.05rem;
    margin-block-start: -0.4rem;
    border-radius: 50%;
    background: var(--surface-1);
    border: 2px solid var(--accent);
    box-shadow: var(--shadow-1);
    transition: transform var(--fast) var(--ease);
  }

  .slider::-moz-range-thumb {
    inline-size: 0.9rem;
    block-size: 0.9rem;
    border-radius: 50%;
    background: var(--surface-1);
    border: 2px solid var(--accent);
  }

  .slider:hover::-webkit-slider-thumb {
    transform: scale(1.15);
  }

  .slider:focus-visible {
    outline: none;
  }

  .slider:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px var(--accent-soft);
  }

  .stepper {
    display: flex;
    align-items: center;
    gap: 2px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-1);
    padding-inline: 2px;
  }

  .stepper .input {
    flex: 1;
    min-inline-size: 3.5rem;
    border: 0;
    background: transparent;
    text-align: center;
    box-shadow: none;
    appearance: textfield;
    -moz-appearance: textfield;
  }

  .stepper .input::-webkit-inner-spin-button,
  .stepper .input::-webkit-outer-spin-button {
    appearance: none;
    margin: 0;
  }

  .stepper:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .text-wrap {
    position: relative;
  }

  .text-wrap .input:has(+ .reveal) {
    padding-inline-end: 2.5rem;
  }

  .reveal {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-end: 0.2rem;
    transform: translateY(-50%);
  }
</style>
