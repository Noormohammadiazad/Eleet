/**
 * Affine cipher — E(x) = (a·x + b) mod 26, D(y) = a⁻¹·(y − b) mod 26.
 * `a` must be coprime with 26, which leaves 12 valid multipliers and 312 keys.
 * Caesar (a = 1) and Atbash (a = 25, b = 25) are special cases.
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { gcd, mod, modInverse } from '../../util/math';

export const AFFINE_MULTIPLIERS = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25] as const;

export function affineApply(text: string, a: number, b: number, decrypt: boolean): string {
  if (gcd(a, 26) !== 1) throw new TransformError('notCoprime', { a });
  const inv = modInverse(a, 26)!;
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    const base = c >= 65 && c <= 90 ? 65 : c >= 97 && c <= 122 ? 97 : 0;
    if (!base) {
      out += text[i];
      continue;
    }
    const x = c - base;
    const y = decrypt ? mod(inv * (x - b), 26) : mod(a * x + b, 26);
    out += String.fromCharCode(base + y);
  }
  return out;
}

export const affine = defineTransform({
  kind: 'transform',
  id: 'affine',
  category: 'substitution',
  keywords: ['affine', 'linear', 'modular', 'آفین'],
  sample: { encode: 'Affine cipher', decode: 'Ihhwvc swfrcp' },
  options: [
    opt.select(
      'a',
      AFFINE_MULTIPLIERS.map((n) => ({ value: String(n), label: String(n) })),
      '5',
    ),
    opt.number('b', 8, { min: 0, max: 25, step: 1, control: 'slider' }),
  ],
  encode: (input, o) => affineApply(input, Number(o.a), o.b, false),
  decode: (input, o) => affineApply(input, Number(o.a), o.b, true),
});
