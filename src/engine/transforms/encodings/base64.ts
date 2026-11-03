/**
 * Base64 (RFC 4648 §4) and its URL-safe variant (§5).
 * Operates on UTF-8 bytes; decoding is tolerant of whitespace, missing padding
 * and either alphabet, but rejects anything else with a precise error.
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { utf8Decode, utf8Encode } from '../../util/bytes';

const STANDARD = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const URL_SAFE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const LOOKUP = (() => {
  const table = new Int16Array(128).fill(-1);
  for (let i = 0; i < 64; i++) {
    table[STANDARD.charCodeAt(i)] = i;
    table[URL_SAFE.charCodeAt(i)] = i;
  }
  return table;
})();

export function bytesToBase64(bytes: Uint8Array, urlSafe = false, pad = true): string {
  const alphabet = urlSafe ? URL_SAFE : STANDARD;
  let out = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i]! << 16) | (bytes[i + 1]! << 8) | bytes[i + 2]!;
    out +=
      alphabet[n >> 18]! + alphabet[(n >> 12) & 63]! + alphabet[(n >> 6) & 63]! + alphabet[n & 63]!;
  }
  const rest = bytes.length - i;
  if (rest === 1) {
    const n = bytes[i]! << 16;
    out += alphabet[n >> 18]! + alphabet[(n >> 12) & 63]! + (pad ? '==' : '');
  } else if (rest === 2) {
    const n = (bytes[i]! << 16) | (bytes[i + 1]! << 8);
    out +=
      alphabet[n >> 18]! + alphabet[(n >> 12) & 63]! + alphabet[(n >> 6) & 63]! + (pad ? '=' : '');
  }
  return out;
}

export function base64ToBytes(text: string): Uint8Array {
  const clean = text.replace(/\s+/g, '').replace(/=+$/, '');
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let buffer = 0;
  let bits = 0;
  let j = 0;
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    const value = code < 128 ? LOOKUP[code]! : -1;
    if (value < 0) throw new TransformError('invalidBase64', { char: clean[i]!, position: i + 1 });
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[j++] = (buffer >> bits) & 0xff;
    }
  }
  if (clean.length % 4 === 1) throw new TransformError('invalidBase64');
  return out.subarray(0, j);
}

function wrap(text: string, width: number): string {
  if (!width) return text;
  return text.match(new RegExp(`.{1,${width}}`, 'g'))?.join('\n') ?? '';
}

export const base64 = defineTransform({
  kind: 'transform',
  id: 'base64',
  category: 'encodings',
  keywords: ['base64', 'b64', 'mime', 'rfc4648', 'atob', 'btoa'],
  sample: { encode: 'Many hands make light work. 🔐 سلام' },
  options: [
    opt.select('alphabet', ['standard', 'url'], 'standard', { control: 'segmented' }),
    opt.boolean('padding', true, { directions: ['encode'] }),
    opt.select(
      'wrap',
      [
        { value: '0', label: '∞' },
        { value: '64', label: '64' },
        { value: '76', label: '76' },
      ],
      '0',
      { directions: ['encode'], control: 'segmented' },
    ),
  ],
  encode: (input, o) =>
    wrap(bytesToBase64(utf8Encode(input), o.alphabet === 'url', o.padding), Number(o.wrap)),
  decode: (input) => utf8Decode(base64ToBytes(input)),
  detect: (input) => {
    const s = input.replace(/\s+/g, '');
    if (s.length < 4 || !/^[A-Za-z0-9+/_-]+={0,2}$/.test(s)) return 0;
    if (s.length % 4 === 1) return 0;
    return /[a-z]/.test(s) && /[A-Z]/.test(s) ? 0.9 : 0.4;
  },
});
