/**
 * Base32 — RFC 4648 standard alphabet (used by TOTP secrets and onion
 * addresses), the "extended hex" alphabet (§7) and Douglas Crockford's
 * human-friendly variant (no I, L, O, U; decoding folds look-alikes).
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { utf8Decode, utf8Encode } from '../../util/bytes';

const ALPHABETS = {
  rfc4648: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
  hex: '0123456789ABCDEFGHIJKLMNOPQRSTUV',
  crockford: '0123456789ABCDEFGHJKMNPQRSTVWXYZ',
} as const;
type Alphabet = keyof typeof ALPHABETS;

export function bytesToBase32(bytes: Uint8Array, alphabet: Alphabet, pad: boolean): string {
  const chars = ALPHABETS[alphabet];
  let out = '';
  let buffer = 0;
  let bits = 0;
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += chars[(buffer >> bits) & 31];
    }
    buffer &= (1 << bits) - 1;
  }
  if (bits > 0) out += chars[(buffer << (5 - bits)) & 31];
  if (pad && alphabet !== 'crockford') while (out.length % 8) out += '=';
  return out;
}

export function base32ToBytes(text: string, alphabet: Alphabet): Uint8Array {
  let clean = text.replace(/[\s=-]+/g, '').toUpperCase();
  if (alphabet === 'crockford') clean = clean.replace(/O/g, '0').replace(/[IL]/g, '1');
  const chars = ALPHABETS[alphabet];
  const out: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < clean.length; i++) {
    const value = chars.indexOf(clean[i]!);
    if (value < 0) throw new TransformError('invalidBase32', { char: clean[i]!, position: i + 1 });
    buffer = (buffer << 5) | value;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((buffer >> bits) & 0xff);
    }
    buffer &= (1 << bits) - 1;
  }
  return Uint8Array.from(out);
}

export const base32 = defineTransform({
  kind: 'transform',
  id: 'base32',
  category: 'encodings',
  keywords: ['base32', 'rfc4648', 'crockford', 'totp', 'onion'],
  sample: { encode: 'foobar' },
  options: [
    opt.select(
      'alphabet',
      [
        { value: 'rfc4648', label: 'RFC 4648' },
        { value: 'hex', label: 'Base32hex' },
        { value: 'crockford', label: 'Crockford' },
      ],
      'rfc4648',
      { control: 'segmented' },
    ),
    opt.boolean('padding', true, { directions: ['encode'] }),
  ],
  encode: (input, o) => bytesToBase32(utf8Encode(input), o.alphabet, o.padding),
  decode: (input, o) => utf8Decode(base32ToBytes(input, o.alphabet)),
  detect: (input) => {
    const s = input.replace(/\s+/g, '');
    return s.length >= 8 && /^[A-Z2-7]+=*$/.test(s) ? 0.8 : 0;
  },
});
