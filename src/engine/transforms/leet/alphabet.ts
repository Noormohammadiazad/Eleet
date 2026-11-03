/**
 * The leet glyph database.
 *
 * Every letter maps to a list of substitutions, each tagged with a *tier*
 * describing how aggressive it is:
 *
 *   1 — Readable   single digits/symbols everyone recognises (4 3 1 0 5 7)
 *   2 — Classic    single characters with a looser resemblance (€ ( ^ vv)
 *   3 — Hardcore   multi-character ASCII art (|-| /\/\ |\| \/\/ |<)
 *   4 — Cyrillic   non-ASCII look-alikes (Д Я И Ш ∑ ¥)
 *
 * Presets are orderings over these tiers. The first glyph of a resolved list is
 * the "preferred" one (used by the `first` strategy); `random` and `cycle`
 * strategies draw from the whole list.
 *
 * Determinism: within every built-in preset no glyph is shared by two letters
 * and no glyph is itself a plain letter, so encoding never merges distinct
 * letters. That is why *l* has no tier-1/2 glyph: "1" belongs to *i*, and a
 * readable "l" is already unambiguous. Popular glyphs that would break this
 * rule ("1" or "|" for l, "ph" for f, "vv" for w, "z" for s…) live in
 * `LEET_DECODE_ONLY`: the encoder never emits them, the decoder still reads them.
 *
 * Sources: the 1980s–2000s BBS / warez / gaming scene conventions as catalogued
 * in hacker-culture references (the Jargon File, Wikipedia's Leet article) and
 * common ASCII-art usage.
 */
export type LeetTier = 1 | 2 | 3 | 4;
export type GlyphEntry = readonly [glyph: string, tier: LeetTier];

export const LEET_ALPHABET: Readonly<Record<string, readonly GlyphEntry[]>> = {
  a: [
    ['4', 1],
    ['@', 1],
    ['^', 2],
    ['/\\', 3],
    ['/-\\', 3],
    ['Д', 4],
    ['Λ', 4],
    ['∆', 4],
  ],
  b: [
    ['8', 1],
    ['|3', 3],
    [']3', 3],
    ['13', 3],
    ['ß', 4],
    ['Б', 4],
  ],
  c: [
    ['(', 2],
    ['<', 2],
    ['[', 2],
    ['{', 2],
    ['¢', 4],
    ['©', 4],
  ],
  d: [
    ['|)', 3],
    ['[)', 3],
    ['Ð', 4],
    ['đ', 4],
  ],
  e: [
    ['3', 1],
    ['€', 2],
    ['&', 2],
    ['[-', 3],
    ['|=-', 3],
    ['∑', 4],
    ['Є', 4],
    ['ë', 4],
  ],
  f: [
    ['|=', 3],
    ['/=', 3],
    ['ƒ', 4],
    ['ʃ', 4],
  ],
  g: [
    ['9', 1],
    ['6', 1],
    ['(_+', 3],
    ['ɢ', 4],
    ['Ǥ', 4],
  ],
  h: [
    ['#', 2],
    ['|-|', 3],
    [']-[', 3],
    ['}{', 3],
    [')-(', 3],
    ['(-)', 3],
    ['Н', 4],
    ['ħ', 4],
  ],
  i: [
    ['1', 1],
    ['!', 1],
    ['|', 2],
    ['][', 3],
    ['¡', 4],
    ['ï', 4],
    ['ι', 4],
  ],
  j: [
    [';', 2],
    ['_|', 3],
    ['_/', 3],
    ['ʝ', 4],
    ['ĵ', 4],
  ],
  k: [
    ['|<', 3],
    ['|{', 3],
    ['|X', 3],
    ['К', 4],
    ['ķ', 4],
  ],
  l: [
    ['|_', 3],
    ['£', 4],
    ['ℓ', 4],
  ],
  m: [
    ['^^', 2],
    ['|\\/|', 3],
    ['/\\/\\', 3],
    ['|V|', 3],
    ['[V]', 3],
    ['(V)', 3],
    ['М', 4],
    ['₥', 4],
  ],
  n: [
    ['^/', 2],
    ['|\\|', 3],
    ['/\\/', 3],
    ['И', 4],
    ['η', 4],
  ],
  o: [
    ['0', 1],
    ['()', 3],
    ['[]', 3],
    ['<>', 3],
    ['Ø', 4],
    ['σ', 4],
  ],
  p: [
    ['|*', 3],
    ['|o', 3],
    ['|>', 3],
    ['|°', 3],
    ['¶', 4],
    ['þ', 4],
    ['ρ', 4],
  ],
  q: [
    ['0_', 3],
    ['(,)', 3],
    ['Ǫ', 4],
    ['ℚ', 4],
  ],
  r: [
    ['|2', 3],
    ['|?', 3],
    ['|^', 3],
    ['Я', 4],
    ['®', 4],
  ],
  s: [
    ['5', 1],
    ['$', 1],
    ['§', 4],
    ['ʂ', 4],
  ],
  t: [
    ['7', 1],
    ['+', 1],
    ['-|-', 3],
    ["']['", 3],
    ['†', 4],
    ['τ', 4],
  ],
  u: [
    ['(_)', 3],
    ['|_|', 3],
    ['µ', 4],
    ['Ц', 4],
  ],
  v: [
    ['\\/', 3],
    ['|/', 3],
    ['√', 4],
    ['ν', 4],
  ],
  w: [
    ['\\/\\/', 3],
    ['\\^/', 3],
    ["'//", 3],
    ['Ш', 4],
    ['ω', 4],
  ],
  x: [
    ['%', 2],
    ['><', 3],
    [')(', 3],
    ['×', 4],
    ['Ж', 4],
  ],
  y: [
    ['`/', 3],
    ["'/", 3],
    ['¥', 4],
    ['Ч', 4],
    ['γ', 4],
  ],
  z: [
    ['2', 1],
    ['7_', 3],
    ['~/_', 3],
    ['Ƶ', 4],
    ['ʐ', 4],
  ],
};

