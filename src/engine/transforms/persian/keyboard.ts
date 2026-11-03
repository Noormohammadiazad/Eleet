/**
 * Keyboard-layout fixer. Everyone who types Persian has sent "sghl" when they
 * meant «سلام» — the right keys with the wrong layout active. This tool maps
 * between the US QWERTY layout and the Iranian national standard layout
 * (ISIRI 9147, "Persian (Standard)" on Windows / macOS / Linux) in both
 * directions, including the shift layer.
 */
import { defineTransform } from '../../core/types';

const BASE: Record<string, string> = {
  q: 'ض',
  w: 'ص',
  e: 'ث',
  r: 'ق',
  t: 'ف',
  y: 'غ',
  u: 'ع',
  i: 'ه',
  o: 'خ',
  p: 'ح',
  '[': 'ج',
  ']': 'چ',
  a: 'ش',
  s: 'س',
  d: 'ی',
  f: 'ب',
  g: 'ل',
  h: 'ا',
  j: 'ت',
  k: 'ن',
  l: 'م',
  ';': 'ک',
  "'": 'گ',
  z: 'ظ',
  x: 'ط',
  c: 'ز',
  v: 'ر',
  b: 'ذ',
  n: 'د',
  m: 'پ',
  ',': 'و',
  '?': '؟',
  '1': '۱',
  '2': '۲',
  '3': '۳',
  '4': '۴',
  '5': '۵',
  '6': '۶',
  '7': '۷',
  '8': '۸',
  '9': '۹',
  '0': '۰',
};

const SHIFT: Record<string, string> = {
  Q: '\u0652',
  W: '\u064C',
  E: '\u064D',
  R: '\u064B',
  T: '\u064F',
  Y: '\u0650',
  U: '\u064E',
  I: '\u0651',
  O: ']',
  P: '[',
  '{': '}',
  '}': '{',
  A: 'ؤ',
  S: 'ئ',
  D: 'ي',
  F: 'إ',
  G: 'أ',
  H: 'آ',
  J: 'ة',
  K: '»',
  L: '«',
  ':': ':',
  '"': '؛',
  Z: 'ك',
  C: 'ژ',
  M: 'ء',
  '<': '>',
  '>': '<',
};

const EN_TO_FA = new Map<string, string>([...Object.entries(BASE), ...Object.entries(SHIFT)]);
const FA_TO_EN = new Map<string, string>();
for (const [en, fa] of EN_TO_FA) if (!FA_TO_EN.has(fa)) FA_TO_EN.set(fa, en);
FA_TO_EN.set('ي', 'd').set('ك', ';').set('\u200C', 'B');

export const keyboard = defineTransform({
  kind: 'transform',
  id: 'keyboard',
  category: 'persian',
  keywords: ['keyboard', 'layout', 'wrong layout', 'isiri 9147', 'صفحه کلید', 'کیبورد', 'sghl'],
  sample: { encode: 'sghl! hdk ,fshdj vh odgd n,sj nhvl', decode: 'سلام دنیا' },
  options: [],
  encode: (input) =>
    [...input].map((ch) => EN_TO_FA.get(ch) ?? EN_TO_FA.get(ch.toLowerCase()) ?? ch).join(''),
  decode: (input) => [...input].map((ch) => FA_TO_EN.get(ch) ?? ch).join(''),
});
