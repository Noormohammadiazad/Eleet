import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/vite-plugin-svelte').SvelteConfig} */
export default {
  // TypeScript inside <script lang="ts"> is stripped by Vite (Rolldown/Oxc); no extra preprocessors needed.
  preprocess: vitePreprocess(),
  compilerOptions: {
    // Runes mode everywhere: explicit, fine-grained reactivity with $state / $derived / $effect.
    runes: true,
  },
};
