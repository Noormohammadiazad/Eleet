/**
 * Reversal at four granularities — whole text, word order, letters within
 * each word, and line order. Grapheme-aware: emoji ZWJ sequences, flags and
 * combining marks move as whole units instead of shattering into orphaned
 * surrogates and joiners.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { graphemes } from '../../util/text';

function reverse(input: string, mode: 'text' | 'words' | 'letters' | 'lines'): string {
  switch (mode) {
    case 'words':
      return input
        .split('\n')
        .map((line) => line.split(/(\s+)/).reverse().join(''))
        .join('\n');
    case 'letters':
      return input.replace(/[\p{L}\p{N}\p{M}'’]+/gu, (w) => graphemes(w).reverse().join(''));
    case 'lines':
      return input.split('\n').reverse().join('\n');
    default:
      return graphemes(input).reverse().join('');
  }
}

export const reverseText = defineTransform({
  kind: 'transform',
  id: 'reverse',
  category: 'transposition',
  involution: true,
  keywords: ['reverse', 'backwards', 'palindrome', 'mirror', 'معکوس'],
  sample: { encode: 'Was it a car or a cat I saw? 🚗🐈' },
  options: [
    opt.select('mode', ['text', 'words', 'letters', 'lines'], 'text', { control: 'segmented' }),
  ],
  encode: (input, o) => reverse(input, o.mode),
  decode: (input, o) => reverse(input, o.mode),
});
