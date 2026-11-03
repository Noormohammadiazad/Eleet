/**
 * Ascii85 (Paul E. Rutter's btoa, popularised by Adobe PostScript and PDF).
 * Four bytes become five characters in the range `!`–`u`, a 25 % overhead
 * versus Base64's 33 %. An all-zero group is abbreviated as `z`.
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { utf8Decode, utf8Encode } from '../../util/bytes';

export function bytesToAscii85(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 4) {
    const chunk = bytes.subarray(i, i + 4);
    const n = chunk.length;
    let value = 0;
    for (let j = 0; j < 4; j++) value = value * 256 + (chunk[j] ?? 0);
    if (value === 0 && n === 4) {
      out += 'z';
      continue;
    }
    const digits = new Array<string>(5);
    for (let j = 4; j >= 0; j--) {
      digits[j] = String.fromCharCode(33 + (value % 85));
      value = Math.floor(value / 85);
    }
    out += digits.slice(0, n + 1).join('');
  }
  return out;
}

export function ascii85ToBytes(text: string): Uint8Array {
  let clean = text.replace(/\s+/g, '');
  if (clean.startsWith('<~')) clean = clean.slice(2);
  if (clean.endsWith('~>')) clean = clean.slice(0, -2);
  const out: number[] = [];
  let group: number[] = [];
  const flush = (count: number) => {
    let value = 0;
    for (let j = 0; j < 5; j++) value = value * 85 + (group[j] ?? 84);
    if (value > 0xffffffff) throw new TransformError('invalidAscii85');
    for (let j = 0; j < count; j++) out.push((value >>> (24 - 8 * j)) & 0xff);
  };
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]!;
    if (ch === 'z' && group.length === 0) {
      out.push(0, 0, 0, 0);
      continue;
    }
    const code = ch.charCodeAt(0) - 33;
    if (code < 0 || code > 84)
      throw new TransformError('invalidAscii85', { char: ch, position: i + 1 });
    group.push(code);
    if (group.length === 5) {
      flush(4);
      group = [];
    }
  }
  if (group.length === 1) throw new TransformError('invalidAscii85');
  if (group.length) flush(group.length - 1);
  return Uint8Array.from(out);
}

export const ascii85 = defineTransform({
  kind: 'transform',
  id: 'ascii85',
  category: 'encodings',
  keywords: ['ascii85', 'base85', 'btoa', 'postscript', 'pdf', 'adobe'],
  sample: { encode: 'Man is distinguished' },
  options: [opt.boolean('delimiters', true, { directions: ['encode'] })],
  encode: (input, o) => {
    const body = bytesToAscii85(utf8Encode(input));
    return o.delimiters ? `<~${body}~>` : body;
  },
  decode: (input) => utf8Decode(ascii85ToBytes(input)),
  detect: (input) => (/^\s*<~[\s\S]*~>\s*$/.test(input) ? 0.95 : 0),
});
