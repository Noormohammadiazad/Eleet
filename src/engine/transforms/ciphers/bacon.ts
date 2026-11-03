/**
 * Bacon's cipher (Francis Bacon, 1605) — each letter becomes a group of five
 * binary symbols. Bacon's real insight was steganographic: the two symbols can
 * be *any* two visually distinct forms, e.g. two typefaces. The `case` mode
 * reproduces that idea by hiding the message in the upper/lower case of an
 * innocent cover text.
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';

const ALPHABET_26 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALPHABET_24 = 'ABCDEFGHIKLMNOPQRSTUWXYZ'; // I=J, U=V
/** Terminator group used by case-steganography (never a valid letter). */
const END = 31;

type Variant = 'modern' | 'classic';

function alphabetOf(variant: Variant): string {
  return variant === 'classic' ? ALPHABET_24 : ALPHABET_26;
}

function letterValue(ch: string, variant: Variant): number {
  let upper = ch.toUpperCase();
  if (variant === 'classic') upper = upper.replace('J', 'I').replace('V', 'U');
  return alphabetOf(variant).indexOf(upper);
}

function bits(value: number): number[] {
  return [4, 3, 2, 1, 0].map((s) => (value >> s) & 1);
}

function encodeSymbols(text: string, variant: Variant, a: string, b: string): string {
  const words = text.split(/\s+/).filter(Boolean);
  return words
    .map((word) =>
      [...word]
        .map((ch) => letterValue(ch, variant))
        .filter((v) => v >= 0)
        .map((v) =>
          bits(v)
            .map((bit) => (bit ? b : a))
            .join(''),
        )
        .join(' '),
    )
    .filter(Boolean)
    .join(' / ');
}

function decodeSymbols(text: string, variant: Variant, a: string, b: string): string {
  const alphabet = alphabetOf(variant);
  const same = (x: string, y: string) => x.toLowerCase() === y.toLowerCase();
  let out = '';
  let acc: number[] = [];
  for (const ch of text) {
    if (ch === '/' || ch === '|') {
      acc = [];
      if (out && !out.endsWith(' ')) out += ' ';
      continue;
    }
    if (same(ch, a)) acc.push(0);
    else if (same(ch, b)) acc.push(1);
    else continue;
    if (acc.length === 5) {
      const value = acc.reduce((n, bit) => n * 2 + bit, 0);
      out += alphabet[value] ?? '?';
      acc = [];
    }
  }
  return out.trim();
}

function encodeCase(secret: string, cover: string, variant: Variant): string {
  const values = [...secret].map((ch) => letterValue(ch, variant)).filter((v) => v >= 0);
  if (!values.length) throw new TransformError('secretRequired');
  const available = (cover.match(/[A-Za-z]/g) ?? []).length;
  const needed = values.length * 5;
  if (available < needed) throw new TransformError('coverRequired', { needed, available });
  // A terminator group marks the end when the cover has room for one more full group.
  // Without room, any leftover cover letters form an incomplete group that decoding ignores —
  // which is how Bacon's own example fits "FUGE" into the 23 letters of its cover.
  const stream = (available - needed >= 5 ? [...values, END] : values).flatMap(bits);
  let i = 0;
  let out = '';
  for (const ch of cover) {
    if (/[A-Za-z]/.test(ch) && i < stream.length)
      out += stream[i++] ? ch.toUpperCase() : ch.toLowerCase();
    else out += /[A-Za-z]/.test(ch) ? ch.toLowerCase() : ch;
  }
  return out;
}

function decodeCase(text: string, variant: Variant): string {
  const alphabet = alphabetOf(variant);
  const letters = text.match(/[A-Za-z]/g) ?? [];
  let out = '';
  for (let i = 0; i + 5 <= letters.length; i += 5) {
    const value = letters
      .slice(i, i + 5)
      .reduce((n, ch) => n * 2 + (ch === ch.toUpperCase() ? 1 : 0), 0);
    if (value >= alphabet.length) break;
    out += alphabet[value];
  }
  if (!out) throw new TransformError('nothingHidden');
  return out;
}

export const bacon = defineTransform({
  kind: 'transform',
  id: 'bacon',
  category: 'steganography',
  keywords: ['bacon', 'baconian', 'biliteral', 'steganography', 'بیکن'],
  sample: { encode: 'Knowledge is power' },
  options: [
    opt.select('mode', ['symbols', 'case'], 'symbols', { control: 'segmented' }),
    opt.select('variant', ['modern', 'classic'], 'modern', { control: 'segmented' }),
    opt.text('symbolA', 'A', { maxLength: 1, monospace: true, when: (v) => v.mode === 'symbols' }),
    opt.text('symbolB', 'B', { maxLength: 1, monospace: true, when: (v) => v.mode === 'symbols' }),
    opt.text(
      'cover',
      'Francis Bacon devised this biliteral alphabet so that any two typefaces, or simply two letter cases, could carry a secret message hidden in plain sight within an ordinary looking letter.',
      { multiline: true, directions: ['encode'], when: (v) => v.mode === 'case' },
    ),
  ],
  encode: (input, o) => {
    if (o.mode === 'case') return encodeCase(input, o.cover, o.variant);
    if (!o.symbolA || !o.symbolB || o.symbolA.toLowerCase() === o.symbolB.toLowerCase()) {
      throw new TransformError('invalidInput', { detail: 'A ≠ B' });
    }
    return encodeSymbols(input, o.variant, o.symbolA, o.symbolB);
  },
  decode: (input, o) =>
    o.mode === 'case'
      ? decodeCase(input, o.variant)
      : decodeSymbols(input, o.variant, o.symbolA || 'A', o.symbolB || 'B'),
});
