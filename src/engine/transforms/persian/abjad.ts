/**
 * Abjad numerals (حساب ابجد) — the numeric values of the Arabic-script
 * letters in the old Semitic order "abjad hawwaz hutti…". Persian poets used
 * them for chronograms (ماده تاریخ): a verse whose letters sum to the year
 * of the event it commemorates. Persian-only letters take the value of their
 * base letter (پ = ب, چ = ج, ژ = ز, گ = ک).
 *
 * Encode: text → numeric value. Decode: number → its abjad letter spelling.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';

export const ABJAD: Readonly<Record<string, number>> = {
  ا: 1,
  آ: 1,
  أ: 1,
  إ: 1,
  ء: 1,
  ب: 2,
  پ: 2,
  ج: 3,
  چ: 3,
  د: 4,
  ه: 5,
  ة: 5,
  ۀ: 5,
  و: 6,
  ؤ: 6,
  ز: 7,
  ژ: 7,
  ح: 8,
  ط: 9,
  ی: 10,
  ي: 10,
  ى: 10,
  ئ: 10,
  ک: 20,
  ك: 20,
  گ: 20,
  ل: 30,
  م: 40,
  ن: 50,
  س: 60,
  ع: 70,
  ف: 80,
  ص: 90,
  ق: 100,
  ر: 200,
  ش: 300,
  ت: 400,
  ث: 500,
  خ: 600,
  ذ: 700,
  ض: 800,
  ظ: 900,
  غ: 1000,
};

/** Canonical letter for each value, used when spelling numbers. */
const SPELLING: [number, string][] = [
  [1000, 'غ'],
  [900, 'ظ'],
  [800, 'ض'],
  [700, 'ذ'],
  [600, 'خ'],
  [500, 'ث'],
  [400, 'ت'],
  [300, 'ش'],
  [200, 'ر'],
  [100, 'ق'],
  [90, 'ص'],
  [80, 'ف'],
  [70, 'ع'],
  [60, 'س'],
  [50, 'ن'],
  [40, 'م'],
  [30, 'ل'],
  [20, 'ک'],
  [10, 'ی'],
  [9, 'ط'],
  [8, 'ح'],
  [7, 'ز'],
  [6, 'و'],
  [5, 'ه'],
  [4, 'د'],
  [3, 'ج'],
  [2, 'ب'],
  [1, 'ا'],
];

export function abjadValue(text: string): number {
  let sum = 0;
  for (const ch of text) sum += ABJAD[ch] ?? 0;
  return sum;
}

export function abjadSpell(value: number): string {
  let rest = Math.floor(value);
  let out = '';
  while (rest >= 1000) {
    out += 'غ';
    rest -= 1000;
  }
  for (const [n, letter] of SPELLING) {
    if (n >= 1000) continue;
    while (rest >= n) {
      out += letter;
      rest -= n;
    }
  }
  return out;
}

const toLatinDigits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

export const abjad = defineTransform({
  kind: 'transform',
  id: 'abjad',
  category: 'persian',
  keywords: ['abjad', 'ابجد', 'numerology', 'chronogram', 'ماده تاریخ', 'gematria', 'isopsephy'],
  sample: { encode: 'ایران', decode: '1404' },
  options: [
    opt.select('breakdown', ['total', 'words', 'letters'], 'words', {
      control: 'segmented',
      directions: ['encode'],
    }),
  ],
  encode: (input, o) => {
    const words = input.match(/[\u0600-\u06FF]+/g) ?? [];
    const total = abjadValue(input);
    if (o.breakdown === 'total') return String(total);
    if (o.breakdown === 'words') {
      return [...words.map((w) => `${w} = ${abjadValue(w)}`), `Σ = ${total}`].join('\n');
    }
    return [
      ...[...input].filter((ch) => ABJAD[ch] !== undefined).map((ch) => `${ch} = ${ABJAD[ch]}`),
      `Σ = ${total}`,
    ].join('\n');
  },
  decode: (input) => toLatinDigits(input).replace(/\d+/g, (n) => abjadSpell(Number(n))),
});
