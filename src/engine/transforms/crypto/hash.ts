/**
 * Message digests. One-way by design: there is no "decode" — which is exactly
 * why they are used for integrity checks, password storage (with salting and
 * stretching) and content addressing.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { utf8Encode } from '../../util/bytes';
import { HASH_ALGORITHMS, HASH_LABELS, digest, formatDigest } from './digest';

export const hash = defineTransform({
  kind: 'transform',
  id: 'hash',
  category: 'cryptography',
  keywords: [
    'hash',
    'digest',
    'md5',
    'sha1',
    'sha256',
    'sha512',
    'sha3',
    'keccak',
    'crc32',
    'checksum',
    'هش',
  ],
  sample: { encode: 'The quick brown fox jumps over the lazy dog' },
  options: [
    opt.select(
      'algorithm',
      HASH_ALGORITHMS.map((value) => ({ value, label: HASH_LABELS[value] })),
      'sha256',
    ),
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
  encode: async (input, o) => formatDigest(await digest(o.algorithm, utf8Encode(input)), o.format),
});
