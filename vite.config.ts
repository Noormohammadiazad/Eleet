/**
 * Build configuration for Eleet.
 *
 * - Svelte 5 (runes) compiled by @sveltejs/vite-plugin-svelte.
 * - `base: './'` produces relative URLs, so the same build works on the custom
 *   domain (https://eleet.ir) and on a project sub-path (user.github.io/Eleet).
 * - Two in-house plugins harden and enhance the static output:
 *   a Content-Security-Policy injector and an offline service-worker generator.
 * - Vitest shares this config; engine tests run in plain Node (no DOM needed).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import { contentSecurityPolicy } from './tooling/csp.ts';
import { serviceWorker } from './tooling/service-worker.ts';

const r = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const pkg = JSON.parse(readFileSync(r('./package.json'), 'utf8')) as { version: string };

export default defineConfig({
  base: './',
  plugins: [svelte(), contentSecurityPolicy(), serviceWorker()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      $engine: r('./src/engine'),
      $lib: r('./src/lib'),
      $components: r('./src/components'),
    },
  },
  worker: {
    format: 'es',
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    assetsInlineLimit: 0,
    cssMinify: true,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    reporters: ['default'],
  },
});
