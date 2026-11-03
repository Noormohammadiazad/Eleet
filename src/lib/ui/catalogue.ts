/**
 * Catalogue presentation helpers: section numerals, catalogue numbers and
 * historical dates for the tools.
 */
import { CATEGORY_IDS, type AnyTool } from '$engine/core/types';
import { TOOLS } from '$engine/registry';

const NUMERALS: readonly [number, string][] = [
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

/** Roman numerals for section numbers (1–39 is all a catalogue of drawers needs). */
export function roman(n: number): string {
  let out = '';
  for (const [value, glyph] of NUMERALS) {
    while (n >= value) {
      out += glyph;
      n -= value;
    }
  }
  return out;
}

/** "II.3" — the drawer (category) and the tool's place inside it. */
export function catalogueNumber(tool: AnyTool): string {
  const drawer = CATEGORY_IDS.indexOf(tool.category) + 1;
  const place = TOOLS.filter((t) => t.category === tool.category).indexOf(tool) + 1;
  return `${roman(drawer)}.${place}`;
}

/**
 * When each instrument entered history, where a date is well attested.
 * Negative years are BCE; `circa` marks traditional or approximate dates.
 */
export interface Era {
  readonly year: number;
  readonly circa?: boolean;
}

export const ERAS: Readonly<Record<string, Era>> = {
  atbash: { year: -600, circa: true },
  caesar: { year: -50, circa: true },
  vigenere: { year: 1553 },
  playfair: { year: 1854 },
  enigma: { year: 1918 },
  rot: { year: 1982, circa: true },
  leet: { year: 1985, circa: true },
  scytale: { year: -400, circa: true },
  bacon: { year: 1605 },
  polybius: { year: -150, circa: true },
  braille: { year: 1829 },
  morse: { year: 1844 },
  nato: { year: 1956 },
  t9: { year: 1995 },
  base64: { year: 1987 },
  base58: { year: 2009 },
  punycode: { year: 2003 },
  xor: { year: 1917 },
  hmac: { year: 1996 },
  aes: { year: 2001 },
  frequency: { year: 850, circa: true },
};
