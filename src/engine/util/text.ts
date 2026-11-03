/**
 * Unicode-aware text helpers.
 *
 * JavaScript strings are UTF-16, so naive `split('')` tears emoji and combining
 * sequences apart. Everything user-visible in Eleet is segmented into extended
 * grapheme clusters via `Intl.Segmenter`, with a code-point fallback.
 */

const graphemeSegmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : null;

/** Splits text into user-perceived characters (grapheme clusters). */
export function graphemes(text: string): string[] {
  if (!graphemeSegmenter) return Array.from(text);
  const out: string[] = [];
  for (const { segment } of graphemeSegmenter.segment(text)) out.push(segment);
  return out;
}

/** Splits text into code points (not UTF-16 units). */
export function codePoints(text: string): number[] {
  const out: number[] = [];
  for (const ch of text) out.push(ch.codePointAt(0)!);
  return out;
}

/** Builds a lookup map from two equal-length code-point sequences. */
export function zipMap(from: string, to: string): Map<string, string> {
  const a = Array.from(from);
  const b = Array.from(to);
  if (a.length !== b.length) throw new Error(`zipMap length mismatch: ${a.length} vs ${b.length}`);
  const map = new Map<string, string>();
  a.forEach((ch, i) => map.set(ch, b[i]!));
  return map;
}

/** Inverts a map; later keys win on collisions. */
export function invertMap<K, V>(map: Map<K, V>): Map<V, K> {
  const out = new Map<V, K>();
  for (const [k, v] of map) out.set(v, k);
  return out;
}

export const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const LOWER = 'abcdefghijklmnopqrstuvwxyz';

export function isAsciiLetter(ch: string): boolean {
  return /^[A-Za-z]$/.test(ch);
}

export function isUpper(ch: string): boolean {
  return ch !== ch.toLowerCase() && ch === ch.toUpperCase();
}

/** Index 0–25 of an ASCII letter, or -1. */
export function letterIndex(ch: string): number {
  const c = ch.charCodeAt(0);
  if (c >= 65 && c <= 90) return c - 65;
  if (c >= 97 && c <= 122) return c - 97;
  return -1;
}

/** Applies the case of `template` to `ch`. */
export function matchCase(ch: string, template: string): string {
  return isUpper(template) ? ch.toUpperCase() : ch.toLowerCase();
}

/** Strips everything but A–Z and upper-cases (classical-cipher normal form). */
export function lettersOnly(text: string): string {
  return text.toUpperCase().replace(/[^A-Z]/g, '');
}

/** Groups a string into blocks separated by spaces (e.g. "ABCDE FGHIJ"). */
export function groupBlocks(text: string, size: number): string {
  if (size <= 0) return text;
  const out: string[] = [];
  for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
  return out.join(' ');
}

/** Removes combining marks (Unicode category M). */
export function stripMarks(text: string): string {
  return text.replace(/\p{M}/gu, '');
}

/** Applies a map character-by-character, leaving unmapped code points untouched. */
export function mapChars(text: string, map: ReadonlyMap<string, string>): string {
  let out = '';
  for (const ch of text) out += map.get(ch) ?? ch;
  return out;
}

/** Splits text into word / non-word runs, preserving everything for lossless rejoin. */
export function tokenizeWords(text: string): { text: string; word: boolean }[] {
  const out: { text: string; word: boolean }[] = [];
  const re = /[\p{L}\p{N}\p{M}'’]+/gu;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), word: false });
    out.push({ text: m[0], word: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), word: false });
  return out;
}
