/**
 * Rail fence — a transposition cipher that writes the message in a zig-zag
 * across N "rails" and reads it off row by row. Used in the American Civil War.
 * Operates on grapheme clusters, so emoji and Persian text survive intact.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { graphemes } from '../../util/text';

/** Rail index for each position of an n-length message. */
export function railPattern(length: number, rails: number, offset: number): number[] {
  const cycle = Math.max(1, 2 * (rails - 1));
  const out: number[] = [];
  for (let i = 0; i < length; i++) {
    const p = (i + offset) % cycle;
    out.push(p < rails ? p : cycle - p);
  }
  return out;
}

export function railEncode(text: string, rails: number, offset = 0): string {
  const chars = graphemes(text);
  if (rails < 2) return text;
  const pattern = railPattern(chars.length, rails, offset);
  const rows: string[][] = Array.from({ length: rails }, () => []);
  chars.forEach((ch, i) => rows[pattern[i]!]!.push(ch));
  return rows.flat().join('');
}

export function railDecode(text: string, rails: number, offset = 0): string {
  const chars = graphemes(text);
  if (rails < 2) return text;
  const pattern = railPattern(chars.length, rails, offset);
  const order = pattern
    .map((rail, i) => ({ rail, i }))
    .sort((a, b) => a.rail - b.rail || a.i - b.i);
  const out = new Array<string>(chars.length);
  order.forEach(({ i }, k) => (out[i] = chars[k]!));
  return out.join('');
}

export const railfence = defineTransform({
  kind: 'transform',
  id: 'railfence',
  category: 'transposition',
  keywords: ['rail fence', 'zigzag', 'transposition', 'نرده'],
  sample: { encode: 'WEAREDISCOVEREDFLEEATONCE', decode: 'WECRLTEERDSOEEFEAOCAIVDEN' },
  options: [
    opt.number('rails', 3, { min: 2, max: 12, step: 1, control: 'slider' }),
    opt.number('offset', 0, { min: 0, max: 21, step: 1, control: 'stepper' }),
  ],
  encode: (input, o) => railEncode(input, o.rails, o.offset),
  decode: (input, o) => railDecode(input, o.rails, o.offset),
});
