/**
 * Password-based authenticated encryption: AES-256-GCM with a key derived by
 * PBKDF2-HMAC-SHA-256 (600 000 iterations by default, the OWASP 2023
 * recommendation). Everything runs through WebCrypto, off the main thread.
 *
 * Output ("Eleet sealed box", Base64):
 *
 *   offset  size  field
 *   0       2     magic "EL"
 *   2       1     format version (1)
 *   3       4     PBKDF2 iterations, big-endian
 *   7       16    random salt
 *   23      12    random GCM nonce
 *   35      …     ciphertext ‖ 128-bit authentication tag
 *
 * The header is authenticated as GCM additional data, so tampering with the
 * iteration count or version is detected just like tampering with the body.
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { concatBytes, utf8Decode, utf8Encode } from '../../util/bytes';
import { base64ToBytes, bytesToBase64 } from '../encodings/base64';

const MAGIC = [0x45, 0x4c]; // "EL"
const VERSION = 1;
const HEADER = 7;
const SALT = 16;
const NONCE = 12;

type Buffer = Uint8Array<ArrayBuffer>;

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    utf8Encode(password) as Buffer,
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as Buffer, iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function sealText(
  plaintext: string,
  password: string,
  iterations: number,
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT));
  const nonce = crypto.getRandomValues(new Uint8Array(NONCE));
  const header = new Uint8Array(HEADER);
  header.set(MAGIC, 0);
  header[2] = VERSION;
  new DataView(header.buffer).setUint32(3, iterations);
  const key = await deriveKey(password, salt, iterations);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, additionalData: header },
    key,
    utf8Encode(plaintext) as Buffer,
  );
  return bytesToBase64(concatBytes(header, salt, nonce, new Uint8Array(ciphertext)));
}

export async function openText(sealed: string, password: string): Promise<string> {
  let bytes: Uint8Array;
  try {
    bytes = base64ToBytes(sealed.trim());
  } catch {
    throw new TransformError('invalidCiphertext');
  }
  if (bytes.length < HEADER + SALT + NONCE + 16 || bytes[0] !== MAGIC[0] || bytes[1] !== MAGIC[1]) {
    throw new TransformError('invalidCiphertext');
  }
  if (bytes[2] !== VERSION) throw new TransformError('invalidCiphertext');
  const header = bytes.slice(0, HEADER);
  const iterations = new DataView(header.buffer).getUint32(3);
  if (iterations < 1000 || iterations > 10_000_000) throw new TransformError('invalidCiphertext');
  const salt = bytes.slice(HEADER, HEADER + SALT);
  const nonce = bytes.slice(HEADER + SALT, HEADER + SALT + NONCE);
  const body = bytes.slice(HEADER + SALT + NONCE);
  const key = await deriveKey(password, salt, iterations);
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: nonce, additionalData: header },
      key,
      body,
    );
    return utf8Decode(new Uint8Array(plain));
  } catch {
    throw new TransformError('decryptFailed');
  }
}

export const aes = defineTransform({
  kind: 'transform',
  id: 'aes',
  category: 'cryptography',
  keywords: ['aes', 'gcm', 'encrypt', 'decrypt', 'password', 'pbkdf2', 'webcrypto', 'رمزنگاری'],
  sample: { encode: 'The launch codes are in the second drawer.' },
  options: [
    opt.text('password', '', { secret: true, maxLength: 1024 }),
    opt.select(
      'iterations',
      [
        { value: '100000', label: '100k' },
        { value: '310000', label: '310k' },
        { value: '600000', label: '600k' },
        { value: '1000000', label: '1M' },
      ],
      '600000',
      { control: 'segmented', directions: ['encode'] },
    ),
  ],
  encode: (input, o) => {
    if (!o.password) throw new TransformError('keyRequired');
    return sealText(input, o.password, Number(o.iterations));
  },
  decode: (input, o) => {
    if (!o.password) throw new TransformError('keyRequired');
    return openText(input, o.password);
  },
});
