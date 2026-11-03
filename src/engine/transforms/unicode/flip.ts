/**
 * Upside-down text — each character is replaced by a glyph that looks like it
 * rotated 180°, then the string is reversed. A staple of early-2000s forums
 * and MSN nicknames. Reversal is grapheme-aware, so emoji stay whole.
 */
import { defineTransform } from '../../core/types';
import { graphemes } from '../../util/text';

const PAIRS: [string, string][] = [
  ['a', 'ɐ'],
  ['b', 'q'],
  ['c', 'ɔ'],
  ['d', 'p'],
  ['e', 'ǝ'],
  ['f', 'ɟ'],
  ['g', 'ƃ'],
  ['h', 'ɥ'],
  ['i', 'ᴉ'],
  ['j', 'ɾ'],
  ['k', 'ʞ'],
  ['m', 'ɯ'],
  ['n', 'u'],
  ['r', 'ɹ'],
  ['t', 'ʇ'],
  ['v', 'ʌ'],
  ['w', 'ʍ'],
  ['y', 'ʎ'],
  ['A', '∀'],
  ['B', 'ꓭ'],
  ['C', 'Ɔ'],
  ['D', 'ꓷ'],
  ['E', 'Ǝ'],
  ['F', 'Ⅎ'],
  ['G', '⅁'],
  ['J', 'ſ'],
  ['K', 'ꓘ'],
  ['L', '˥'],
  ['M', 'W'],
  ['P', 'Ԁ'],
  ['Q', 'Ό'],
  ['R', 'ꓤ'],
  ['T', 'ꓕ'],
  ['U', '∩'],
  ['V', 'Λ'],
  ['Y', '⅄'],
  ['1', 'Ɩ'],
  ['2', 'ᄅ'],
  ['3', 'Ɛ'],
  ['4', 'ㄣ'],
  ['5', 'ϛ'],
  ['6', '9'],
  ['7', 'ㄥ'],
  ['.', '˙'],
  [',', "'"],
  ['"', '„'],
  ['?', '¿'],
  ['!', '¡'],
  ['(', ')'],
  ['[', ']'],
  ['{', '}'],
  ['<', '>'],
  ['_', '‾'],
  ['&', '⅋'],
  [';', '؛'],
];

const FORWARD = new Map<string, string>();
const BACKWARD = new Map<string, string>();
for (const [a, b] of PAIRS) {
  FORWARD.set(a, b);
  if (!FORWARD.has(b)) FORWARD.set(b, a);
  BACKWARD.set(b, a);
  if (!BACKWARD.has(a)) BACKWARD.set(a, b);
}

function flip(input: string, table: Map<string, string>): string {
  return graphemes(input)
    .reverse()
    .map((g) => table.get(g) ?? g)
    .join('');
}

export const flipText = defineTransform({
  kind: 'transform',
  id: 'flip',
  category: 'typography',
  keywords: ['upside down', 'flip', 'rotate', 'australian', 'ǝpᴉsdn'],
  sample: { encode: 'Hello from the other side!' },
  options: [],
  encode: (input) => flip(input, FORWARD),
  decode: (input) => flip(input, BACKWARD),
});
