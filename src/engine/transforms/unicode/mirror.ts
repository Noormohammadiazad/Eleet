/**
 * Mirror text — horizontally reflected look-alike glyphs in reversed order,
 * in the spirit of Leonardo da Vinci's mirror-writing notebooks.
 */
import { defineTransform } from '../../core/types';
import { graphemes } from '../../util/text';

const PAIRS: [string, string][] = [
  ['a', 'ɒ'],
  ['b', 'd'],
  ['c', 'ɔ'],
  ['e', 'ɘ'],
  ['f', 'ʇ'],
  ['g', 'ϱ'],
  ['h', 'ʜ'],
  ['j', 'ꞁ'],
  ['k', 'ʞ'],
  ['n', 'ᴎ'],
  ['p', 'q'],
  ['r', 'ɿ'],
  ['s', 'ꙅ'],
  ['t', 'ƚ'],
  ['y', 'γ'],
  ['z', 'ƹ'],
  ['B', 'ᙠ'],
  ['C', 'Ɔ'],
  ['D', 'ᗡ'],
  ['E', 'Ǝ'],
  ['F', 'ꟻ'],
  ['G', 'Ꭾ'],
  ['J', 'Ⴑ'],
  ['K', 'ꓘ'],
  ['L', '⅃'],
  ['N', 'И'],
  ['P', 'ꟼ'],
  ['Q', 'Ọ'],
  ['R', 'Я'],
  ['S', 'Ꙅ'],
  ['Z', 'Ƹ'],
  ['2', 'ς'],
  ['3', 'Ɛ'],
  ['4', 'μ'],
  ['7', 'Ⲋ'],
  ['?', '⸮'],
  ['(', ')'],
  ['[', ']'],
  ['{', '}'],
  ['<', '>'],
  ['/', '\\'],
  [',', '⹁'],
  [';', '⁏'],
];

const FORWARD = new Map<string, string>();
const BACKWARD = new Map<string, string>();
for (const [a, b] of PAIRS) {
  FORWARD.set(a, b);
  if (!FORWARD.has(b)) FORWARD.set(b, a);
  BACKWARD.set(b, a);
  if (!BACKWARD.has(a)) BACKWARD.set(a, b);
}

export const mirrorText = defineTransform({
  kind: 'transform',
  id: 'mirror',
  category: 'typography',
  keywords: ['mirror', 'reflect', 'da vinci', 'backwards', 'آینه'],
  sample: { encode: 'Leonardo wrote backwards' },
  options: [],
  encode: (input) =>
    graphemes(input)
      .reverse()
      .map((g) => FORWARD.get(g) ?? g)
      .join(''),
  decode: (input) =>
    graphemes(input)
      .reverse()
      .map((g) => BACKWARD.get(g) ?? g)
      .join(''),
});
