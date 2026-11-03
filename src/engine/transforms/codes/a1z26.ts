/** A1Z26 — the letter-number cipher (A=1 … Z=26) beloved of puzzle hunts and ARGs. */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';

export const a1z26 = defineTransform({
  kind: 'transform',
  id: 'a1z26',
  category: 'signals',
  keywords: ['a1z26', 'letter numbers', 'alphabet position', 'gravity falls'],
  sample: { encode: 'Trust no one' },
  options: [
    opt.select(
      'separator',
      [
        { value: 'dash', label: '8-5-12' },
        { value: 'space', label: '8 5 12' },
        { value: 'comma', label: '8,5,12' },
      ],
      'dash',
      { control: 'segmented', directions: ['encode'] },
    ),
  ],
  encode: (input, o) => {
    const sep = { dash: '-', space: ' ', comma: ',' }[o.separator];
    const wordSep = o.separator === 'space' ? ' / ' : ' ';
    return input
      .split(/\s+/)
      .map((word) =>
        [...word.toUpperCase()]
          .filter((ch) => ch >= 'A' && ch <= 'Z')
          .map((ch) => ch.charCodeAt(0) - 64)
          .join(sep),
      )
      .filter(Boolean)
      .join(wordSep);
  },
  decode: (input) => {
    const words = /\//.test(input) ? input.split(/\s*\/\s*/) : input.split(/\s+/);
    return words
      .map((word) =>
        (word.match(/\d+/g) ?? [])
          .map(Number)
          .filter((n) => n >= 1 && n <= 26)
          .map((n) => String.fromCharCode(64 + n))
          .join(''),
      )
      .join(' ')
      .trim();
  },
  detect: (input) => (/^\s*(?:(?:[1-9]|1\d|2[0-6])[-,\s/]*){3,}$/.test(input) ? 0.7 : 0),
});
