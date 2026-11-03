/**
 * Leet encoder: word-level slang → morphology → per-letter glyph substitution
 * → case styling, all driven by a seeded PRNG so output is reproducible.
 */
import { createRng, pick } from '../../util/prng';
import { tokenizeWords } from '../../util/text';
import { resolveGlyphs, type GlyphMap, type LeetPreset } from './alphabet';
import { SLANG, applySuffixRules, restoreCase } from './slang';

export type LeetStrategy = 'first' | 'random' | 'cycle';
export type LeetCase = 'preserve' | 'lower' | 'upper' | 'alternate' | 'random';

export interface LeetEncodeOptions {
  readonly preset: LeetPreset;
  /** Percentage (0–100) of eligible letters that get substituted. */
  readonly density: number;
  readonly strategy: LeetStrategy;
  readonly slang: boolean;
  readonly suffixes: boolean;
  readonly caseMode: LeetCase;
  readonly seed: number;
  readonly custom: GlyphMap;
}

function transformWord(word: string, o: LeetEncodeOptions): string {
  const lower = word.toLowerCase();
  if (o.slang && Object.hasOwn(SLANG, lower)) return restoreCase(word, SLANG[lower]!);
  if (o.suffixes) {
    const morphed = applySuffixRules(lower);
    if (morphed !== lower) return restoreCase(word, morphed);
  }
  return word;
}

export function encodeLeet(input: string, o: LeetEncodeOptions): string {
  const rng = createRng(o.seed);
  const table = resolveGlyphs(o.preset, o.custom);
  const cursors = new Map<string, number>();
  const probability = Math.min(1, Math.max(0, o.density / 100));

  const text =
    o.slang || o.suffixes
      ? tokenizeWords(input)
          .map((token) => (token.word ? transformWord(token.text, o) : token.text))
          .join('')
      : input;

  let out = '';
  let parity = 0;
  for (const ch of text) {
    const lower = ch.toLowerCase();
    const glyphs = /^[a-z]$/.test(lower) ? table[lower] : undefined;
    if (glyphs?.length && (probability >= 1 || rng() < probability)) {
      if (o.strategy === 'first') out += glyphs[0];
      else if (o.strategy === 'random') out += pick(rng, glyphs);
      else {
        const i = cursors.get(lower) ?? 0;
        cursors.set(lower, i + 1);
        out += glyphs[i % glyphs.length];
      }
      continue;
    }
    if (!/\p{L}/u.test(ch)) {
      out += ch;
      continue;
    }
    switch (o.caseMode) {
      case 'lower':
        out += ch.toLowerCase();
        break;
      case 'upper':
        out += ch.toUpperCase();
        break;
      case 'alternate':
        out += parity++ % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase();
        break;
      case 'random':
        out += rng() < 0.5 ? ch.toLowerCase() : ch.toUpperCase();
        break;
      default:
        out += ch;
    }
  }
  return out;
}
