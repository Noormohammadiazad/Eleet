<!-- Resolves a dossier diagram id to its drawing. -->
<script lang="ts">
  import type { DiagramId } from '$lib/content/types';
  import CaesarWheel from './diagrams/CaesarWheel.svelte';
  import LeetTable from './diagrams/LeetTable.svelte';
  import MorseFrequency from './diagrams/MorseFrequency.svelte';
  import ScytaleRod from './diagrams/ScytaleRod.svelte';
  import SquareGrid from './diagrams/SquareGrid.svelte';

  let { id }: { id: DiagramId } = $props();
</script>

<div class="diagram" data-diagram={id}>
  {#if id === 'caesar'}
    <CaesarWheel />
  {:else if id === 'scytale'}
    <ScytaleRod text="Iamhurtverybadlyhelp" diameter={4} />
  {:else if id === 'polybius'}
    <SquareGrid marks={['A', 'T']} />
  {:else if id === 'playfair'}
    <SquareGrid keyword="ROYAL NEW ZEALAND NAVY" />
  {:else if id === 'morse'}
    <MorseFrequency />
  {:else if id === 'leet'}
    <LeetTable />
  {/if}
</div>

<style>
  .diagram {
    padding: var(--space-4);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface-2);
  }
</style>
