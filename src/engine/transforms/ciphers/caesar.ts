/**
 * Caesar cipher — the shift cipher Julius Caesar used with a shift of three
 * (Suetonius, *Life of Julius Caesar*, 56). Every letter moves `shift`
 * positions down the alphabet; case and non-letters are preserved.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { chiSquared } from '../../analysis/stats';
import { shiftLetters } from './shift';

export const caesar = defineTransform({
  kind: 'transform',
  id: 'caesar',
  category: 'substitution',
  keywords: ['shift', 'rot', 'julius', 'قیصر', 'سزار'],
  sample: { encode: 'Veni, vidi, vici.', decode: 'Yhql, ylgl, ylfl.' },
  options: [opt.number('shift', 3, { min: 1, max: 25, step: 1, control: 'slider' })],
  encode: (input, o) => shiftLetters(input, o.shift),
  decode: (input, o) => shiftLetters(input, -o.shift),
});

/** All 26 shifts ranked by chi-squared distance from English (best first). */
export function caesarBruteForce(text: string): { shift: number; text: string; chi: number }[] {
  const out = [];
  for (let shift = 0; shift < 26; shift++) {
    const candidate = shiftLetters(text, -shift);
    out.push({ shift, text: candidate, chi: chiSquared(candidate) });
  }
  return out.sort((a, b) => a.chi - b.chi);
}
