/**
 * Atbash — one of the oldest known ciphers, used in the Hebrew Bible (e.g.
 * "Sheshach" for Babel, Jeremiah 25:26). The alphabet is simply reversed:
 * A↔Z, B↔Y… Implemented for the Latin, Hebrew and Persian alphabets.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';

const ALPHABETS = {
  latin: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  hebrew: 'אבגדהוזחטיכלמנסעפצקרשת',
  persian: 'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی',
} as const;

/** Hebrew final forms and Arabic-script variants fold onto their base letters. */
const FOLD: Record<string, string> = {
  ך: 'כ',
  ם: 'מ',
  ן: 'נ',
  ף: 'פ',
  ץ: 'צ',
  ي: 'ی',
  ى: 'ی',
  ك: 'ک',
  آ: 'ا',
  أ: 'ا',
  إ: 'ا',
};

function atbash(input: string, alphabet: keyof typeof ALPHABETS): string {
  const letters = Array.from(ALPHABETS[alphabet]);
  const n = letters.length;
  const index = new Map(letters.map((ch, i) => [ch, i]));
  let out = '';
  for (const raw of input) {
    if (alphabet === 'latin') {
      const c = raw.charCodeAt(0);
      if (c >= 65 && c <= 90) out += String.fromCharCode(155 - c);
      else if (c >= 97 && c <= 122) out += String.fromCharCode(219 - c);
      else out += raw;
      continue;
    }
    const ch = FOLD[raw] ?? raw;
    const i = index.get(ch);
    out += i === undefined ? raw : letters[n - 1 - i];
  }
  return out;
}

export const atbashCipher = defineTransform({
  kind: 'transform',
  id: 'atbash',
  category: 'substitution',
  involution: true,
  keywords: ['atbash', 'hebrew', 'mirror alphabet', 'اتباش'],
  sample: { encode: 'Wizard of the coast', decode: 'Draziw lu gsv xlzhg' },
  options: [
    opt.select('alphabet', ['latin', 'hebrew', 'persian'], 'latin', { control: 'segmented' }),
  ],
  encode: (input, o) => atbash(input, o.alphabet),
  decode: (input, o) => atbash(input, o.alphabet),
});
