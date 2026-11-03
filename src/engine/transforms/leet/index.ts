/**
 * Leet Speak — the flagship transform.
 *
 * Encoding is fully configurable (preset, density, glyph strategy, slang,
 * morphology, case styling, seed and a per-letter custom glyph matrix);
 * decoding uses the probabilistic beam-search decoder.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { LEET_PRESETS, presetGlyphs, type GlyphMap } from './alphabet';
import { decodeLeet } from './decoder';
import { encodeLeet } from './encoder';

export { LEET_ALPHABET, LEET_LETTERS, presetGlyphs, resolveGlyphs } from './alphabet';
export type { GlyphMap, LeetPreset, LeetTier } from './alphabet';

export const leet = defineTransform({
  kind: 'transform',
  id: 'leet',
  category: 'substitution',
  keywords: ['1337', 'l33t', 'leetspeak', 'eleet', 'hacker', 'h4x0r', 'لیت'],
  sample: {
    encode: 'Hackers are elite. Welcome to the underground, newbie!',
    decode: 'h4x0rz r 1337. w3lc0m3 2 73h und3r9r0und, n00b!',
  },
  options: [
    opt.select('preset', LEET_PRESETS, 'classic', {
      directions: ['encode'],
      control: 'segmented',
    }),
    opt.number('density', 100, {
      min: 0,
      max: 100,
      step: 5,
      control: 'slider',
      unit: '%',
      directions: ['encode'],
    }),
    opt.select('strategy', ['first', 'random', 'cycle'], 'first', {
      directions: ['encode'],
      control: 'segmented',
    }),
    opt.select('caseMode', ['preserve', 'lower', 'upper', 'alternate', 'random'], 'preserve', {
      directions: ['encode'],
    }),
    opt.boolean('slang', false),
    opt.boolean('suffixes', false, { directions: ['encode'] }),
    opt.boolean('keepNumbers', true, { directions: ['decode'] }),
    opt.seed({ directions: ['encode'] }),
    opt.json('custom', presetGlyphs('classic') as GlyphMap, { directions: ['encode'] }),
  ],
  encode: (input, o) => encodeLeet(input, o),
  decode: (input, o, ctx) => decodeLeet(input, o, ctx.signal),
  detect: (input) => {
    const digitsInWords = input.match(/[a-z]+[013457@$][a-z0-9@$]*/gi)?.length ?? 0;
    const words = input.match(/\S+/g)?.length ?? 1;
    return Math.min(1, digitsInWords / words);
  },
});
