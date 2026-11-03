<!--
  A 5×5 cipher square with coordinates: the Polybius square (no key), or the
  Playfair square for a keyword, whose letters are tinted.
-->
<script lang="ts">
  import { keyedSquare } from '$engine/transforms/ciphers/square';

  let { keyword = '', marks = [] }: { keyword?: string; marks?: string[] } = $props();

  const square = $derived(keyedSquare(keyword));
  const keyLetters = $derived(
    new Set(
      keyword
        .toUpperCase()
        .replace(/J/g, 'I')
        .replace(/[^A-Z]/g, ''),
    ),
  );
  const label = (ch: string) => (ch === 'I' ? 'I/J' : ch);
</script>

<table class="square" dir="ltr">
  <thead>
    <tr>
      <th></th>
      {#each [1, 2, 3, 4, 5] as n (n)}<th scope="col">{n}</th>{/each}
    </tr>
  </thead>
  <tbody>
    {#each [0, 1, 2, 3, 4] as row (row)}
      <tr>
        <th scope="row">{row + 1}</th>
        {#each [0, 1, 2, 3, 4] as col (col)}
          {@const ch = square[row * 5 + col]!}
          <td class:key={keyLetters.has(ch)} class:mark={marks.includes(ch)}>{label(ch)}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .square {
    margin-inline: auto;
    border-collapse: separate;
    border-spacing: 3px;
    font-family: var(--font-mono);
  }

  th {
    color: var(--rubric);
    font-family: var(--font-serif);
    font-size: var(--text-sm);
    font-style: italic;
    font-weight: 500;
    padding: 0.2rem 0.5rem;
  }

  td {
    inline-size: 2.6rem;
    block-size: 2.6rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface-1);
    text-align: center;
    font-size: var(--text-md);
    font-weight: 600;
  }

  td.key {
    background: var(--accent-soft);
    border-color: var(--accent-line);
    color: var(--accent);
  }

  td.mark {
    background: var(--rubric-soft);
    border-color: var(--rubric);
    color: var(--rubric);
  }

  @media (max-width: 420px) {
    td {
      inline-size: 2.1rem;
      block-size: 2.1rem;
      font-size: var(--text-sm);
    }
  }
</style>
