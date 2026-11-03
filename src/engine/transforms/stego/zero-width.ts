/**
 * Invisible-ink steganography.
 *
 * `zeroWidth` — the secret's UTF-8 bytes are written in base 4 using four
 * zero-width / invisible characters and framed by U+FEFF markers, then tucked
 * inside an innocent cover text. The framing lets the decoder ignore the
 * *legitimate* ZWNJ of Persian text and the ZWJ of emoji sequences.
 *
 * `tags` — "ASCII smuggling" with the Unicode Tags block (U+E0000–U+E007F):
 * every ASCII character has an invisible twin. Originally meant for language
 * tagging, the block became notorious in 2024 as a vector for hiding prompt
 * injections from human reviewers. Non-ASCII secrets are percent-encoded first.
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { utf8Decode, utf8Encode } from '../../util/bytes';

const DIGITS = ['\u200B', '\u200C', '\u200D', '\u2060'] as const;
const FRAME = '\uFEFF';
const TAG_BEGIN = '\u{E0001}';
const TAG_END = '\u{E007F}';

function zwEncode(secret: string): string {
  let payload = '';
  for (const byte of utf8Encode(secret)) {
    for (let shift = 6; shift >= 0; shift -= 2) payload += DIGITS[(byte >> shift) & 3];
  }
  return FRAME + payload + FRAME;
}

function zwDecode(text: string): string | null {
  const start = text.indexOf(FRAME);
  if (start < 0) return null;
  const end = text.indexOf(FRAME, start + 1);
  const body = text.slice(start + 1, end < 0 ? undefined : end);
  const digits = [...body]
    .map((ch) => DIGITS.indexOf(ch as (typeof DIGITS)[number]))
    .filter((d) => d >= 0);
  if (digits.length < 4) return null;
  const bytes = new Uint8Array(Math.floor(digits.length / 4));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] =
      (digits[4 * i]! << 6) |
      (digits[4 * i + 1]! << 4) |
      (digits[4 * i + 2]! << 2) |
      digits[4 * i + 3]!;
  }
  return utf8Decode(bytes, false);
}

function tagsEncode(secret: string): string {
  const ascii = [...secret]
    .map((ch) => (ch === '%' ? '%25' : ch.charCodeAt(0) < 0x80 ? ch : encodeURIComponent(ch)))
    .join('');
  return (
    TAG_BEGIN +
    [...ascii].map((ch) => String.fromCodePoint(0xe0000 + ch.charCodeAt(0))).join('') +
    TAG_END
  );
}

function tagsDecode(text: string): string | null {
  let ascii = '';
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (cp > 0xe0001 && cp < 0xe007f) ascii += String.fromCharCode(cp - 0xe0000);
  }
  if (!ascii) return null;
  try {
    return decodeURIComponent(ascii);
  } catch {
    return ascii;
  }
}

/** Extracts a hidden message (either scheme) from text, or null. */
export function revealHidden(
  text: string,
): { scheme: 'zeroWidth' | 'tags'; secret: string } | null {
  const tags = tagsDecode(text);
  if (tags) return { scheme: 'tags', secret: tags };
  const zw = zwDecode(text);
  return zw ? { scheme: 'zeroWidth', secret: zw } : null;
}

function embed(
  cover: string,
  payload: string,
  position: 'afterFirstWord' | 'start' | 'end',
): string {
  if (position === 'start') return payload + cover;
  if (position === 'end') return cover + payload;
  const match = /^\s*\S+/u.exec(cover);
  if (!match) return cover + payload;
  const at = match[0].length;
  return cover.slice(0, at) + payload + cover.slice(at);
}

export const zeroWidth = defineTransform({
  kind: 'transform',
  id: 'zero-width',
  category: 'steganography',
  keywords: [
    'zero width',
    'invisible',
    'steganography',
    'zwsp',
    'hidden message',
    'unicode tags',
    'ascii smuggling',
    'prompt injection',
  ],
  sample: { encode: 'Meet me at the old bridge at midnight 🌙' },
  options: [
    opt.select('scheme', ['zeroWidth', 'tags'], 'zeroWidth', {
      control: 'segmented',
      directions: ['encode'],
    }),
    opt.text('cover', 'The weather is lovely today, isn’t it?', {
      multiline: true,
      directions: ['encode'],
    }),
    opt.select('position', ['afterFirstWord', 'start', 'end'], 'afterFirstWord', {
      control: 'segmented',
      directions: ['encode'],
    }),
  ],
  encode: (input, o) => {
    if (!input) throw new TransformError('secretRequired');
    const payload = o.scheme === 'tags' ? tagsEncode(input) : zwEncode(input);
    return embed(o.cover, payload, o.position);
  },
  decode: (input) => {
    const found = revealHidden(input);
    if (!found) throw new TransformError('nothingHidden');
    return found.secret;
  },
  detect: (input) => (/[\u200B\u2060\uFEFF]|[\u{E0000}-\u{E007F}]/u.test(input) ? 0.99 : 0),
});
