<!--
  Leet Studio: an editable A–Z glyph matrix. Each tile shows which glyphs a
  letter may become; opening a tile lets you toggle any known glyph (all four
  tiers) or add your own. The first active glyph is the "preferred" one.
  Editing a built-in preset forks it into the Custom preset.
-->
<script lang="ts">
  import Plus from '@lucide/svelte/icons/plus';
  import X from '@lucide/svelte/icons/x';
  import {
    LEET_ALPHABET,
    LEET_LETTERS,
    presetGlyphs,
    resolveGlyphs,
    type GlyphMap,
    type LeetPreset,
  } from '$engine/transforms/leet';
  import { t } from '$lib/i18n/index.svelte';
  import { choiceLabel } from '$lib/i18n/tools';
  import type { ToolSession } from '$lib/state/session.svelte';

  let { session }: { session: ToolSession } = $props();

  const preset = $derived(session.options.preset as LeetPreset);
  const table = $derived(resolveGlyphs(preset, session.options.custom as GlyphMap));
  let editing = $state<string | null>(null);
  let draft = $state('');

  function editable(): GlyphMap {
    if (preset === 'custom')
      return structuredClone($state.snapshot(session.options.custom) as GlyphMap);
    return structuredClone(presetGlyphs(preset));
  }

  function commit(map: GlyphMap) {
    session.setOption('custom', map);
    session.setOption('preset', 'custom');
  }

  function toggle(letter: string, glyph: string) {
    const map = editable();
    const list = map[letter] ?? [];
    map[letter] = list.includes(glyph) ? list.filter((g) => g !== glyph) : [...list, glyph];
    commit(map);
  }

  function makePreferred(letter: string, glyph: string) {
    const map = editable();
    map[letter] = [glyph, ...(map[letter] ?? []).filter((g) => g !== glyph)];
    commit(map);
  }

  function addCustom(letter: string) {
    const glyph = draft.trim();
    if (!glyph || glyph.length > 8) return;
    const map = editable();
    if (!(map[letter] ?? []).includes(glyph)) map[letter] = [...(map[letter] ?? []), glyph];
    commit(map);
    draft = '';
  }

  const candidates = (letter: string, active: string[]) => {
    const known = (LEET_ALPHABET[letter] ?? []).map(([g]) => g);
    return [...new Set([...active, ...known])];
  };
</script>

