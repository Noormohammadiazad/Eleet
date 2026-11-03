/**
 * Playfair — the first practical digraph cipher (Charles Wheatstone, 1854,
 * promoted by Lord Playfair). Used by the British in the Boer War and WWI.
 * Letters are enciphered in pairs on a keyed 5×5 square:
 *   same row → take the letters to the right; same column → below;
 *   otherwise → swap columns (opposite corners of the rectangle).
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { groupBlocks, lettersOnly } from '../../util/text';
import { keyedSquare } from './square';

function prepare(text: string, filler: string): string[] {
  const letters = lettersOnly(text).replace(/J/g, 'I');
  const pairs: string[] = [];
  let i = 0;
  while (i < letters.length) {
    const a = letters[i]!;
    const b = letters[i + 1];
    if (b === undefined) {
      pairs.push(a + (a === filler ? 'Q' : filler));
      i += 1;
    } else if (a === b) {
      pairs.push(a + (a === filler ? 'Q' : filler));
      i += 1;
    } else {
      pairs.push(a + b);
      i += 2;
    }
  }
  return pairs;
}

function playfair(text: string, key: string, decrypt: boolean, filler: string): string {
  const square = keyedSquare(key);
  const pos = new Map(square.map((ch, i) => [ch, i]));
  const step = decrypt ? 4 : 1; // +4 ≡ −1 (mod 5)
  const pairs = decrypt
    ? (
        lettersOnly(text)
          .replace(/J/g, 'I')
          .match(/.{1,2}/g) ?? []
      ).map((p) => (p.length === 1 ? p + filler : p))
    : prepare(text, filler);
  let out = '';
  for (const pair of pairs) {
    const ia = pos.get(pair[0]!)!;
    const ib = pos.get(pair[1]!)!;
    const [ra, ca, rb, cb] = [Math.floor(ia / 5), ia % 5, Math.floor(ib / 5), ib % 5];
    if (ra === rb) {
      out += square[ra * 5 + ((ca + step) % 5)]! + square[rb * 5 + ((cb + step) % 5)]!;
    } else if (ca === cb) {
      out += square[((ra + step) % 5) * 5 + ca]! + square[((rb + step) % 5) * 5 + cb]!;
    } else {
      out += square[ra * 5 + cb]! + square[rb * 5 + ca]!;
    }
  }
  return out;
}

/** Removes filler letters inserted between doubled letters and at the end. */
function stripFiller(text: string, filler: string): string {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    const isPadding =
      ch === filler && i % 2 === 1 && (text[i - 1] === text[i + 1] || i === text.length - 1);
    if (!isPadding) out += ch;
  }
  return out;
}

export const playfairCipher = defineTransform({
  kind: 'transform',
  id: 'playfair',
  category: 'substitution',
  keywords: ['playfair', 'wheatstone', 'digraph', 'پلی\u200Cفر'],
  sample: { encode: 'Hide the gold in the tree stump', decode: 'BMODZ BXDNA BEKUD MUIXM MOUVI F' },
  options: [
    opt.text('key', 'PLAYFAIR EXAMPLE', { monospace: true, maxLength: 128 }),
    opt.select(
      'filler',
      [
        { value: 'X', label: 'X' },
        { value: 'Q', label: 'Q' },
        { value: 'Z', label: 'Z' },
      ],
      'X',
      {
        control: 'segmented',
      },
    ),
    opt.boolean('group', true, { directions: ['encode'] }),
    opt.boolean('stripFiller', true, { directions: ['decode'] }),
  ],
  encode: (input, o) => {
    const out = playfair(input, o.key, false, o.filler);
    return o.group ? groupBlocks(out, 5) : out;
  },
  decode: (input, o) => {
    const out = playfair(input, o.key, true, o.filler);
    return o.stripFiller ? stripFiller(out, o.filler) : out;
  },
});

export { keyedSquare };