/**
 * Glyphs seen in the wild that are ambiguous (shared with another letter or
 * made of letters). Never produced by the encoder; accepted by the decoder so
 * real-world leet such as "1337" (leet) or "ph34r" (fear) still reads back.
 */
export const LEET_DECODE_ONLY: Readonly<Record<string, readonly string[]>> = {
  b: ['13'],
  d: ['cl'],
  f: ['ph'],
  g: ['&', 'C-'],
  l: ['1', '|'],
  q: ['9'],
  r: ['12'],
  s: ['z'],
  u: ['v'],
  w: ['vv'],
  x: ['}{'],
  y: ['j'],
  z: ['%'],
};

export const LEET_LETTERS = Object.keys(LEET_ALPHABET);

export const LEET_PRESETS = ['readable', 'classic', 'hardcore', 'cyrillic', 'custom'] as const;
export type LeetPreset = (typeof LEET_PRESETS)[number];

/** Tier order for each built-in preset; the first tier supplies the preferred glyph. */
const PRESET_TIERS: Record<Exclude<LeetPreset, 'custom'>, readonly LeetTier[]> = {
  readable: [1],
  classic: [1, 2],
  hardcore: [3, 2, 1],
  cyrillic: [4],
};

export type GlyphMap = Record<string, string[]>;

/** Resolves a built-in preset into an ordered glyph list per letter. */
export function presetGlyphs(preset: Exclude<LeetPreset, 'custom'>): GlyphMap {
  const tiers = PRESET_TIERS[preset];
  const map: GlyphMap = {};
  for (const letter of LEET_LETTERS) {
    const entries = LEET_ALPHABET[letter]!;
    const glyphs = tiers.flatMap((tier) => entries.filter(([, t]) => t === tier).map(([g]) => g));
    if (glyphs.length) map[letter] = glyphs;
  }
  return map;
}

/** Resolves the effective glyph table for a preset (custom maps are sanitised). */
export function resolveGlyphs(preset: LeetPreset, custom: GlyphMap): GlyphMap {
  if (preset !== 'custom') return presetGlyphs(preset);
  const map: GlyphMap = {};
  for (const [letter, glyphs] of Object.entries(custom)) {
    const key = letter.toLowerCase();
    if (!/^[a-z]$/.test(key)) continue;
    const clean = glyphs.filter((g) => g.length > 0 && g.length <= 8);
    if (clean.length) map[key] = clean;
  }
  return map;
}

/** Every glyph that can represent a letter (all tiers), for decoding. */
export interface ReverseGlyph {
  readonly glyph: string;
  readonly letter: string;
  readonly tier: LeetTier;
}

export function reverseIndex(extra: GlyphMap = {}): ReverseGlyph[] {
  const out: ReverseGlyph[] = [];
  const seen = new Set<string>();
  const add = (glyph: string, letter: string, tier: LeetTier) => {
    const key = `${glyph.toLowerCase()}→${letter}`;
    if (seen.has(key) || glyph.toLowerCase() === letter) return;
    seen.add(key);
    out.push({ glyph, letter, tier });
  };
  for (const [letter, entries] of Object.entries(LEET_ALPHABET)) {
    for (const [glyph, tier] of entries) add(glyph, letter, tier);
  }
  for (const [letter, glyphs] of Object.entries(LEET_DECODE_ONLY)) {
    for (const glyph of glyphs) add(glyph, letter, 2);
  }
  for (const [letter, glyphs] of Object.entries(extra)) {
    for (const glyph of glyphs) add(glyph, letter, 2);
  }
  // Longest glyphs first so multi-character art is matched greedily in candidate generation.
  return out.sort((a, b) => b.glyph.length - a.glyph.length);
}
