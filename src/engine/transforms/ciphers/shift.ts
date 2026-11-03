/** Shared helper: shift ASCII letters by `n`, preserving case; everything else passes through. */
import { mod } from '../../util/math';

export function shiftLetters(text: string, n: number): string {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c >= 65 && c <= 90) out += String.fromCharCode(65 + mod(c - 65 + n, 26));
    else if (c >= 97 && c <= 122) out += String.fromCharCode(97 + mod(c - 97 + n, 26));
    else out += text[i];
  }
  return out;
}
