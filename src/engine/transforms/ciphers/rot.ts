/**
 * ROT family — the Usenet-era "rotate by N" ciphers used to hide spoilers and
 * punchlines (rec.humor, early 1980s). ROT13 on letters, ROT5 on digits, ROT18
 * on both, and ROT47 across the 94 printable ASCII characters. All are
 * involutions: applying them twice restores the original.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { shiftLetters } from './shift';

function rot5(text: string): string {
  return text.replace(/[0-9]/g, (d) => String((Number(d) + 5) % 10));
}

function rot47(text: string): string {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    out += c >= 33 && c <= 126 ? String.fromCharCode(33 + ((c - 33 + 47) % 94)) : text[i];
  }
  return out;
}

function apply(input: string, variant: 'rot13' | 'rot5' | 'rot18' | 'rot47'): string {
  switch (variant) {
    case 'rot5':
      return rot5(input);
    case 'rot18':
      return rot5(shiftLetters(input, 13));
    case 'rot47':
      return rot47(input);
    default:
      return shiftLetters(input, 13);
  }
}

export const rot = defineTransform({
  kind: 'transform',
  id: 'rot',
  category: 'substitution',
  involution: true,
  keywords: ['rot13', 'rot47', 'rot5', 'rot18', 'usenet', 'spoiler'],
  sample: { encode: 'Why did the chicken cross the road? Gb trg gb gur bgure fvqr!' },
  options: [
    opt.select(
      'variant',
      [
        { value: 'rot13', label: 'ROT13' },
        { value: 'rot5', label: 'ROT5' },
        { value: 'rot18', label: 'ROT18' },
        { value: 'rot47', label: 'ROT47' },
      ],
      'rot13',
      { control: 'segmented' },
    ),
  ],
  encode: (input, o) => apply(input, o.variant),
  decode: (input, o) => apply(input, o.variant),
});
