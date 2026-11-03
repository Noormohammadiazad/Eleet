/**
 * Lightweight Unicode character introspection without shipping the 1.9 MB
 * UnicodeData table: general category and script come from the regex engine's
 * built-in Unicode property support (`\p{…}`), and a curated table names the
 * invisible and security-relevant code points people actually need to spot.
 */

/** Two-letter general categories, tested in rough order of frequency. */
const CATEGORIES = [
  'Ll',
  'Lu',
  'Lo',
  'Zs',
  'Po',
  'Nd',
  'Mn',
  'Lm',
  'Lt',
  'Mc',
  'Me',
  'Nl',
  'No',
  'Pc',
  'Pd',
  'Ps',
  'Pe',
  'Pi',
  'Pf',
  'Sm',
  'Sc',
  'Sk',
  'So',
  'Zl',
  'Zp',
  'Cc',
  'Cf',
  'Co',
  'Cs',
  'Cn',
] as const;
export type GeneralCategory = (typeof CATEGORIES)[number];
const CATEGORY_RE = CATEGORIES.map((c) => [c, new RegExp(`^\\p{gc=${c}}`, 'u')] as const);

export function generalCategory(ch: string): GeneralCategory {
  for (const [name, re] of CATEGORY_RE) if (re.test(ch)) return name;
  return 'Cn';
}

const SCRIPTS = [
  'Latin',
  'Arabic',
  'Cyrillic',
  'Greek',
  'Hebrew',
  'Armenian',
  'Cherokee',
  'Han',
  'Hiragana',
  'Katakana',
  'Hangul',
  'Devanagari',
  'Thai',
  'Georgian',
  'Ethiopic',
  'Braille',
  'Common',
  'Inherited',
] as const;
export type ScriptName = (typeof SCRIPTS)[number] | 'Other';
const SCRIPT_RE = SCRIPTS.map((s) => [s, new RegExp(`^\\p{sc=${s}}`, 'u')] as const);

export function scriptOf(ch: string): ScriptName {
  for (const [name, re] of SCRIPT_RE) if (re.test(ch)) return name;
  return 'Other';
}

/** Names for invisible, formatting and otherwise notable code points. */
export const NOTABLE: Readonly<Record<number, string>> = {
  0x0009: 'CHARACTER TABULATION',
  0x000a: 'LINE FEED',
  0x000d: 'CARRIAGE RETURN',
  0x0020: 'SPACE',
  0x00a0: 'NO-BREAK SPACE',
  0x00ad: 'SOFT HYPHEN',
  0x034f: 'COMBINING GRAPHEME JOINER',
  0x061c: 'ARABIC LETTER MARK',
  0x115f: 'HANGUL CHOSEONG FILLER',
  0x1160: 'HANGUL JUNGSEONG FILLER',
  0x180e: 'MONGOLIAN VOWEL SEPARATOR',
  0x2000: 'EN QUAD',
  0x2002: 'EN SPACE',
  0x2003: 'EM SPACE',
  0x2009: 'THIN SPACE',
  0x200a: 'HAIR SPACE',
  0x200b: 'ZERO WIDTH SPACE',
  0x200c: 'ZERO WIDTH NON-JOINER',
  0x200d: 'ZERO WIDTH JOINER',
  0x200e: 'LEFT-TO-RIGHT MARK',
  0x200f: 'RIGHT-TO-LEFT MARK',
  0x2028: 'LINE SEPARATOR',
  0x2029: 'PARAGRAPH SEPARATOR',
  0x202a: 'LEFT-TO-RIGHT EMBEDDING',
  0x202b: 'RIGHT-TO-LEFT EMBEDDING',
  0x202c: 'POP DIRECTIONAL FORMATTING',
  0x202d: 'LEFT-TO-RIGHT OVERRIDE',
  0x202e: 'RIGHT-TO-LEFT OVERRIDE',
  0x202f: 'NARROW NO-BREAK SPACE',
  0x205f: 'MEDIUM MATHEMATICAL SPACE',
  0x2060: 'WORD JOINER',
  0x2061: 'FUNCTION APPLICATION',
  0x2062: 'INVISIBLE TIMES',
  0x2063: 'INVISIBLE SEPARATOR',
  0x2064: 'INVISIBLE PLUS',
  0x2066: 'LEFT-TO-RIGHT ISOLATE',
  0x2067: 'RIGHT-TO-LEFT ISOLATE',
  0x2068: 'FIRST STRONG ISOLATE',
  0x2069: 'POP DIRECTIONAL ISOLATE',
  0x3000: 'IDEOGRAPHIC SPACE',
  0x3164: 'HANGUL FILLER',
  0xfe0e: 'VARIATION SELECTOR-15 (text)',
  0xfe0f: 'VARIATION SELECTOR-16 (emoji)',
  0xfeff: 'ZERO WIDTH NO-BREAK SPACE (BOM)',
  0xffa0: 'HALFWIDTH HANGUL FILLER',
  0xfffc: 'OBJECT REPLACEMENT CHARACTER',
  0xfffd: 'REPLACEMENT CHARACTER',
};

export const BIDI_CONTROLS = new Set([
  0x061c, 0x200e, 0x200f, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069,
]);

export const INVISIBLES = new Set([
  0x00ad, 0x034f, 0x115f, 0x1160, 0x180e, 0x200b, 0x200c, 0x200d, 0x2060, 0x2061, 0x2062, 0x2063,
  0x2064, 0xfeff, 0x3164, 0xffa0,
]);

export const isTag = (cp: number) => cp >= 0xe0000 && cp <= 0xe007f;
export const isVariationSelector = (cp: number) =>
  (cp >= 0xfe00 && cp <= 0xfe0f) || (cp >= 0xe0100 && cp <= 0xe01ef);
export const isPrivateUse = (cp: number) =>
  (cp >= 0xe000 && cp <= 0xf8ff) ||
  (cp >= 0xf0000 && cp <= 0xffffd) ||
  (cp >= 0x100000 && cp <= 0x10fffd);

/** Human-readable label for a code point: its notable name, or a descriptive fallback. */
export function describe(cp: number): string | null {
  if (NOTABLE[cp]) return NOTABLE[cp]!;
  if (isTag(cp)) {
    if (cp === 0xe0001) return 'LANGUAGE TAG';
    if (cp === 0xe007f) return 'CANCEL TAG';
    const ascii = cp - 0xe0000;
    return `TAG ${ascii >= 0x20 && ascii < 0x7f ? `“${String.fromCharCode(ascii)}”` : ascii.toString(16)}`;
  }
  if (isVariationSelector(cp)) return 'VARIATION SELECTOR';
  return null;
}
