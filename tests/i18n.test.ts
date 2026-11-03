import { describe, expect, it } from 'vitest';
import { ERROR_CODES } from '$engine/core/errors';
import { CATEGORY_IDS } from '$engine/core/types';
import { TOOLS } from '$engine/registry';
import { en } from '$lib/i18n/en';
import { fa } from '$lib/i18n/fa';

type Tree = { [key: string]: string | Tree };

function leaves(tree: Tree, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') out.set(path, value);
    else for (const [k, v] of leaves(value, path)) out.set(k, v);
  }
  return out;
}

const EN = leaves(en as unknown as Tree);
const FA = leaves(fa as unknown as Tree);
const placeholders = (s: string) =>
  [...new Set([...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();

describe('i18n catalogs', () => {
  it('have exactly the same keys', () => {
    expect([...FA.keys()].sort()).toEqual([...EN.keys()].sort());
  });

  it('have no empty strings', () => {
    for (const [key, value] of [...EN, ...FA]) expect(value.trim(), key).not.toBe('');
  });

  it('use the same interpolation placeholders in every language (plural forms included)', () => {
    for (const [key, value] of EN)
      expect(placeholders(FA.get(key)!), key).toEqual(placeholders(value));
  });

  it('write Persian text in Persian (no untranslated English prose)', () => {
    const untranslated = [...FA].filter(([key, value]) => {
      if (/choices|actions\.(encode|decode)$|\.name$|summary$/.test(key)) return false;
      const latinWords = value.match(/\b[a-z]{4,}\b/g) ?? [];
      return latinWords.length > 6 && !/[\u0600-\u06FF]/.test(value);
    });
    expect(untranslated.map(([k]) => k)).toEqual([]);
  });

  it('cover every category and error code', () => {
    for (const id of CATEGORY_IDS) {
      expect(EN.has(`categories.${id}`), id).toBe(true);
      expect(EN.has(`categoryNotes.${id}`), id).toBe(true);
    }
    for (const code of ERROR_CODES) expect(EN.has(`errors.${code}`), code).toBe(true);
  });
});

describe('tool metadata translations', () => {
  const resolves = (key: string, fallback: string) => EN.has(key) || EN.has(fallback);

  it.each(TOOLS.map((t) => t.id))('%s is fully translated', (id) => {
    const tool = TOOLS.find((t) => t.id === id)!;
    for (const field of ['name', 'summary', 'description'])
      expect(EN.has(`tools.${id}.${field}`), `${id}.${field}`).toBe(true);
    for (const spec of tool.options) {
      expect(
        resolves(`tools.${id}.options.${spec.key}`, `common.options.${spec.key}`),
        `${id} option ${spec.key}`,
      ).toBe(true);
      if (spec.type !== 'select') continue;
      for (const choice of spec.choices) {
        if (choice.label) continue;
        expect(
          resolves(
            `tools.${id}.choices.${spec.key}.${choice.value}`,
            `common.choices.${spec.key}.${choice.value}`,
          ),
          `${id} choice ${spec.key}.${choice.value}`,
        ).toBe(true);
      }
    }
  });
});
