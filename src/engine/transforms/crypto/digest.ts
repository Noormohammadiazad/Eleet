/** Unified digest API over WebCrypto (SHA-1/2) and the in-house MD5, SHA-3, Keccak and CRC-32. */
import { TransformError } from '../../core/errors';
import { bytesToHex } from '../../util/bytes';
import { bytesToBase64 } from '../encodings/base64';
import { crc32 } from './crc32';
import { keccak256, sha3 } from './keccak';
import { md5 } from './md5';

export const HASH_ALGORITHMS = [
  'md5',
  'sha1',
  'sha256',
  'sha384',
  'sha512',
  'sha3-256',
  'sha3-512',
  'keccak256',
  'crc32',
] as const;
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

export const HASH_LABELS: Record<HashAlgorithm, string> = {
  md5: 'MD5',
  sha1: 'SHA-1',
  sha256: 'SHA-256',
  sha384: 'SHA-384',
  sha512: 'SHA-512',
  'sha3-256': 'SHA3-256',
  'sha3-512': 'SHA3-512',
  keccak256: 'Keccak-256',
  crc32: 'CRC-32',
};

const SUBTLE: Partial<Record<HashAlgorithm, string>> = {
  sha1: 'SHA-1',
  sha256: 'SHA-256',
  sha384: 'SHA-384',
  sha512: 'SHA-512',
};

export async function digest(algorithm: HashAlgorithm, data: Uint8Array): Promise<Uint8Array> {
  const subtle = SUBTLE[algorithm];
  if (subtle) {
    if (!globalThis.crypto?.subtle) throw new TransformError('unsupportedAlgorithm', { algorithm });
    return new Uint8Array(await crypto.subtle.digest(subtle, data as Uint8Array<ArrayBuffer>));
  }
  switch (algorithm) {
    case 'md5':
      return md5(data);
    case 'sha3-256':
      return sha3(data, 256);
    case 'sha3-512':
      return sha3(data, 512);
    case 'keccak256':
      return keccak256(data);
    case 'crc32':
      return crc32(data);
    default:
      throw new TransformError('unsupportedAlgorithm', { algorithm });
  }
}

export type DigestFormat = 'hex' | 'hexUpper' | 'base64';

export function formatDigest(bytes: Uint8Array, format: DigestFormat): string {
  if (format === 'base64') return bytesToBase64(bytes);
  const hex = bytesToHex(bytes);
  return format === 'hexUpper' ? hex.toUpperCase() : hex;
}
