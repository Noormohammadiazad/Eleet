/**
 * Finglish (Pinglish) — Persian written in the Latin alphabet, the way a
 * generation of Iranians texted on phones without Persian keyboards. It is
 * leet's cultural cousin: numerals stand in for letters Latin lacks (the
 * Arabizi convention 3 = ع, 7 = ح, 2 = ء).
 *
 * Persian → Finglish uses a lexicon of everyday words, then letter rules with
 * context (و and ی as consonant or vowel, word-final ه as "e") and Persian
 * phonotactics to restore unwritten short vowels (no syllable starts with two
 * consonants). Finglish → Persian parses digraphs (kh, sh, ch, gh, zh) and
 * writes long vowels only, as Persian orthography does.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { FINGLISH_TO_PERSIAN, PERSIAN_TO_FINGLISH } from './lexicon';

const LETTERS: Record<string, string> = {
  ب: 'b',
  پ: 'p',
  ت: 't',
  ث: 's',
  ج: 'j',
  چ: 'ch',
  ح: 'h',
  خ: 'kh',
  د: 'd',
  ذ: 'z',
  ر: 'r',
  ز: 'z',
  ژ: 'zh',
  س: 's',
  ش: 'sh',
  ص: 's',
  ض: 'z',
  ط: 't',
  ظ: 'z',
  ع: "'",
  غ: 'gh',
  ف: 'f',
  ق: 'gh',
  ک: 'k',
  ك: 'k',
  گ: 'g',
  ل: 'l',
  م: 'm',
  ن: 'n',
  ء: "'",
  ئ: "'",
  ؤ: "o'",
  أ: 'a',
  إ: 'e',
  ة: 'e',
  ۀ: 'eye',
};
const ARABIZI: Record<string, string> = { ع: '3', ح: '7', ء: '2', ئ: '2', ؤ: '2', أ: '2a', ق: 'q' };
const DIACRITICS: Record<string, string> = {
  '\u064E': 'a',
  '\u0650': 'e',
  '\u064F': 'o',
  '\u064B': 'an',
  '\u064D': 'en',
  '\u064C': 'on',
  '\u0652': '',
};
const PUNCTUATION: Record<string, string> = {
  '،': ',',
  '؛': ';',
  '؟': '?',
  '«': '"',
  '»': '"',
  '٪': '%',
  '٫': '.',
};
const PERSIAN_WORD = /[\u0621-\u0652\u0670-\u06D3\u06D5\u200C]+/g;
const VOWEL_LETTER = /[اآوی]/;

function transliterateWord(
  word: string,
  longA: string,
  arabizi: boolean,
  guessVowels: boolean,
): string {
  const clean = word.replace(/\u0640/g, '');
  const bare = clean.replace(/[\u064B-\u0652]/g, '');
  const known =
    PERSIAN_TO_FINGLISH.get(bare) ?? PERSIAN_TO_FINGLISH.get(bare.replace(/\u200C/g, ''));
  if (known && !arabizi) return known;

  const chars = [...clean];
  let out = '';
  let consonantRun = 0;
  let vowels = 0;
  let lastWasVowel = false;
  const emit = (sound: string, consonant: boolean) => {
    if (consonant && guessVowels) {
      // Persian syllables are CV(C)(C): a word never opens with two consonants and never
      // stacks three, so the unwritten short vowel can be restored at those points.
      if (consonantRun === 1 && vowels === 0) {
        out += 'a';
        vowels++;
        consonantRun = 0;
      } else if (consonantRun >= 2) {
        out += 'e';
        consonantRun = 0;
      }
    }
    out += sound;
    lastWasVowel = !consonant;
    if (consonant) consonantRun++;
    else {
      consonantRun = 0;
      vowels++;
    }
  };

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    const next = chars[i + 1];
    const last = i === chars.length - 1;
    if (ch === '\u200C') continue;
    if (DIACRITICS[ch] !== undefined) {
      out += DIACRITICS[ch];
      consonantRun = 0;
      vowels++;
      continue;
    }
    if (ch === '\u0651') {
      out += out.slice(-1);
      continue;
    }
    if (ch === 'خ' && next === 'و' && (chars[i + 2] === 'ا' || chars[i + 2] === 'ی')) {
      emit(arabizi ? '5' : 'kh', true);
      i++; // silent و in خوا / خوی
      continue;
    }
    switch (ch) {
      case 'آ':
        emit(longA === 'aa' ? 'aa' : 'a', false);
        continue;
      case 'ا':
        if (i === 0 && next === 'ی') {
          emit('i', false);
          i++;
        } else if (i === 0 && next === 'و') {
          emit('o', false);
          i++;
        } else emit(i === 0 ? 'a' : longA === 'aa' ? 'aa' : 'a', false);
        continue;
      case 'و':
        if (chars.length === 1) emit('o', false);
        else if (i === 0 || lastWasVowel || (next && VOWEL_LETTER.test(next))) emit('v', true);
        else emit('o', false);
        continue;
      case 'ی':
      case 'ي':
      case 'ى':
        if (i === 0 || (lastWasVowel && !last) || next === 'ا' || next === 'و') emit('y', true);
        else emit('i', false);
        continue;
      case 'ه':
        if (last && chars.length > 1 && chars[i - 1] !== 'ا') emit('e', false);
        else emit('h', true);
        continue;
    }
    const mapped = (arabizi ? ARABIZI[ch] : undefined) ?? LETTERS[ch];
    if (mapped !== undefined) emit(mapped, true);
    else out += ch;
  }
  return out;
}

const DIGRAPHS: [string, string][] = [
  ['kh', 'خ'],
  ['sh', 'ش'],
  ['ch', 'چ'],
  ['gh', 'ق'],
  ['zh', 'ژ'],
  ['aa', 'ا'],
  ['oo', 'و'],
  ['ou', 'و'],
  ['ee', 'ی'],
  ['ei', 'ی'],
  ['ey', 'ی'],
  ['ai', 'ای'],
];
const SINGLE: Record<string, string> = {
  b: 'ب',
  p: 'پ',
  t: 'ت',
  j: 'ج',
  h: 'ه',
  d: 'د',
  r: 'ر',
  z: 'ز',
  s: 'س',
  f: 'ف',
  q: 'ق',
  k: 'ک',
  g: 'گ',
  l: 'ل',
  m: 'م',
  n: 'ن',
  v: 'و',
  w: 'و',
  y: 'ی',
  x: 'کس',
  c: 'ک',
  '3': 'ع',
  '7': 'ح',
  '2': 'ء',
  '5': 'خ',
  "'": 'ع',
  i: 'ی',
  u: 'و',
};

function persianizeWord(word: string): string {
  const lower = word.toLowerCase();
  const known = FINGLISH_TO_PERSIAN.get(lower);
  if (known) return known;
  let out = '';
  for (let i = 0; i < lower.length;) {
    const rest = lower.slice(i);
    const initial = i === 0;
    const final = (n: number) => i + n >= lower.length;
    const digraph = DIGRAPHS.find(([latin]) => rest.startsWith(latin));
    if (digraph) {
      const [latin, fa] = digraph;
      if (latin === 'aa') out += initial ? 'آ' : 'ا';
      else if (initial && /^(oo|ou|ee|ei|ey|ai)$/.test(latin)) out += 'ا' + fa;
      else out += fa;
      i += latin.length;
      continue;
    }
    const ch = lower[i]!;
    if (ch === 'a') out += initial ? 'ا' : 'ا';
    else if (ch === 'e') out += initial ? 'ا' : final(1) ? 'ه' : '';
    else if (ch === 'o') out += initial ? 'ا' : final(1) ? 'و' : '';
    else if ((ch === 'i' || ch === 'u') && initial) out += 'ا' + SINGLE[ch];
    else out += SINGLE[ch] ?? ch;
    i++;
  }
  return out;
}

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export const finglish = defineTransform({
  kind: 'transform',
  id: 'finglish',
  category: 'persian',
  keywords: [
    'finglish',
    'pinglish',
    'penglish',
    'arabizi',
    'transliteration',
    'فینگلیش',
    'پینگلیش',
  ],
  sample: {
    encode: 'سلام دوست من، حالت چطوره؟ امروز هوا خیلی خوبه.',
    decode: 'salam doost e man, khoobi? merci, man ham khoobam.',
  },
  options: [
    opt.select(
      'longA',
      [
        { value: 'a', label: 'a' },
        { value: 'aa', label: 'aa' },
      ],
      'a',
      {
        control: 'segmented',
        directions: ['encode'],
      },
    ),
    opt.boolean('arabizi', false, { directions: ['encode'] }),
    opt.boolean('guessVowels', true, { directions: ['encode'] }),
  ],
  encode: (input, o) =>
    input
      .replace(PERSIAN_WORD, (word) =>
        // ZWNJ separates morphemes (می\u200Cروم, کتاب\u200Cها): transliterate each on its own.
        word
          .split('\u200C')
          .map((part) => transliterateWord(part, o.longA, o.arabizi, o.guessVowels))
          .join(''),
      )
      .replace(/[۰-۹٠-٩]/g, (d) =>
        String(Math.max(PERSIAN_DIGITS.indexOf(d), ARABIC_DIGITS.indexOf(d))),
      )
      .replace(/[،؛؟«»٪٫]/g, (p) => PUNCTUATION[p]!),
  decode: (input) =>
    input
      // The ezafe ("doost e man", "doost-e man") is not written in Persian script.
      .replace(/(?<=[a-z])(?:\s+|-)e(?=\s)/gi, '')
      .replace(/[A-Za-z'][A-Za-z0-9']*/g, (word) => persianizeWord(word))
      .replace(/,/g, '،')
      .replace(/;/g, '؛')
      .replace(/\?/g, '؟'),
});
