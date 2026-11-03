<!-- The classic preset's preferred glyph for every letter; letters left as they are look faded. -->
<script lang="ts">
  import { presetGlyphs } from '$engine/transforms/leet';

  const table = presetGlyphs('classic');
  const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
</script>

<ul class="leet" dir="ltr">
  {#each LETTERS as letter (letter)}
    {@const glyph = table[letter]?.[0]}
    <li class:kept={!glyph} class:pair={letter === 'i' || letter === 'l'}>
      <span class="from">{letter}</span>
      <span class="to">{glyph ?? letter}</span>
    </li>
  {/each}
</ul>

<style>
  .leet {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(2.7rem, 1fr));
    gap: 4px;
    padding: 0;
    list-style: none;
  }

  li {
    display: grid;
    justify-items: center;
    gap: 0.1rem;
    padding: 0.35rem 0 0.4rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface-1);
  }

  .from {
    color: var(--text-3);
    font-family: var(--font-serif);
    font-size: var(--text-sm);
    font-style: italic;
  }

  .to {
    font-family: var(--font-mono);
    font-feature-settings: 'calt' 0;
    font-size: var(--text-lg);
    font-weight: 650;
  }

  .kept .to {
    color: var(--text-3);
    font-weight: 400;
  }

  .pair {
    border-color: var(--rubric);
    background: var(--rubric-soft);
  }
</style>
