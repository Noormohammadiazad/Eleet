/**
 * HMAC (RFC 2104) — a keyed hash that proves both integrity and authenticity.
 * Computed with WebCrypto; the key never leaves the browser and is never
 * persisted or shared.
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { utf8Encode } from '../../util/bytes';
import { formatDigest } from './digest';

export const hmac = defineTransform({
  kind: 'transform',
  id: 'hmac',
  category: 'cryptography',
  keywords: ['hmac', 'mac', 'signature', 'keyed hash', 'jwt', 'hs256', 'rfc2104'],
  sample: { encode: 'The quick brown fox jumps over the lazy dog' },
  options: [
    opt.select(
      'algorithm',
      [
        { value: 'SHA-256', label: 'HMAC-SHA256' },
        { value: 'SHA-384', label: 'HMAC-SHA384' },
        { value: 'SHA-512', label: 'HMAC-SHA512' },
        { value: 'SHA-1', label: 'HMAC-SHA1' },
      ],
      'SHA-256',
    ),
    opt.text('key', 'key', { secret: true, monospace: true, maxLength: 1024 }),
    opt.select(
      'format',
      [
        { value: 'hex', label: 'hex' },
        { value: 'hexUpper', label: 'HEX' },
        { value: 'base64', label: 'Base64' },
      ],
      'hex',
      { control: 'segmented' },
    ),
  ],
  encode: async (input, o) => {
    if (!o.key) throw new TransformError('keyRequired');
    const key = await crypto.subtle.importKey(
      'raw',
      utf8Encode(o.key) as Uint8Array<ArrayBuffer>,
      { name: 'HMAC', hash: o.algorithm },
      false,
      ['sign'],
    );
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      utf8Encode(input) as Uint8Array<ArrayBuffer>,
    );
    return formatDigest(new Uint8Array(signature), o.format);
  },
});
