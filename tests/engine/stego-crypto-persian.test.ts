import { createHash, createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { digest, HASH_ALGORITHMS } from '$engine/transforms/crypto/digest';
import { md5 } from '$engine/transforms/crypto/md5';
import { keccak256, sha3 } from '$engine/transforms/crypto/keccak';
import { crc32 } from '$engine/transforms/crypto/crc32';
import { abjadSpell, abjadValue } from '$engine/transforms/persian/abjad';
import { toSkeleton } from '$engine/transforms/stego/homoglyph';
import { bytesToHex } from '$engine/util/bytes';
import { createRng } from '$engine/util/prng';
import { decode, encode, TORTURE } from '../helpers';

const utf8 = (s: string) => new TextEncoder().encode(s);
const hex = (b: Uint8Array) => bytesToHex(b);

function randomText(seed: number, length: number): string {
  const rng = createRng(seed);
  return Array.from({ length }, () => String.fromCodePoint(32 + Math.floor(rng() * 0x2000))).join(
    '',
  );
}

describe('Zero-width & tag steganography', () => {
  const cover = 'این یک متن کاملا\u064B معمولی است — nothing to see here 👨\u200D👩\u200D👧';

  it.each(['zeroWidth', 'tags'])('%s hides and reveals a Unicode secret', async (scheme) => {
    const stego = await encode('zero-width', 'رمز: 1337 🔐', { scheme, cover });
    expect(stego.replace(/[\u200B-\u200D\u2060\uFEFF]|[\u{E0000}-\u{E007F}]/gu, '')).toBe(
      cover.replace(/[\u200B-\u200D\u2060\uFEFF]/g, ''),
    );
    expect(await decode('zero-width', stego)).toBe('رمز: 1337 🔐');
  });

  it('does not mistake Persian ZWNJ or emoji ZWJ for a payload', async () => {
    await expect(decode('zero-width', cover)).rejects.toMatchObject({ code: 'nothingHidden' });
  });
});

describe('Homoglyphs', () => {
  it('replaces letters with look-alikes and folds them back', async () => {
    const spoof = await encode('homoglyph', 'paypal.com', { density: 100 });
    expect(spoof).not.toBe('paypal.com');
    expect(toSkeleton(spoof)).toBe('paypal.com');
    expect(await decode('homoglyph', spoof)).toBe('paypal.com');
  });
});

describe('Digests', () => {
  it('match RFC 1321 / FIPS 202 / Ethereum / CRC reference vectors', () => {
    expect(hex(md5(utf8('')))).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(hex(md5(utf8('abc')))).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(hex(sha3(utf8(''), 256))).toBe(
      'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a',
    );
    expect(hex(sha3(utf8('abc'), 512))).toBe(
      'b751850b1a57168a5693cd924b6b096e08f621827444f70d884f5d0240d2712e10e116e9192af3c91a7ec57647e3934057340b4cf408d5a56592f8274eec53f0',
    );
    expect(hex(keccak256(utf8('')))).toBe(
      'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470',
    );
    expect(hex(crc32(utf8('123456789')))).toBe('cbf43926');
  });

  it.each([0, 1, 55, 56, 63, 64, 135, 136, 137, 1000])(
    'agree with Node crypto for %i-byte random inputs',
    async (n) => {
      const data = utf8(randomText(n, n)).slice(0, n);
      const node: Record<string, string> = {
        md5: 'md5',
        sha1: 'sha1',
        sha256: 'sha256',
        sha384: 'sha384',
        sha512: 'sha512',
        'sha3-256': 'sha3-256',
        'sha3-512': 'sha3-512',
      };
      for (const algorithm of HASH_ALGORITHMS) {
        const reference = node[algorithm];
        if (!reference) continue;
        expect(hex(await digest(algorithm, data))).toBe(
          createHash(reference).update(data).digest('hex'),
        );
      }
    },
  );

  it('formats digests', async () => {
    expect(await encode('hash', 'abc', { algorithm: 'sha256', format: 'hexUpper' })).toMatch(
      /^BA7816BF/,
    );
    expect(await encode('hash', 'abc', { algorithm: 'md5', format: 'base64' })).toBe(
      'kAFQmDzST7DWlj99KOF/cg==',
    );
  });

  it('HMAC matches RFC 4231 test case 2 and Node', async () => {
    expect(await encode('hmac', 'what do ya want for nothing?', { key: 'Jefe' })).toBe(
      '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
    );
    expect(await encode('hmac', TORTURE, { key: 'k', algorithm: 'SHA-512' })).toBe(
      createHmac('sha512', 'k').update(TORTURE).digest('hex'),
    );
  });
});

describe('AES-256-GCM sealed boxes', () => {
  it('round-trips and rejects the wrong password or tampering', async () => {
    const sealed = await encode('aes', TORTURE, {
      password: 'correct horse',
      iterations: '100000',
    });
    expect(sealed).toMatch(/^RUwB/); // "EL" + version 1
    expect(await decode('aes', sealed, { password: 'correct horse' })).toBe(TORTURE);
    await expect(decode('aes', sealed, { password: 'wrong' })).rejects.toMatchObject({
      code: 'decryptFailed',
    });
    const tampered = sealed.slice(0, 60) + (sealed[60] === 'A' ? 'B' : 'A') + sealed.slice(61);
    await expect(decode('aes', tampered, { password: 'correct horse' })).rejects.toMatchObject({
      code: 'decryptFailed',
    });
  });

  it('uses a fresh salt and nonce every time', async () => {
    const a = await encode('aes', 'x', { password: 'p', iterations: '100000' });
    const b = await encode('aes', 'x', { password: 'p', iterations: '100000' });
    expect(a).not.toBe(b);
  });

  it('requires a password', async () => {
    await expect(encode('aes', 'x', { password: '' })).rejects.toMatchObject({
      code: 'keyRequired',
    });
  });
});

describe('Persian tools', () => {
  it('fixes text typed with the wrong keyboard layout (both ways)', async () => {
    expect(await encode('keyboard', 'sghl nkdh')).toBe('سلام دنیا');
    expect(await decode('keyboard', 'سلام دنیا')).toBe('sghl nkdh');
    expect(await encode('keyboard', 'Hdkil')).toBe('آینهم');
  });

  it('computes abjad values and spells numbers', async () => {
    expect(abjadValue('ابجد')).toBe(10);
    expect(abjadValue('ایران')).toBe(262);
    expect(abjadSpell(1404)).toBe('غتد');
    expect(await encode('abjad', 'سلام', { breakdown: 'total' })).toBe('131');
    expect(await decode('abjad', '۱۴۰۴')).toBe('غتد');
  });

  it('converts digit systems', async () => {
    expect(await encode('digits', 'v2.5 ٣٫١٤', { target: 'persian' })).toBe('v۲٫۵ ۳٫۱۴');
    expect(await encode('digits', '۱۴۰۵/۰۷/۰۶', { target: 'latin' })).toBe('1405/07/06');
  });

  it('transliterates Persian to Finglish and back', async () => {
    expect(await encode('finglish', 'سلام دوست من، خوبی؟')).toBe('salam doost man, khoobi?');
    expect(await encode('finglish', 'کتاب\u200Cها')).toBe('ketabha');
    expect(await encode('finglish', 'حال', { arabizi: true })).toBe('7al');
    expect(await decode('finglish', 'salam doost e man, merci!')).toBe('سلام دوست من، مرسی!');
  });
});