<div class="studio">
  <div class="head">
    <h3 class="caps">{t('views.leetStudio.title')}</h3>
    <p class="muted">{t('views.leetStudio.hint')}</p>
  </div>

  <div class="matrix" role="list" dir="ltr">
    {#each LEET_LETTERS as letter (letter)}
      {@const glyphs = table[letter] ?? []}
      <div class="tile-wrap" role="listitem">
        <button
          class="tile"
          class:active={editing === letter}
          class:empty={!glyphs.length}
          aria-expanded={editing === letter}
          aria-label={t('views.leetStudio.edit', { letter: letter.toUpperCase() })}
          onclick={() => (editing = editing === letter ? null : letter)}
        >
          <span class="letter">{letter.toUpperCase()}</span>
          <span class="glyph" dir="ltr">{glyphs[0] ?? '·'}</span>
          {#if glyphs.length > 1}<span class="more" dir="ltr">+{glyphs.length - 1}</span>{/if}
        </button>
      </div>
    {/each}
  </div>

  {#if editing}
    {@const letter = editing}
    {@const active = table[letter] ?? []}
    <div
      class="editor"
      role="group"
      aria-label={t('views.leetStudio.edit', { letter: letter.toUpperCase() })}
    >
      <div class="editor-head">
        <strong>{letter.toUpperCase()}</strong>
        <span class="muted">
          {active.length ? '' : t('views.leetStudio.none')}
        </span>
        <button
          class="btn btn-ghost btn-icon btn-sm close"
          aria-label={t('app.dismiss')}
          onclick={() => (editing = null)}
        >
          <X aria-hidden="true" />
        </button>
      </div>
      <div class="chips" dir="ltr">
        {#each candidates(letter, active) as glyph (glyph)}
          {@const on = active.includes(glyph)}
          <span class="glyph-chip" class:on class:preferred={active[0] === glyph}>
            <button
              class="toggle"
              aria-pressed={on}
              onclick={() => toggle(letter, glyph)}
              ondblclick={() => makePreferred(letter, glyph)}
              title={on ? t('views.leetStudio.remove', { glyph }) : glyph}
            >
              {glyph}
            </button>
          </span>
        {/each}
      </div>
      <form
        class="add"
        onsubmit={(e) => {
          e.preventDefault();
          addCustom(letter);
        }}
      >
        <input
          class="input mono"
          bind:value={draft}
          maxlength="8"
          dir="ltr"
          placeholder={t('views.leetStudio.addPlaceholder')}
          aria-label={t('views.leetStudio.add')}
        />
        <button class="btn" type="submit" disabled={!draft.trim()}>
          <Plus aria-hidden="true" />{t('views.leetStudio.add')}
        </button>
        {#if preset === 'custom'}
          <button
            type="button"
            class="btn btn-ghost"
            onclick={() => session.setOption('custom', presetGlyphs('classic'))}
          >
            {t('views.leetStudio.resetFrom', {
              preset: choiceLabel('leet', { key: 'preset' }, { value: 'classic' }),
            })}
          </button>
        {/if}
      </form>
    </div>
  {/if}
</div>

<style>
  .studio {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-4);
    border-block-start: 1px dashed var(--border);
  }

  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-1) var(--space-3);
  }

  .matrix {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(4.1rem, 1fr));
    gap: var(--space-2);
  }

  .tile {
    position: relative;
    display: grid;
    inline-size: 100%;
    padding: var(--space-2) var(--space-1) var(--space-1);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-2);
    text-align: center;
    transition:
      border-color var(--fast) var(--ease),
      transform var(--fast) var(--ease),
      background var(--fast) var(--ease);
  }

  .tile:hover {
    border-color: var(--accent);
    transform: translateY(-1px);
  }

  .tile.active {
    border-color: var(--accent);
    background: var(--accent-soft);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .tile.empty .glyph {
    color: var(--text-3);
  }

  .letter {
    color: var(--text-3);
    font-size: var(--text-xs);
    font-weight: 700;
    line-height: 1;
  }

  .glyph {
    font-feature-settings: 'calt' 0;
    overflow: hidden;
    color: var(--accent);
    font-family: var(--font-mono);
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1.6;
    white-space: nowrap;
    text-overflow: clip;
  }

  .more {
    position: absolute;
    inset-block-start: 0.2rem;
    inset-inline-end: 0.3rem;
    color: var(--text-3);
    font-size: 0.625rem;
    font-weight: 700;
  }

  .editor {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4) var(--space-4);
    border: 1px solid var(--accent);
    border-radius: var(--radius);
    background: var(--surface-1);
    animation: open var(--normal) var(--ease);
  }

  .editor-head {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .editor-head strong {
    display: grid;
    place-items: center;
    inline-size: 2rem;
    block-size: 2rem;
    border-radius: var(--radius-sm);
    background: var(--accent);
    color: var(--accent-ink);
    font-family: var(--font-mono);
  }

  .close {
    margin-inline-start: auto;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .toggle {
    font-feature-settings: 'calt' 0;
    min-inline-size: 2.5rem;
    min-block-size: 2.25rem;
    padding-inline: var(--space-3);
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius-sm);
    color: var(--text-3);
    font-family: var(--font-mono);
    font-size: var(--text-md);
    font-weight: 600;
    transition: all var(--fast) var(--ease);
  }

  .on .toggle {
    border-style: solid;
    border-color: var(--accent);
    background: var(--accent-soft);
    color: var(--text);
  }

  .preferred .toggle {
    background: var(--accent);
    color: var(--accent-ink);
  }

  .add {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .add .input {
    flex: 0 1 12rem;
  }

  @keyframes open {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
  }
</style>
