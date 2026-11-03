/**
 * Tap code — the prisoners' knock code used by American POWs in the Hỏa Lò
 * prison ("Hanoi Hilton") during the Vietnam War. A 5×5 grid without K (C is
 * used instead): each letter is sent as <row> taps, a pause, <column> taps.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';

const GRID = 'ABCDEFGHIJLMNOPQRSTUVWXYZ';

export const tapcode = defineTransform({
  kind: 'transform',
  id: 'tapcode',
  category: 'signals',
  keywords: ['tap code', 'knock code', 'prison', 'pow', 'vietnam', 'polybius'],
  sample: { encode: 'Hello from the other side' },
  options: [opt.select('format', ['dots', 'digits'], 'dots', { control: 'segmented' })],
  encode: (input, o) =>
    input
      .split(/\s+/)
      .map((word) =>
        [...word.toUpperCase().replace(/K/g, 'C')]
          .map((ch) => GRID.indexOf(ch))
          .filter((i) => i >= 0)
          .map((i) => {
            const [row, col] = [Math.floor(i / 5) + 1, (i % 5) + 1];
            return o.format === 'dots' ? `${'.'.repeat(row)} ${'.'.repeat(col)}` : `${row}${col}`;
          })
          .join(o.format === 'dots' ? '  ' : ' '),
      )
      .filter(Boolean)
      .join(' / '),
  decode: (input, o) =>
    input
      .split(/\s*[/|]\s*/)
      .map((word) => {
        if (o.format === 'digits') {
          return (word.match(/[1-5]{2}/g) ?? [])
            .map((pair) => GRID[(Number(pair[0]) - 1) * 5 + Number(pair[1]) - 1] ?? '')
            .join('');
        }
        const groups = word
          .trim()
          .split(/\s+/)
          .filter((g) => /^[.•·*x]+$/i.test(g));
        let out = '';
        for (let i = 0; i + 1 < groups.length; i += 2) {
          out += GRID[(groups[i]!.length - 1) * 5 + groups[i + 1]!.length - 1] ?? '';
        }
        return out;
      })
      .join(' ')
      .trim(),
});
