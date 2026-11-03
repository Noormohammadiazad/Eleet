/**
 * Phone keypad text entry. *Multi-tap* spells each letter by pressing its key
 * repeatedly ("44 33 555 555 666"); *T9* (Tegic, 1995) presses each key once
 * and predicts the word from a dictionary — which Eleet reproduces by ranking
 * every vocabulary word that matches the key sequence by frequency.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { keypadIndex, keypadDigit } from './keypad';

const KEYS = ['', '', 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz'];

export const t9 = defineTransform({
  kind: 'transform',
  id: 't9',
  category: 'signals',
  keywords: ['t9', 'multitap', 'keypad', 'nokia', 'sms', 'phone'],
  sample: { encode: 'good morning' },
  options: [opt.select('mode', ['multitap', 't9'], 'multitap', { control: 'segmented' })],
  encode: (input, o) => {
    if (o.mode === 't9') {
      return input
        .toLowerCase()
        .split(/\s+/)
        .map((w) => [...w].map(keypadDigit).join(''))
        .filter(Boolean)
        .join(' ');
    }
    return [...input.toLowerCase()]
      .map((ch) => {
        if (ch === ' ') return '0';
        const key = KEYS.findIndex((letters) => letters.includes(ch));
        return key > 1 ? String(key).repeat(KEYS[key]!.indexOf(ch) + 1) : '';
      })
      .filter(Boolean)
      .join(' ');
  },
  decode: async (input, o) => {
    if (o.mode === 'multitap') {
      return input
        .trim()
        .split(/\s+/)
        .map((group) => {
          if (/^0+$/.test(group)) return ' ';
          const key = Number(group[0]);
          const letters = KEYS[key] ?? '';
          if (!letters || !/^(\d)\1*$/.test(group)) return '';
          return letters[(group.length - 1) % letters.length]!;
        })
        .join('')
        .replace(/ +/g, ' ');
    }
    // The vocabulary is frequency-ordered, so the first match is the most likely word.
    const index = await keypadIndex();
    return input
      .trim()
      .split(/[\s0]+/)
      .map((digits) => index.get(digits)?.[0] ?? digits)
      .join(' ');
  },
});
