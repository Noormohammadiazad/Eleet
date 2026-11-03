/**
 * Polybius square (Polybius, *Histories*, c. 150 BC) — letters become their
 * row/column coordinates on a 5×5 grid. With ADFGX labels this is the first
 * stage of the German WWI ADFGX cipher; with digits it underlies the tap code
 * and many knock codes.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { keyedSquare } from './square';

const LABELS = { digits: '12345', letters: 'ABCDE', adfgx: 'ADFGX' } as const;

export const polybius = defineTransform({
  kind: 'transform',
  id: 'polybius',
  category: 'signals',
  keywords: ['polybius', 'square', 'adfgx', 'coordinates', 'پولیبیوس'],
  sample: { encode: 'Polybius square', decode: '35 34 31 54 12 24 45 43 / 43 41 45 11 42 15' },
  options: [
    opt.select('labels', ['digits', 'letters', 'adfgx'], 'digits', { control: 'segmented' }),
    opt.text('key', '', { monospace: true, maxLength: 64 }),
  ],
  encode: (input, o) => {
    const square = keyedSquare(o.key);
    const labels = LABELS[o.labels];
    return input
      .split(/\s+/)
      .map((word) =>
        [...word.toUpperCase().replace(/J/g, 'I')]
          .map((ch) => square.indexOf(ch))
          .filter((i) => i >= 0)
          .map((i) => labels[Math.floor(i / 5)]! + labels[i % 5]!)
          .join(' '),
      )
      .filter(Boolean)
      .join(' / ');
  },
  decode: (input, o) => {
    const square = keyedSquare(o.key);
    const labels = LABELS[o.labels];
    let out = '';
    let pending = -1;
    for (const raw of input.toUpperCase()) {
      if (raw === '/' || raw === '|') {
        pending = -1;
        if (out && !out.endsWith(' ')) out += ' ';
        continue;
      }
      const idx = labels.indexOf(raw);
      if (idx < 0) continue;
      if (pending < 0) pending = idx;
      else {
        out += square[pending * 5 + idx];
        pending = -1;
      }
    }
    return out.trim();
  },
});
