/**
 * Base58 — Satoshi Nakamoto's alphabet for Bitcoin addresses: Base64 minus
 * the ambiguous `0 O I l` and the non-alphanumeric `+ /`. Also the Flickr
 * short-URL and Ripple alphabets. Leading zero bytes map to leading "1"s.
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { utf8Decode, utf8Encode } from '../../util/bytes';

const ALPHABETS = {
  bitcoin: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
  flickr: '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ',
  ripple: 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz',
} as const;
type Alphabet = keyof typeof ALPHABETS;

export function bytesToBase58(bytes: Uint8Array, alphabet: Alphabet = 'bitcoin'): string {
  const chars = ALPHABETS[alphabet];
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
  const digits: number[] = [];
  for (let i = zeros; i < bytes.length; i++) {
    let carry = bytes[i]!;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j]! << 8;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  return (
    chars[0]!.repeat(zeros) +
    digits
      .reverse()
      .map((d) => chars[d])
      .join('')
  );
}

export function base58ToBytes(text: string, alphabet: Alphabet = 'bitcoin'): Uint8Array {
  const chars = ALPHABETS[alphabet];
  const clean = text.replace(/\s+/g, '');
  let zeros = 0;
  while (zeros < clean.length && clean[zeros] === chars[0]) zeros++;
  const bytes: number[] = [];
  for (let i = zeros; i < clean.length; i++) {
    const value = chars.indexOf(clean[i]!);
    if (value < 0) throw new TransformError('invalidBase58', { char: clean[i]!, position: i + 1 });
    let carry = value;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j]! * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  return Uint8Array.from([...new Array<number>(zeros).fill(0), ...bytes.reverse()]);
}

export const base58 = defineTransform({
  kind: 'transform',
  id: 'base58',
  category: 'encodings',
  keywords: ['base58', 'bitcoin', 'btc', 'flickr', 'ripple'],
  sample: { encode: 'Hello World!' },
  options: [
    opt.select(
      'alphabet',
      [
        { value: 'bitcoin', label: 'Bitcoin' },
        { value: 'flickr', label: 'Flickr' },
        { value: 'ripple', label: 'Ripple' },
      ],
      'bitcoin',
      { control: 'segmented' },
    ),
  ],
  encode: (input, o) => bytesToBase58(utf8Encode(input), o.alphabet),
  decode: (input, o) => utf8Decode(base58ToBytes(input, o.alphabet)),
  detect: (input) => {
    const s = input.trim();
    return s.length >= 6 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(s) ? 0.6 : 0;
  },
});
