/**
 * Homoglyphs — characters from other scripts that are visually identical to
 * Latin letters (Cyrillic "а" U+0430 vs Latin "a" U+0061). They power IDN
 * homograph phishing (раураl.com), filter evasion and text fingerprinting.
 * Encoding swaps a controllable share of letters for look-alikes; decoding
 * folds every known confusable back to ASCII (a "skeleton", after Unicode
 * Technical Standard #39).
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { createRng, pick } from '../../util/prng';

/** Latin letter → visually confusable characters (Cyrillic, Greek, Armenian, Cherokee…). */
export const CONFUSABLES: Readonly<Record<string, readonly string[]>> = {
  a: ['а', 'ɑ'],
  c: ['с', 'ϲ'],
  d: ['ԁ'],
  e: ['е', 'ҽ'],
  g: ['ɡ'],
  h: ['һ'],
  i: ['і', 'ı'],
  j: ['ј'],
  k: ['κ'],
  l: ['ӏ', 'ⅼ'],
  n: ['ո'],
  o: ['о', 'ο', 'օ'],
  p: ['р', 'ρ'],
  q: ['ԛ'],
  s: ['ѕ'],
  u: ['ս', 'υ'],
  v: ['ѵ', 'ν'],
  w: ['ԝ'],
  x: ['х'],
  y: ['у'],
  z: ['ᴢ'],
  A: ['А', 'Α'],
  B: ['В', 'Β'],
  C: ['С', 'Ϲ'],
  D: ['Ꭰ'],
  E: ['Е', 'Ε'],
  F: ['Ϝ'],
  G: ['Ԍ'],
  H: ['Н', 'Η'],
  I: ['І', 'Ι'],
  J: ['Ј'],
  K: ['К', 'Κ'],
  L: ['Ꮮ'],
  M: ['М', 'Μ'],
  N: ['Ν'],
  O: ['О', 'Ο'],
  P: ['Р', 'Ρ'],
  Q: ['Ԛ'],
  R: ['Ꭱ'],
  S: ['Ѕ'],
  T: ['Т', 'Τ'],
  U: ['Ս'],
  V: ['Ѵ'],
  W: ['Ԝ'],
  X: ['Х', 'Χ'],
  Y: ['Ү', 'Υ'],
  Z: ['Ζ'],
};

export const SKELETON: ReadonlyMap<string, string> = new Map(
  Object.entries(CONFUSABLES)
    .filter(([latin]) => /[A-Za-z]/.test(latin))
    .flatMap(([latin, glyphs]) => glyphs.map((g) => [g, latin] as const)),
);

export function toSkeleton(text: string): string {
  let out = '';
  for (const ch of text) out += SKELETON.get(ch) ?? ch;
  return out;
}

export const homoglyph = defineTransform({
  kind: 'transform',
  id: 'homoglyph',
  category: 'steganography',
  keywords: [
    'homoglyph',
    'homograph',
    'confusable',
    'lookalike',
    'idn',
    'phishing',
    'cyrillic',
    'uts39',
  ],
  sample: { encode: 'Please verify your account at paypal.com' },
  options: [
    opt.number('density', 100, {
      min: 5,
      max: 100,
      step: 5,
      control: 'slider',
      unit: '%',
      directions: ['encode'],
    }),
    opt.seed({ directions: ['encode'] }),
  ],
  encode: (input, o) => {
    const rng = createRng(o.seed);
    let out = '';
    for (const ch of input) {
      const glyphs = /[A-Za-z]/.test(ch) ? CONFUSABLES[ch] : undefined;
      out += glyphs && rng() < o.density / 100 ? pick(rng, glyphs) : ch;
    }
    return out;
  },
  decode: (input) => toSkeleton(input),
  detect: (input) => {
    let confusable = 0;
    let latin = 0;
    for (const ch of input) {
      if (SKELETON.has(ch)) confusable++;
      else if (/[A-Za-z]/.test(ch)) latin++;
    }
    return confusable > 0 && latin > 0 ? 0.9 : 0;
  },
});
