<!-- A run of dossier text with `*emphasis*` rendered as <em>, never as HTML. -->
<script lang="ts">
  import { inline } from '$lib/content/inline';

  let { text }: { text: string } = $props();
  const segments = $derived(inline(text));
</script>

{#each segments as segment, i (i)}{#if segment.em}<em>{segment.text}</em
    >{:else}{segment.text}{/if}{/each}
