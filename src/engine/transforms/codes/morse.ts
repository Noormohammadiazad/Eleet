/**
 * Morse code — International (ITU-R M.1677-1) and Persian.
 *
 * Samuel Morse and Alfred Vail's telegraph code (1840s), standardised
 * internationally in 1865. Persian Morse assigns its own sequences to the 32
 * letters of the Persian alphabet; digits are shared with International Morse.
 * Timing helpers used by the audio/light player live here too.
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';

export const MORSE_LATIN: Readonly<Record<string, string>> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  "'": '.----.',
  '!': '-.-.--',
  '/': '-..-.',
  '(': '-.--.',
  ')': '-.--.-',
  '&': '.-...',
  ':': '---...',
  ';': '-.-.-.',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  _: '..--.-',
  '"': '.-..-.',
  $: '...-..-',
  '@': '.--.-.',
};

export const MORSE_PERSIAN: Readonly<Record<string, string>> = {
  ا: '.-',
  ب: '-...',
  پ: '.--.',
  ت: '-',
  ث: '-.-.',
  ج: '.---',
  چ: '---.',
  ح: '....',
  خ: '-..-',
  د: '-..',
  ذ: '...-',
  ر: '.-.',
  ز: '--..',
  ژ: '--.',
  س: '...',
  ش: '----',
  ص: '.-.-',
  ض: '..-..',
  ط: '..-',
  ظ: '-.--',
  ع: '---',
  غ: '..--',
  ف: '..-.',
  ق: '---...',
  ک: '-.-',
  گ: '--.-',
  ل: '.-..',
  م: '--',
  ن: '-.',
  و: '.--',
  ه: '.',
  ی: '..',
  '۰': '-----',
  '۱': '.----',
  '۲': '..---',
  '۳': '...--',
  '۴': '....-',
  '۵': '.....',
  '۶': '-....',
  '۷': '--...',
  '۸': '---..',
  '۹': '----.',
};

/** Arabic-script variants folded onto the Persian letters that carry a Morse code. */
const PERSIAN_FOLD: Record<string, string> = {
  آ: 'ا',
  أ: 'ا',
  إ: 'ا',
  ي: 'ی',
  ى: 'ی',
  ك: 'ک',
  ة: 'ه',
  ؤ: 'و',
  ئ: 'ی',
};
const LATIN_DIGITS_TO_PERSIAN: Record<string, string> = Object.fromEntries(
  [...'0123456789'].map((d, i) => [d, '۰۱۲۳۴۵۶۷۸۹'[i]!]),
);

const invert = (table: Readonly<Record<string, string>>) =>
  new Map(Object.entries(table).map(([ch, code]) => [code, ch]));
const LATIN_REVERSE = invert(MORSE_LATIN);
const PERSIAN_REVERSE = invert(MORSE_PERSIAN);

const DOTS = { dot: '.', bullet: '•', middle: '·' } as const;
const DASHES = { hyphen: '-', minus: '−', emdash: '—' } as const;
const WORD_GAPS = { slash: ' / ', pipe: ' | ', wide: '   ' } as const;

export function morseEncode(
  input: string,
  alphabet: 'latin' | 'persian',
  dot = '.',
  dash = '-',
  wordGap = ' / ',
): string {
  const table = alphabet === 'persian' ? MORSE_PERSIAN : MORSE_LATIN;
  return input
    .split(/\s+/)
    .map((word) =>
      [...word]
        .map((raw) => {
          let ch = alphabet === 'persian' ? (PERSIAN_FOLD[raw] ?? raw) : raw.toUpperCase();
          if (alphabet === 'persian') ch = LATIN_DIGITS_TO_PERSIAN[ch] ?? ch;
          return table[ch];
        })
        .filter((code): code is string => code !== undefined)
        .map((code) => code.replace(/\./g, dot).replace(/-/g, dash))
        .join(' '),
    )
    .filter(Boolean)
    .join(wordGap);
}

export function morseDecode(input: string, alphabet: 'latin' | 'persian'): string {
  const reverse = alphabet === 'persian' ? PERSIAN_REVERSE : LATIN_REVERSE;
  const normalized = input
    .replace(/[•·∙⋅●*]/g, '.')
    .replace(/[−—–_▬]/g, '-')
    .trim();
  if (!normalized) return '';
  if (/[^.\-\s/|]/.test(normalized)) throw new TransformError('invalidMorse');
  return normalized
    .split(/\s*[/|\n]\s*|\s{3,}/)
    .map((word) =>
      word
        .split(/\s+/)
        .filter(Boolean)
        .map((code) => reverse.get(code) ?? '�')
        .join(''),
    )
    .join(' ');
}

export const morse = defineTransform({
  kind: 'transform',
  id: 'morse',
  category: 'signals',
  keywords: ['morse', 'telegraph', 'cw', 'sos', 'dit', 'dah', 'مورس'],
  sample: { encode: 'SOS — What hath God wrought?' },
  options: [
    opt.select('alphabet', ['latin', 'persian'], 'latin', { control: 'segmented' }),
    opt.select(
      'dot',
      (Object.keys(DOTS) as (keyof typeof DOTS)[]).map((value) => ({ value, label: DOTS[value] })),
      'dot',
      { directions: ['encode'], control: 'segmented' },
    ),
    opt.select(
      'dash',
      (Object.keys(DASHES) as (keyof typeof DASHES)[]).map((value) => ({
        value,
        label: DASHES[value],
      })),
      'hyphen',
      { directions: ['encode'], control: 'segmented' },
    ),
    opt.select(
      'wordGap',
      [
        { value: 'slash', label: '/' },
        { value: 'pipe', label: '|' },
        { value: 'wide', label: '␣␣␣' },
      ],
      'slash',
      { directions: ['encode'], control: 'segmented' },
    ),
  ],
  encode: (input, o) =>
    morseEncode(input, o.alphabet, DOTS[o.dot], DASHES[o.dash], WORD_GAPS[o.wordGap]),
  decode: (input, o) => morseDecode(input, o.alphabet),
  detect: (input) =>
    /^[\s.\-•·−—/|]+$/.test(input.trim()) && /[.•·]/.test(input) && /[-−—]/.test(input) ? 0.95 : 0,
});

/** A timed on/off event for the Morse audio/light player. */
export interface MorseEvent {
  readonly on: boolean;
  /** Duration in milliseconds. */
  readonly ms: number;
}

/**
 * Converts Morse text to a keying schedule using PARIS timing
 * (1 unit = 1200 / WPM ms) with optional Farnsworth spacing, where characters
 * are sent at `wpm` but the gaps between them are stretched to `effectiveWpm`.
 */
export function morseSchedule(code: string, wpm: number, effectiveWpm = wpm): MorseEvent[] {
  const unit = 1200 / wpm;
  const farnsworth =
    effectiveWpm < wpm
      ? ((60 * wpm - 37.2 * effectiveWpm) / (effectiveWpm * wpm) / 19) * 1000
      : unit;
  const events: MorseEvent[] = [];
  const words = code.trim().split(/\s*[/|\n]\s*|\s{3,}/);
  words.forEach((word, wi) => {
    const letters = word.split(/\s+/).filter(Boolean);
    letters.forEach((letter, li) => {
      [...letter].forEach((symbol, si) => {
        events.push({ on: true, ms: symbol === '.' ? unit : 3 * unit });
        if (si < letter.length - 1) events.push({ on: false, ms: unit });
      });
      if (li < letters.length - 1) events.push({ on: false, ms: 3 * farnsworth });
    });
    if (wi < words.length - 1) events.push({ on: false, ms: 7 * farnsworth });
  });
  return events;
}
