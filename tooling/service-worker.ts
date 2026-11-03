/**
 * Vite plugin: offline-first service worker, generated at build time.
 *
 * Instead of pulling in a heavyweight PWA toolkit, this plugin inspects the final
 * Rollup/Rolldown bundle, derives a content hash from every emitted file and
 * writes a small, dependency-free `sw.js` that:
 *
 *  - precaches the application shell (HTML, JS chunks, CSS, core fonts, icons);
 *    archival images and rare font subsets are cached on first use instead;
 *  - serves navigations network-first (so a fresh deploy is picked up), falling
 *    back to the cached shell when offline;
 *  - serves every other same-origin GET cache-first (all assets are hashed);
 *  - waits for the page to send `SKIP_WAITING` before activating, so an open tab
 *    never mixes chunks from two different deployments.
 */
import { createHash } from 'node:crypto';
import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';

/** Public files that are pointless (or harmful) to precache. */
const PUBLIC_EXCLUDES = new Set(['CNAME', 'robots.txt', '.nojekyll', 'social-card.png']);

/**
 * Font subsets are split by `unicode-range`. Only the subsets that the English
 * and Persian interfaces actually render are precached; everything else
 * (Latin Extended, Cyrillic, Greek, Vietnamese…) is cached on first use.
 */
const PRECACHED_FONTS =
  /^(inter-latin-wght|jetbrains-mono-latin-wght|newsreader-latin-opsz|vazirmatn-arabic-wght|noto-naskh-arabic-arabic-wght)-/;

/**
 * Archival images are large and only matter to someone reading a dossier, so
 * they are cached when first viewed instead of being downloaded up front.
 */
export function precacheable(file: string): boolean {
  if (file.startsWith('archive/')) return false;
  if (!file.endsWith('.woff2')) return true;
  return PRECACHED_FONTS.test(file.split('/').pop()!);
}

function listFiles(dir: string, root = dir): string[] {
  let out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out = out.concat(listFiles(full, root));
    else out.push(relative(root, full).split(sep).join('/'));
  }
  return out;
}

function renderWorker(version: string, precache: string[]): string {
  return `/* Eleet service worker — generated at build time. Do not edit. */
const VERSION = ${JSON.stringify(version)};
const CACHE = 'eleet-' + VERSION;
const PRECACHE = ${JSON.stringify(precache)};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith('eleet-') && key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put('./', copy));
          return response;
        })
        .catch(() => caches.match('./').then((hit) => hit || caches.match('./index.html'))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((response) => {
          if (response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
`;
}

export function serviceWorker(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'eleet:service-worker',
    apply: 'build',
    enforce: 'post',
    configResolved(resolved) {
      config = resolved;
    },
    generateBundle(_options, bundle) {
      const hash = createHash('sha256');
      const files = Object.keys(bundle)
        .filter((file) => !file.endsWith('.map'))
        .sort();
      for (const file of files) {
        const item = bundle[file]!;
        hash.update(file);
        hash.update(item.type === 'chunk' ? item.code : item.source);
      }
      const publicFiles = config.publicDir
        ? listFiles(config.publicDir).filter((f) => !PUBLIC_EXCLUDES.has(f))
        : [];
      const precache = ['./', ...files, ...publicFiles]
        .filter((f) => f !== 'sw.js' && precacheable(f))
        .map((f) => (f === './' ? f : `./${f}`));
      const version = hash.digest('hex').slice(0, 12);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: renderWorker(version, precache) });
    },
  };
}
