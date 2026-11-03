import { describe, expect, it } from 'vitest';
import { defaultOptions } from '$engine/core/options';
import { leet, presetGlyphs } from '$engine/transforms/leet';
import type { InferOptions } from '$engine/core/types';

type LeetOptions = InferOptions<typeof leet.options>;
const base = defaultOptions(leet.options) as LeetOptions;
const enc = (text: string, o: Partial<LeetOptions> = {}) =>
  leet.encode(text, { ...base, ...o }, {}) as string;
const dec = (text: string, o: Partial<LeetOptions> = {}) =>
  Promise.resolve(leet.decode!(text, { ...base, ...o }, {}));

describe('leet encoder', () => {
  it('substitutes readable glyphs deterministically', () => {
    expect(enc('leet speak', { preset: 'readable' })).toBe('l337 5p34k');
  });

  it('maps i to 1 but keeps l as l in the default preset', () => {
    expect(enc('illegal lilies')).toBe('1ll394l l1l135');
  });

  it('never lets two letters share a glyph, or emits a plain letter as a glyph', () => {
    for (const preset of ['readable', 'classic', 'hardcore', 'cyrillic'] as const) {
      const owner = new Map<string, string>();
      for (const [letter, glyphs] of Object.entries(presetGlyphs(preset))) {
        for (const glyph of glyphs) {
          expect(owner.get(glyph) ?? letter, `${preset}: ${glyph}`).toBe(letter);
          expect(glyph).not.toMatch(/^[a-z]+$/i);
          owner.set(glyph, letter);
        }
      }
    }
  });

  it('uses multi-character art in hardcore mode', () => {
    expect(enc('hmm', { preset: 'hardcore' })).toBe('|-|' + '|\\/|' + '|\\/|');
  });

  it('respects density 0 as the identity', () => {
    expect(enc('Hello, World', { density: 0 })).toBe('Hello, World');
  });

  it('is reproducible for a given seed', () => {
    const o = { strategy: 'random', density: 60, seed: 42 } as const;
    expect(enc('The quick brown fox', o)).toBe(enc('The quick brown fox', o));
    expect(enc('The quick brown fox', o)).not.toBe(enc('The quick brown fox', { ...o, seed: 43 }));
  });

  it('applies slang and morphology', () => {
    expect(enc('the hacker owned you', { slang: true, density: 0 })).toBe('teh h4x0r pwn3d j00');
    expect(enc('gamers', { suffixes: true, density: 0 })).toBe('gamerz');
  });

  it('leaves non-Latin scripts and emoji untouched', () => {
    expect(enc('سلام 👋🏽 hi', { preset: 'readable' })).toBe('سلام 👋🏽 #1'.replace('#', 'h'));
  });

  it('supports custom glyph maps', () => {
    expect(enc('abc', { preset: 'custom', custom: { a: ['@'], c: ['©'] } })).toBe('@b©');
  });
});

describe('leet decoder', () => {
  it.each([
    ['h3ll0 w0rld', 'hello world'],
    ['1337 h4x0r', 'leet hacker'],
    ['|-|3|_|_0', 'hello'],
    ['l1k3', 'like'],
    ['\\/\\/|-|4+', 'what'],
    ['ph34r', 'fear'],
    ['teh n00bz', 'the noobs'],
    ['7h3 qu1ck br0wn f0x', 'the quick brown fox'],
  ])('decodes %s → %s', async (input, expected) => {
    expect(await dec(input, { slang: true })).toBe(expected);
  });

  it('round-trips classic leet of ordinary prose', async () => {
    const text = 'this is a simple message about secret codes';
    expect(await dec(enc(text, { preset: 'classic' }), { keepNumbers: false })).toBe(text);
  });

  it('round-trips hardcore leet', async () => {
    const text = 'welcome to the machine';
    expect(await dec(enc(text, { preset: 'hardcore' }))).toBe(text);
  });

  it('keeps standalone numbers when asked', async () => {
    expect(await dec('born in 1984', { keepNumbers: true })).toBe('born in 1984');
  });
});
