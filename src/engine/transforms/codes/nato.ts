/**
 * Spelling alphabets: the NATO / ICAO radiotelephony alphabet (1956), its
 * ICAO digit pronunciations ("Tree", "Fife", "Niner") and the LAPD alphabet
 * heard on police radio.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';

const NATO = [
  'Alfa',
  'Bravo',
  'Charlie',
  'Delta',
  'Echo',
  'Foxtrot',
  'Golf',
  'Hotel',
  'India',
  'Juliett',
  'Kilo',
  'Lima',
  'Mike',
  'November',
  'Oscar',
  'Papa',
  'Quebec',
  'Romeo',
  'Sierra',
  'Tango',
  'Uniform',
  'Victor',
  'Whiskey',
  'X-ray',
  'Yankee',
  'Zulu',
];
const LAPD = [
  'Adam',
  'Boy',
  'Charles',
  'David',
  'Edward',
  'Frank',
  'George',
  'Henry',
  'Ida',
  'John',
  'King',
  'Lincoln',
  'Mary',
  'Nora',
  'Ocean',
  'Paul',
  'Queen',
  'Robert',
  'Sam',
  'Tom',
  'Union',
  'Victor',
  'William',
  'X-ray',
  'Young',
  'Zebra',
];
const DIGITS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const ICAO_DIGITS = ['Zero', 'Wun', 'Too', 'Tree', 'Fower', 'Fife', 'Six', 'Seven', 'Ait', 'Niner'];
const PUNCTUATION: Record<string, string> = { '.': 'Stop', '-': 'Dash', ',': 'Comma' };

const REVERSE = new Map<string, string>();
const register = (words: string[], chars: string) =>
  words.forEach((w, i) => REVERSE.set(w.toLowerCase().replace(/[^a-z]/g, ''), chars[i]!));
register(NATO, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
register(LAPD, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
register(DIGITS, '0123456789');
register(ICAO_DIGITS, '0123456789');
register(
  ['Alpha', 'Juliet', 'Whisky', 'Xray', 'Nine', 'Decimal', 'Stop', 'Dash', 'Comma', 'Space'],
  'AJWX9..-, ',
);

export const nato = defineTransform({
  kind: 'transform',
  id: 'nato',
  category: 'signals',
  keywords: ['nato', 'icao', 'phonetic', 'spelling alphabet', 'alfa bravo', 'lapd', 'radio'],
  sample: { encode: 'Eleet 2026' },
  options: [
    opt.select('style', ['nato', 'icao', 'lapd'], 'nato', { control: 'segmented' }),
    opt.select('letterCase', ['title', 'upper', 'lower'], 'title', {
      directions: ['encode'],
      control: 'segmented',
    }),
  ],
  encode: (input, o) => {
    const letters = o.style === 'lapd' ? LAPD : NATO;
    const digits = o.style === 'icao' ? ICAO_DIGITS : DIGITS;
    const styleCase = (w: string) =>
      o.letterCase === 'upper' ? w.toUpperCase() : o.letterCase === 'lower' ? w.toLowerCase() : w;
    return input
      .split(/\s+/)
      .map((word) =>
        [...word.toUpperCase()]
          .map((ch) => {
            if (ch >= 'A' && ch <= 'Z') return letters[ch.charCodeAt(0) - 65]!;
            if (ch >= '0' && ch <= '9') return digits[Number(ch)]!;
            return PUNCTUATION[ch];
          })
          .filter((w): w is string => !!w)
          .map(styleCase)
          .join(' '),
      )
      .filter(Boolean)
      .join(' / ');
  },
  decode: (input) =>
    input
      .split(/\s*[/|]\s*|\n+/)
      .map((word) =>
        word
          .split(/\s+/)
          .filter(Boolean)
          .map((token) => REVERSE.get(token.toLowerCase().replace(/[^a-z]/g, '')) ?? '')
          .join(''),
      )
      .join(' ')
      .trim(),
  detect: (input) => {
    const tokens = input
      .toLowerCase()
      .split(/[\s/|]+/)
      .filter(Boolean);
    if (tokens.length < 2) return 0;
    const hits = tokens.filter((t) => REVERSE.has(t.replace(/[^a-z]/g, ''))).length;
    return hits / tokens.length > 0.8 ? 0.95 : 0;
  },
});
