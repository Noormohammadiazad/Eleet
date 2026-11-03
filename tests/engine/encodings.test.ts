import { describe, expect, it } from 'vitest';
import { bytesToAscii85 } from '$engine/transforms/encodings/ascii85';
import { base58ToBytes, bytesToBase58 } from '$engine/transforms/encodings/base58';
import { punycodeDecode, punycodeEncode } from '$engine/transforms/encodings/punycode';
import { decode, encode, TORTURE } from '../helpers';

const utf8 = (s: string) => new TextEncoder().encode(s);

describe('Base64 (RFC 4648 §10 test vectors)', () => {
  it.each([
    ['', ''],
    ['f', 'Zg=='],
    ['fo', 'Zm8='],
    ['foo', 'Zm9v'],
    ['foob', 'Zm9vYg=='],
    ['fooba', 'Zm9vYmE='],
    ['foobar', 'Zm9vYmFy'],
  ])('%j ⇄ %j', async (plain, coded) => {
    expect(await encode('base64', plain)).toBe(coded);
    expect(await decode('base64', coded)).toBe(plain);
  });

  it('supports the URL-safe alphabet without padding', async () => {
    const coded = await encode('base64', '??>>', { alphabet: 'url', padding: false });
    expect(coded).toBe('Pz8-Pg');
    expect(await decode('base64', coded)).toBe('??>>');
  });

  it('round-trips UTF-8 and wraps lines', async () => {
    const coded = await encode('base64', TORTURE.repeat(3), { wrap: '64' });
    expect(coded.split('\n').every((line) => line.length <= 64)).toBe(true);
    expect(await decode('base64', coded)).toBe(TORTURE.repeat(3));
  });

  it('reports the offending character', async () => {
    await expect(decode('base64', 'Zm9v!')).rejects.toMatchObject({
      code: 'invalidBase64',
      params: { char: '!' },
    });
  });
});

describe('Base32 (RFC 4648 §10 test vectors)', () => {
  it.each([
    ['f', 'MY======'],
    ['fo', 'MZXQ===='],
    ['foo', 'MZXW6==='],
    ['foob', 'MZXW6YQ='],
    ['fooba', 'MZXW6YTB'],
    ['foobar', 'MZXW6YTBOI======'],
  ])('%j ⇄ %j', async (plain, coded) => {
    expect(await encode('base32', plain)).toBe(coded);
    expect(await decode('base32', coded)).toBe(plain);
  });

  it('base32hex vector', async () => {
    expect(await encode('base32', 'foobar', { alphabet: 'hex' })).toBe('CPNMUOJ1E8======');
  });

  it('Crockford folds look-alike characters', async () => {
    const coded = await encode('base32', 'Eleet 1337', { alphabet: 'crockford' });
    expect(
      await decode('base32', coded.replace(/1/g, 'l').replace(/0/g, 'O'), {
        alphabet: 'crockford',
      }),
    ).toBe('Eleet 1337');
  });
});

describe('Base58 / Ascii85', () => {
  it('encodes the canonical Base58 example', () => {
    expect(bytesToBase58(utf8('Hello World!'))).toBe('2NEpo7TZRRrLZSi2U');
  });

  it('preserves leading zero bytes as "1"', () => {
    const bytes = Uint8Array.of(0, 0, 1, 2, 3);
    expect(bytesToBase58(bytes).startsWith('11')).toBe(true);
    expect([...base58ToBytes(bytesToBase58(bytes))]).toEqual([...bytes]);
  });

  it('encodes "Man " as 9jqo^ and zero groups as z', () => {
    expect(bytesToAscii85(utf8('Man '))).toBe('9jqo^');
    expect(bytesToAscii85(new Uint8Array(4))).toBe('z');
  });

  it.each(['base58', 'ascii85'])('%s round-trips arbitrary text', async (id) => {
    expect(await decode(id, await encode(id, TORTURE))).toBe(TORTURE);
  });
});

describe('Positional encodings', () => {
  it('hex shows UTF-8 bytes', async () => {
    expect(await encode('hex', 'Hé')).toBe('48 c3 a9');
    expect(await decode('hex', '48c3a9')).toBe('Hé');
    expect(await decode('hex', '0x48 0xC3 0xA9')).toBe('Hé');
  });

  it('binary pads bytes to 8 bits', async () => {
    expect(await encode('binary', 'Hi')).toBe('01001000 01101001');
    expect(await decode('binary', '0100100001101001')).toBe('Hi');
  });

  it('decimal defaults to code points', async () => {
    expect(await encode('decimal', 'A€😀')).toBe('65 8364 128512');
    expect(await decode('decimal', '65, 8364, 128512')).toBe('A€😀');
  });

  it.each(['hex', 'binary', 'octal', 'decimal'])('%s round-trips in both units', async (id) => {
    for (const unit of ['bytes', 'codepoints']) {
      expect(await decode(id, await encode(id, TORTURE, { unit }), { unit })).toBe(TORTURE);
    }
  });
});

describe('Text escapes', () => {
  it('percent-encodes URI components and forms', async () => {
    expect(await encode('url', 'a b&c=d/é')).toBe('a%20b%26c%3Dd%2F%C3%A9');
    expect(await encode('url', 'a b', { mode: 'form' })).toBe('a+b');
    expect(await decode('url', 'a+b', { mode: 'form' })).toBe('a b');
    await expect(decode('url', '%E0%A4%A')).rejects.toMatchObject({ code: 'invalidPercent' });
  });

  it('encodes and decodes HTML character references', async () => {
    expect(await encode('html', '<a href="x">é</a>', { scope: 'nonAscii' })).toBe(
      '&lt;a href=&quot;x&quot;&gt;&eacute;&lt;/a&gt;',
    );
    expect(await decode('html', '&#x1F600; &#233; &copy; &unknown;')).toBe('😀 é © &unknown;');
  });

  it('writes JavaScript escapes with surrogate pairs', async () => {
    expect(await encode('unicode-escape', 'é😀')).toBe('\\u00E9\\uD83D\\uDE00');
    expect(await encode('unicode-escape', '😀', { format: 'es6' })).toBe('\\u{1F600}');
  });

  it('decodes every supported escape style at once', async () => {
    expect(await decode('unicode-escape', '\\u00E9 \\u{1F600} \\U0001F600 U+0041 \\xC3\\xA9')).toBe(
      'é 😀 😀 Aé',
    );
  });

  it.each(['js', 'es6', 'python', 'uplus', 'utf8'])(
    'unicode escape format %s round-trips',
    async (format) => {
      const text = 'Leet ✓ 🚀 سلام';
      expect(await decode('unicode-escape', await encode('unicode-escape', text, { format }))).toBe(
        text,
      );
    },
  );
});

describe('Punycode (RFC 3492)', () => {
  it.each([
    ['münchen', 'mnchen-3ya'],
    ['bücher', 'bcher-kva'],
    ['ليهمابتكلموشعربي؟', 'egbpdaj6bu4bxfgehfvwxn'],
  ])('%s ⇄ %s', (unicode, ascii) => {
    expect(punycodeEncode(unicode)).toBe(ascii);
    expect(punycodeDecode(ascii)).toBe(unicode);
  });

  it('converts whole domains label by label', async () => {
    const ascii = await encode('punycode', 'münchen.de مثال.ایران');
    expect(ascii.startsWith('xn--mnchen-3ya.de xn--')).toBe(true);
    expect(await decode('punycode', ascii)).toBe('münchen.de مثال.ایران');
  });
});
