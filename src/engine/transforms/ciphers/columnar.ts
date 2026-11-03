/**
 * Columnar transposition — write the message in rows under a keyword, then
 * read the columns in the alphabetical order of the keyword's letters.
 * Irregular (unpadded) form, so any text round-trips losslessly. The basis of
 * the WWI German ADFGVX cipher and of many Cold War hand ciphers.
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { graphemes } from '../../util/text';

/** Column read order for a keyword: stable alphabetical ranking of its letters. */
export function columnOrder(key: string): number[] {
  const chars = Array.from(key.toUpperCase().replace(/\s/g, ''));
  if (!chars.length) throw new TransformError('keyRequired');
  return chars
    .map((ch, i) => ({ ch, i }))
    .sort((a, b) => (a.ch < b.ch ? -1 : a.ch > b.ch ? 1 : a.i - b.i))
    .map(({ i }) => i);
}

export function columnarEncodeWithOrder(chars: string[], order: number[]): string {
  const cols = order.length;
  let out = '';
  for (const c of order) for (let i = c; i < chars.length; i += cols) out += chars[i];
  return out;
}

export function columnarDecodeWithOrder(chars: string[], order: number[]): string {
  const cols = order.length;
  const rows = Math.ceil(chars.length / cols);
  const full = chars.length % cols || cols;
  const out = new Array<string>(chars.length);
  let k = 0;
  for (const c of order) {
    const height = c < full ? rows : rows - 1;
    for (let r = 0; r < height; r++) out[r * cols + c] = chars[k++]!;
  }
  return out.join('');
}

export const columnar = defineTransform({
  kind: 'transform',
  id: 'columnar',
  category: 'transposition',
  keywords: ['columnar', 'transposition', 'adfgvx', 'ستونی'],
  sample: { encode: 'WEAREDISCOVEREDFLEEATONCE', decode: 'EVLNACDTESEAROFODEECWIREE' },
  options: [
    opt.text('key', 'ZEBRAS', { monospace: true, maxLength: 64 }),
    opt.boolean('lettersOnly', false),
  ],
  encode: (input, o) => {
    const text = o.lettersOnly ? input.toUpperCase().replace(/[^A-Z]/g, '') : input;
    return columnarEncodeWithOrder(graphemes(text), columnOrder(o.key));
  },
  decode: (input, o) => {
    const text = o.lettersOnly ? input.toUpperCase().replace(/[^A-Z]/g, '') : input;
    return columnarDecodeWithOrder(graphemes(text), columnOrder(o.key));
  },
});
