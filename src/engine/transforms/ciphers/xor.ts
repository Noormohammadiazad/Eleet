/**
 * Repeating-key XOR — the building block of the one-time pad and of every
 * stream cipher, and the classic "first crypto challenge" in CTFs. The output
 * is binary, so it is rendered as hex or Base64.
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { bytesToHex, hexToBytes, utf8Decode, utf8Encode } from '../../util/bytes';
import { base64ToBytes, bytesToBase64 } from '../encodings/base64';

export function xorBytes(data: Uint8Array, key: Uint8Array): Uint8Array {
  if (!key.length) throw new TransformError('keyRequired');
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) out[i] = data[i]! ^ key[i % key.length]!;
  return out;
}

function keyBytes(key: string, format: 'text' | 'hex'): Uint8Array {
  return format === 'hex' ? hexToBytes(key) : utf8Encode(key);
}

export const xor = defineTransform({
  kind: 'transform',
  id: 'xor',
  category: 'cryptography',
  keywords: ['xor', 'exclusive or', 'one-time pad', 'otp', 'stream cipher', 'ctf'],
  sample: { encode: 'Burning them, if you ain’t quick and nimble' },
  options: [
    opt.text('key', 'ICE', { monospace: true, maxLength: 512 }),
    opt.select('keyFormat', ['text', 'hex'], 'text', { control: 'segmented' }),
    opt.select(
      'format',
      [
        { value: 'hex', label: 'Hex' },
        { value: 'base64', label: 'Base64' },
      ],
      'hex',
      { control: 'segmented' },
    ),
  ],
  encode: (input, o) => {
    const out = xorBytes(utf8Encode(input), keyBytes(o.key, o.keyFormat));
    return o.format === 'hex' ? bytesToHex(out) : bytesToBase64(out);
  },
  decode: (input, o) => {
    const data = o.format === 'hex' ? hexToBytes(input) : base64ToBytes(input);
    return utf8Decode(xorBytes(data, keyBytes(o.key, o.keyFormat)), false);
  },
});
