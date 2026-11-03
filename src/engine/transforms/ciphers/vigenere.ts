/**
 * The Vigenère family of polyalphabetic ciphers — "le chiffre indéchiffrable"
 * (Bellaso 1553, misattributed to Vigenère), unbroken until Kasiski (1863).
 *
 *  - vigenere : C = P + K
 *  - beaufort : C = K − P   (reciprocal; used in the Hagelin M-209)
 *  - autokey  : key stream = keyword followed by the plaintext itself
 *  - gronsfeld: numeric key (digits 0–9), otherwise identical to Vigenère
 *
 * Non-letters pass through and do not consume key letters.
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { mod } from '../../util/math';

export type VigenereVariant = 'vigenere' | 'beaufort' | 'autokey' | 'gronsfeld';

export function parseKey(key: string, variant: VigenereVariant): number[] {
  if (variant === 'gronsfeld') {
    const digits = key.replace(/\s/g, '');
    if (!digits) throw new TransformError('keyRequired');
    if (/\D/.test(digits)) throw new TransformError('keyDigitsOnly');
    return [...digits].map(Number);
  }
  const letters = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (!letters) throw new TransformError(key.trim() ? 'keyLettersOnly' : 'keyRequired');
  return [...letters].map((c) => c.charCodeAt(0) - 65);
}

export function vigenereApply(
  text: string,
  key: string,
  variant: VigenereVariant,
  decrypt: boolean,
): string {
  const shifts = parseKey(key, variant);
  const stream = [...shifts];
  let k = 0;
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    const base = c >= 65 && c <= 90 ? 65 : c >= 97 && c <= 122 ? 97 : 0;
    if (!base) {
      out += text[i];
      continue;
    }
    const x = c - base;
    const s = stream[k]!;
    let y: number;
    if (variant === 'beaufort') y = mod(s - x, 26);
    else y = decrypt ? mod(x - s, 26) : mod(x + s, 26);
    if (variant === 'autokey') stream.push(decrypt ? y : x);
    else stream.push(s);
    k++;
    out += String.fromCharCode(base + y);
  }
  return out;
}

export const vigenere = defineTransform({
  kind: 'transform',
  id: 'vigenere',
  category: 'substitution',
  keywords: ['vigenere', 'vigenère', 'beaufort', 'autokey', 'gronsfeld', 'polyalphabetic', 'ویژنر'],
  sample: {
    encode: 'Attack at dawn',
    decode: 'Lxfopv ef rnhr',
  },
  options: [
    opt.select('variant', ['vigenere', 'beaufort', 'autokey', 'gronsfeld'], 'vigenere', {
      control: 'segmented',
    }),
    opt.text('key', 'LEMON', { monospace: true, maxLength: 256 }),
  ],
  encode: (input, o) => vigenereApply(input, o.key, o.variant, false),
  decode: (input, o) => vigenereApply(input, o.key, o.variant, true),
});
