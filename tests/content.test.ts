import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { sanitizeOptions } from '$engine/core/options';
import { CATEGORY_IDS } from '$engine/core/types';
import { getTool, TOOLS } from '$engine/registry';
import { ARCHIVE } from '$lib/content/archive';
import { ARCHIVE_MEDIA, type ArchiveId } from '$lib/content/archive-media';
import { hasDossier, loadDossier, PLATES } from '$lib/content/dossiers';
import { inline } from '$lib/content/inline';
import type { Dossier } from '$lib/content/types';
import { catalogueNumber, ERAS, roman } from '$lib/ui/catalogue';
import { FALLBACK_GLYPH, glyphFor } from '$lib/ui/glyphs';
import { parseRoute } from '$lib/state/router.svelte';
import { precacheable } from '../tooling/service-worker';
import { renditionWidths } from '../tooling/build-archive';
import { analyze, run } from './helpers';

const DOSSIER_TOOLS = TOOLS.map((t) => t.id).filter(hasDossier);

describe('routing', () => {
  it('treats the bare address as the overview', () => {
    for (const hash of ['', '#', '#/'])
      expect(parseRoute(hash)).toEqual({ tool: null, share: null, unknown: false });
  });

  it('routes tools and share payloads, and flags unknown pages', () => {
    expect(parseRoute('#/scytale')).toEqual({ tool: 'scytale', share: null, unknown: false });
    expect(parseRoute('#/leet?s=zAbc')).toEqual({ tool: 'leet', share: 'zAbc', unknown: false });
    expect(parseRoute('#/no-such-tool')).toEqual({ tool: null, share: null, unknown: true });
  });
});

describe('catalogue', () => {
  it('draws a dedicated glyph for every instrument', () => {
    for (const tool of TOOLS) expect(glyphFor(tool.id), tool.id).not.toBe(FALLBACK_GLYPH);
  });

  it('numbers drawers in roman numerals and tools uniquely', () => {
    expect(CATEGORY_IDS.map((_, i) => roman(i + 1))).toEqual([
      'I',
      'II',
      'III',
      'IV',
      'V',
      'VI',
      'VII',
      'VIII',
      'IX',
      'X',
    ]);
    const numbers = TOOLS.map(catalogueNumber);
    expect(new Set(numbers).size).toBe(numbers.length);
    expect(catalogueNumber(getTool('scytale')!)).toBe('II.1');
  });

  it('fills every drawer and dates only real tools', () => {
    for (const category of CATEGORY_IDS)
      expect(
        TOOLS.some((t) => t.category === category),
        category,
      ).toBe(true);
    for (const id of Object.keys(ERAS)) expect(getTool(id), id).toBeDefined();
  });
});

describe('archive', () => {
  const ids = Object.keys(ARCHIVE_MEDIA) as ArchiveId[];

  it('records provenance and a public-domain or CC0 licence for every image', () => {
    for (const id of ids) {
      const record = ARCHIVE[id];
      expect(record.license === 'pd' || record.license === 'cc0', id).toBe(true);
      expect(record.source, id).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(record.title.en && record.title.fa, id).toBeTruthy();
    }
  });

  it('ships every rendition it advertises', () => {
    for (const id of ids)
      for (const width of ARCHIVE_MEDIA[id].widths)
        for (const ext of ['avif', 'webp'])
          expect(existsSync(`public/archive/${id}-${width}.${ext}`), `${id}-${width}.${ext}`).toBe(
            true,
          );
  });

  it('keeps archive images and rare font subsets out of the precache', () => {
    expect(precacheable('archive/enigma-keylist-960.avif')).toBe(false);
    expect(precacheable('assets/newsreader-latin-opsz-normal-abc123.woff2')).toBe(true);
    expect(precacheable('assets/newsreader-vietnamese-opsz-normal-abc123.woff2')).toBe(false);
    expect(precacheable('assets/vazirmatn-arabic-wght-normal-abc123.woff2')).toBe(true);
    expect(precacheable('assets/index-abc123.js')).toBe(true);
  });

  it('renders standard widths without upscaling', () => {
    expect(renditionWidths(1280)).toEqual([480, 960, 1280]);
    expect(renditionWidths(960)).toEqual([480, 960]);
    expect(renditionWidths(500)).toEqual([500]);
    expect(renditionWidths(4000)).toEqual([480, 960, 1440]);
  });
});

describe('dossiers', () => {
  it('belong to real tools and feature real plates', () => {
    expect(DOSSIER_TOOLS.length).toBeGreaterThanOrEqual(12);
    for (const plate of PLATES) {
      expect(hasDossier(plate.tool), plate.tool).toBe(true);
      expect(ARCHIVE_MEDIA[plate.image], plate.image).toBeDefined();
    }
  });

  it.each(DOSSIER_TOOLS)('%s is complete in both languages', async (id) => {
    const dossier = (await loadDossier(id)) as Dossier;
    expect(dossier.body.fa.length).toBe(dossier.body.en.length);
    for (const text of [dossier.headline, dossier.dek, ...dossier.dispatches.map((d) => d.body)]) {
      expect(text.en.trim() && text.fa.trim()).toBeTruthy();
      expect(/[؀-ۿ]/.test(text.fa), text.fa).toBe(true);
    }
    for (const paragraph of [...dossier.body.en, ...dossier.body.fa])
      expect((paragraph.match(/\*/g) ?? []).length % 2, paragraph).toBe(0);
    for (const figure of dossier.figures)
      if ('image' in figure) expect(ARCHIVE_MEDIA[figure.image], figure.image).toBeDefined();
  });

  it.each(DOSSIER_TOOLS)('%s dispatches load valid settings that run cleanly', async (id) => {
    const dossier = (await loadDossier(id)) as Dossier;
    const tool = getTool(id)!;
    for (const dispatch of dossier.dispatches) {
      if (!dispatch.load) continue;
      const { direction, input, options = {} } = dispatch.load;
      // Every option must survive sanitising unchanged: right keys, legal values.
      const clean = sanitizeOptions(tool.options, options, { includeSecrets: true });
      for (const [key, value] of Object.entries(options))
        expect(clean[key], `${id}.${key}`).toEqual(value);
      const output =
        tool.kind === 'analyzer'
          ? await analyze(id, input, options)
          : await run(id, direction, input, options);
      expect(output, dispatch.title.en).toBeTruthy();
    }
  });
});

describe('inline emphasis', () => {
  it('splits *emphasis* into segments and leaves everything else as text', () => {
    expect(inline('The *skytalē* of Sparta')).toEqual([
      { text: 'The ', em: false },
      { text: 'skytalē', em: true },
      { text: ' of Sparta', em: false },
    ]);
    expect(inline('<b>not html</b>')).toEqual([{ text: '<b>not html</b>', em: false }]);
  });
});
