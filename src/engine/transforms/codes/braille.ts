/**
 * Braille — Louis Braille's six-dot tactile script (1824), rendered with the
 * Unicode Braille Patterns block (U+2800–U+28FF). Implements uncontracted
 * (Grade 1) English braille with the capital sign ⠠ and number sign ⠼.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';

const LETTERS = '⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠥⠧⠺⠭⠽⠵';
const CAPITAL = '⠠';
const NUMBER = '⠼';
const PUNCT: Record<string, string> = {
  ',': '⠂',
  ';': '⠆',
  ':': '⠒',
  '.': '⠲',
  '!': '⠖',
  '?': '⠦',
  "'": '⠄',
  '-': '⠤',
  '"': '⠶',
  '(': '⠐⠣',
  ')': '⠐⠜',
  '/': '⠸⠌',
};
const PUNCT_REVERSE = new Map(Object.entries(PUNCT).map(([k, v]) => [v, k]));
const LETTER_INDEX = new Map([...LETTERS].map((cell, i) => [cell, i]));

export const braille = defineTransform({
  kind: 'transform',
  id: 'braille',
  category: 'signals',
  keywords: ['braille', 'tactile', 'six dot', 'unicode braille', 'بریل'],
  sample: { encode: 'Louis Braille, 1824.' },
  options: [opt.boolean('blankCells', false, { directions: ['encode'] })],
  encode: (input, o) => {
    let out = '';
    let numberMode = false;
    for (const ch of input) {
      if (/[0-9]/.test(ch)) {
        if (!numberMode) out += NUMBER;
        numberMode = true;
        out += LETTERS[(Number(ch) + 9) % 10];
        continue;
      }
      if (/[A-Za-z]/.test(ch)) {
        // A letter a–j directly after digits needs a letter sign to avoid being read as a digit.
        if (numberMode && /[a-j]/i.test(ch)) out += '⠰';
        numberMode = false;
        if (ch !== ch.toLowerCase()) out += CAPITAL;
        out += LETTERS[ch.toLowerCase().charCodeAt(0) - 97];
        continue;
      }
      numberMode = false;
      if (ch === ' ') out += o.blankCells ? '⠀' : ' ';
      else out += PUNCT[ch] ?? ch;
    }
    return out;
  },
  decode: (input) => {
    const cells = [...input];
    let out = '';
    let capital = false;
    let numberMode = false;
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i]!;
      const pair = cell + (cells[i + 1] ?? '');
      if (PUNCT_REVERSE.has(pair) && pair.length === 2 && (cell === '⠐' || cell === '⠸')) {
        out += PUNCT_REVERSE.get(pair);
        i++;
        continue;
      }
      if (cell === CAPITAL) {
        capital = true;
        continue;
      }
      if (cell === NUMBER) {
        numberMode = true;
        continue;
      }
      if (cell === '⠰') {
        numberMode = false;
        continue;
      }
      const index = LETTER_INDEX.get(cell);
      if (index !== undefined) {
        if (numberMode && index < 10) out += String((index + 1) % 10);
        else {
          const letter = String.fromCharCode(97 + index);
          out += capital ? letter.toUpperCase() : letter;
        }
        capital = false;
        continue;
      }
      numberMode = false;
      if (cell === '⠀' || cell === ' ') out += ' ';
      else out += PUNCT_REVERSE.get(cell) ?? cell;
    }
    return out;
  },
  detect: (input) => {
    const cells = input.match(/[⠀-⣿]/g)?.length ?? 0;
    return cells > 2 && cells / input.replace(/\s/g, '').length > 0.8 ? 0.98 : 0;
  },
});
