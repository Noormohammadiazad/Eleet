/**
 * Unicode escape sequences as written in source code and specs:
 * JavaScript `\uXXXX` (with surrogate pairs), ES2015 `\u{…}`, Python
 * `\uXXXX`/`\UXXXXXXXX`, CSS `\XXXX `, `U+XXXX` notation and C-style UTF-8
 * byte escapes `\xHH`. Decoding recognises every one of these forms at once.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { utf8Decode, utf8Encode } from '../../util/bytes';

const hex = (n: number, width: number) => n.toString(16).toUpperCase().padStart(width, '0');

function escapeChar(ch: string, format: string): string {
  const cp = ch.codePointAt(0)!;
  switch (format) {
    case 'es6':
      return `\\u{${hex(cp, 1)}}`;
    case 'python':
      return cp > 0xffff ? `\\U${hex(cp, 8)}` : `\\u${hex(cp, 4)}`;
    case 'css':
      return `\\${hex(cp, 1)} `;
    case 'uplus':
      return `U+${hex(cp, 4)} `;
    case 'utf8':
      return [...utf8Encode(ch)].map((b) => `\\x${hex(b, 2)}`).join('');
    default: {
      if (cp <= 0xffff) return `\\u${hex(cp, 4)}`;
      const v = cp - 0x10000;
      return `\\u${hex(0xd800 + (v >> 10), 4)}\\u${hex(0xdc00 + (v & 0x3ff), 4)}`;
    }
  }
}

export const unicodeEscape = defineTransform({
  kind: 'transform',
  id: 'unicode-escape',
  category: 'encodings',
  keywords: ['unicode', 'escape', '\\u', 'code point', 'utf-16', 'surrogate', 'json'],
  sample: { encode: 'Leet ✓ 🚀 سلام' },
  options: [
    opt.select(
      'format',
      [
        { value: 'js', label: '\\uXXXX' },
        { value: 'es6', label: '\\u{…}' },
        { value: 'python', label: 'Python' },
        { value: 'css', label: 'CSS' },
        { value: 'uplus', label: 'U+XXXX' },
        { value: 'utf8', label: '\\xHH' },
      ],
      'js',
      { directions: ['encode'] },
    ),
    opt.boolean('asciiToo', false, { directions: ['encode'] }),
  ],
  encode: (input, o) => {
    let out = '';
    for (const ch of input) {
      const cp = ch.codePointAt(0)!;
      out += cp > 126 || o.asciiToo ? escapeChar(ch, o.format) : ch;
    }
    return o.format === 'uplus' || o.format === 'css' ? out.replace(/ $/, '') : out;
  },
  decode: (input) => {
    let text = input
      .replace(/\\u\{([0-9a-f]{1,6})\}/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/\\U([0-9a-fA-F]{8})/g, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/\\u([0-9a-f]{4})/gi, (_, h: string) => String.fromCharCode(parseInt(h, 16)))
      .replace(/U\+([0-9a-f]{4,6}) ?/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)));
    // UTF-8 byte escapes: collect runs of \xHH and decode them together.
    text = text.replace(/(?:\\x[0-9a-f]{2})+/gi, (run) =>
      utf8Decode(Uint8Array.from(run.match(/[0-9a-f]{2}/gi)!.map((h) => parseInt(h, 16))), false),
    );
    // CSS escapes: backslash + 1–6 hex digits + optional single space.
    return text.replace(/\\([0-9a-f]{1,6}) ?/gi, (_, h: string) =>
      String.fromCodePoint(parseInt(h, 16)),
    );
  },
  detect: (input) =>
    (input.match(/\\u[0-9a-f{]|\\x[0-9a-f]{2}|U\+[0-9a-f]{4}/gi)?.length ?? 0) >= 2 ? 0.9 : 0,
});
