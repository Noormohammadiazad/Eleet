/**
 * Scytale (σκυτάλη) — the transposition device attributed to Sparta.
 *
 * A strip of leather or parchment is wound edge to edge around a rod and the
 * message is written along the rod, one row per face. Unwound, the strip shows
 * the letters in a different order; only a rod of the same thickness lines
 * them up again.
 *
 * Model: the rod carries `turns` letters per revolution (its "diameter"), so
 * the message is laid out in a grid of `turns` rows and ⌈n / turns⌉ columns,
 * written row by row and read column by column — one column per revolution of
 * the strip. When the length is not a multiple of the diameter, the last row is
 * short and the empty cells are simply skipped (they are blank strip, not
 * padding), so encoding and decoding are exact inverses for any length.
 *
 * Operates on grapheme clusters, so emoji and Persian text survive intact.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { graphemes } from '../../util/text';

export interface ScytaleLayout {
  /** Letters per revolution (rows of the grid, faces of the rod). */
  readonly rows: number;
  /** Revolutions of the strip (columns of the grid). */
  readonly columns: number;
}

export function scytaleLayout(length: number, diameter: number): ScytaleLayout {
  const rows = Math.max(1, Math.floor(diameter));
  return { rows, columns: Math.max(1, Math.ceil(length / rows)) };
}

/**
 * Strip order: for each position on the unwound strip, the index of the
 * plaintext character that lands there.
 */
export function scytaleOrder(length: number, diameter: number): number[] {
  const { rows, columns } = scytaleLayout(length, diameter);
  const order: number[] = [];
  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows; r++) {
      const k = r * columns + c;
      if (k < length) order.push(k);
    }
  }
  return order;
}

export function scytaleEncode(text: string, diameter: number): string {
  const chars = graphemes(text);
  return scytaleOrder(chars.length, diameter)
    .map((k) => chars[k]!)
    .join('');
}

export function scytaleDecode(text: string, diameter: number): string {
  const chars = graphemes(text);
  const out = new Array<string>(chars.length);
  scytaleOrder(chars.length, diameter).forEach((k, i) => (out[k] = chars[i]!));
  return out.join('');
}

export const scytale = defineTransform({
  kind: 'transform',
  id: 'scytale',
  category: 'transposition',
  keywords: ['scytale', 'skytale', 'sparta', 'rod', 'staff', 'transposition', 'اسکیتال', 'اسپارت'],
  sample: { encode: 'Iamhurtverybadlyhelp', decode: 'Iryyatbhmvaehedlurlp' },
  options: [opt.number('diameter', 4, { min: 2, max: 16, step: 1, control: 'slider' })],
  encode: (input, o) => scytaleEncode(input, o.diameter),
  decode: (input, o) => scytaleDecode(input, o.diameter),
});
