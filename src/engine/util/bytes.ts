/**
 * Byte-level helpers shared by every binary-to-text encoding.
 *
 * All encodings in Eleet operate on the UTF-8 representation of the input, so
 * Persian, emoji and any other Unicode text round-trips losslessly.
 */
import { TransformError } from '../core/errors';

const encoder = new TextEncoder();
const strictDecoder = new TextDecoder('utf-8', { fatal: true });
const lenientDecoder = new TextDecoder('utf-8', { fatal: false });

export function utf8Encode(text: string): Uint8Array {
  return encoder.encode(text);
}

/**
 * Decodes UTF-8. In strict mode malformed sequences throw `invalidUtf8`;
 * otherwise they become U+FFFD (useful for XOR output and exploratory decoding).
 */
export function utf8Decode(bytes: Uint8Array, strict = true): string {
  try {
    return (strict ? strictDecoder : lenientDecoder).decode(bytes);
  } catch {
    throw new TransformError('invalidUtf8');
  }
}

/** Latin-1 view of bytes: each byte becomes exactly one code point 0–255. */
export function bytesToLatin1(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) out += String.fromCharCode(b);
  return out;
}

export function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/0x/gi, '').replace(/[\s:,-]/g, '');
  if (clean.length % 2 !== 0 || /[^0-9a-f]/i.test(clean)) {
    throw new TransformError('invalidDigits', { base: 16 });
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

/** Ratio of printable characters — a cheap "does this look like text?" signal. */
export function printableRatio(text: string): number {
  if (!text) return 0;
  let printable = 0;
  let total = 0;
  for (const ch of text) {
    total++;
    if (/[\p{L}\p{N}\p{P}\p{Zs}\p{S}\n\r\t]/u.test(ch) && ch !== '�') printable++;
  }
  return printable / total;
}
