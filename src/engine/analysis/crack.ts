/**
 * Classical cipher cracker — automated ciphertext-only attacks:
 *
 *  - Caesar / ROT     exhaustive search over 25 shifts
 *  - Affine           exhaustive search over all 312 keys
 *  - Atbash           single candidate
 *  - Vigenère         Friedman's index of coincidence finds the period, then
 *    & Beaufort       each column is solved as a Caesar cipher by χ² (Kasiski/
 *                     Friedman/Babbage method), for the best few periods
 *  - Rail fence       every rail count and offset
 *  - Columnar         every column permutation for keys of up to 7 columns
 *
 * Candidates are ranked by English quadgram fitness.
 */
import { throwIfAborted } from '../core/errors';
import { opt } from '../core/options';
import { defineAnalyzer, type OptionValues } from '../core/types';
import { mod } from '../util/math';
import { graphemes } from '../util/text';
import { affineApply, AFFINE_MULTIPLIERS } from '../transforms/ciphers/affine';
import { columnarDecodeWithOrder } from '../transforms/ciphers/columnar';
import { railDecode } from '../transforms/ciphers/railfence';
import { shiftLetters } from '../transforms/ciphers/shift';
import { vigenereApply } from '../transforms/ciphers/vigenere';
import { periodicIoc } from './frequency';
import {
  loadEnglishModel,
  normalizedFitness as normalise,
  quadgramFitness,
  type EnglishModel,
} from './language';
import { chiSquared } from './stats';

export const CRACK_TARGETS = [
  'auto',
  'caesar',
  'affine',
  'atbash',
  'vigenere',
  'beaufort',
  'railfence',
  'columnar',
] as const;
export type CrackTarget = (typeof CRACK_TARGETS)[number];

export interface CrackCandidate {
  readonly cipher: Exclude<CrackTarget, 'auto'>;
  /** Human-readable key, e.g. "shift 3", "LEMON", "a=5, b=8". */
  readonly key: string;
  /** Tool + options that reproduce the decryption in the workbench. */
  readonly tool: string;
  readonly options: OptionValues;
  readonly plaintext: string;
  readonly fitness: number;
  /** 0–1 normalised confidence. */
  readonly score: number;
}

export interface CrackReport {
  readonly candidates: readonly CrackCandidate[];
  readonly tried: number;
}

function* permutations(n: number): Generator<number[]> {
  const a = Array.from({ length: n }, (_, i) => i);
  const c = new Array<number>(n).fill(0);
  yield [...a];
  let i = 0;
  while (i < n) {
    if (c[i]! < i) {
      const j = i % 2 === 0 ? 0 : c[i]!;
      [a[i], a[j]] = [a[j]!, a[i]!];
      yield [...a];
      c[i]!++;
      i = 0;
    } else {
      c[i] = 0;
      i++;
    }
  }
}

export async function crack(
  input: string,
  target: CrackTarget,
  maxKeyLength: number,
  signal?: AbortSignal,
): Promise<CrackReport> {
  const model: EnglishModel = await loadEnglishModel();
  const out: CrackCandidate[] = [];
  let tried = 0;
  const want = (c: CrackTarget) => target === 'auto' || target === c;
  const add = (c: Omit<CrackCandidate, 'fitness' | 'score'>, bias = 0) => {
    tried++;
    const fitness = quadgramFitness(model, c.plaintext) + bias;
    out.push({ ...c, fitness, score: normalise(fitness) });
  };
  const letters = input.toUpperCase().replace(/[^A-Z]/g, '');
  if (letters.length < 4) return { candidates: [], tried: 0 };

  if (want('caesar')) {
    for (let shift = 1; shift < 26; shift++) {
      add({
        cipher: 'caesar',
        key: `ROT${shift}`,
        tool: 'caesar',
        options: { shift },
        plaintext: shiftLetters(input, -shift),
      });
    }
  }
  if (want('atbash')) {
    add({
      cipher: 'atbash',
      key: 'A↔Z',
      tool: 'atbash',
      options: { alphabet: 'latin' },
      plaintext: input.replace(/[A-Za-z]/g, (ch) => {
        const base = ch <= 'Z' ? 65 : 97;
        return String.fromCharCode(base + 25 - (ch.charCodeAt(0) - base));
      }),
    });
  }
  if (want('affine')) {
    for (const a of AFFINE_MULTIPLIERS) {
      if (a === 1) continue;
      for (let b = 0; b < 26; b++) {
        add({
          cipher: 'affine',
          key: `a=${a}, b=${b}`,
          tool: 'affine',
          options: { a: String(a), b },
          plaintext: affineApply(input, a, b, true),
        });
      }
    }
  }
  throwIfAborted(signal);

  if (want('vigenere') || want('beaufort')) {
    const periods = periodicIoc(letters, Math.min(maxKeyLength, Math.floor(letters.length / 2)))
      .filter((p) => p.length > 1)
      .sort((a, b) => b.ioc - a.ioc)
      .slice(0, 4);
    for (const { length } of periods) {
      for (const variant of ['vigenere', 'beaufort'] as const) {
        if (!want(variant)) continue;
        let key = '';
        for (let c = 0; c < length; c++) {
          let column = '';
          for (let i = c; i < letters.length; i += length) column += letters[i];
          let best = 0;
          let bestChi = Infinity;
          for (let k = 0; k < 26; k++) {
            const plain =
              variant === 'vigenere'
                ? shiftLetters(column, -k)
                : [...column]
                    .map((ch) => String.fromCharCode(65 + mod(k - (ch.charCodeAt(0) - 65), 26)))
                    .join('');
            const chi = chiSquared(plain);
            if (chi < bestChi) {
              bestChi = chi;
              best = k;
            }
          }
          key += String.fromCharCode(65 + best);
        }
        // Collapse repeated keys (e.g. "LEMONLEMON" found at period 10 → "LEMON").
        for (let p = 1; p < key.length; p++) {
          if (key.length % p === 0 && key.slice(0, p).repeat(key.length / p) === key) {
            key = key.slice(0, p);
            break;
          }
        }
        add({
          cipher: variant,
          key,
          tool: 'vigenere',
          options: { variant, key },
          plaintext: vigenereApply(input, key, variant, true),
        });
      }
    }
  }
  throwIfAborted(signal);

  if (want('railfence')) {
    const n = graphemes(input).length;
    for (let rails = 2; rails <= Math.min(12, Math.floor(n / 2)); rails++) {
      for (let offset = 0; offset < 2 * (rails - 1); offset++) {
        // Rotated offsets often yield near-identical text; prefer the canonical (offset 0) reading.
        add(
          {
            cipher: 'railfence',
            key: `${rails} rails${offset ? `, offset ${offset}` : ''}`,
            tool: 'railfence',
            options: { rails, offset },
            plaintext: railDecode(input, rails, offset),
          },
          -0.02 * offset,
        );
      }
    }
  }

  if (want('columnar') && input.length <= 3000) {
    const chars = graphemes(input);
    const alphabet = 'ABCDEFG';
    for (let cols = 2; cols <= 7; cols++) {
      throwIfAborted(signal);
      let best: { order: number[]; text: string; fitness: number } | null = null;
      for (const perm of permutations(cols)) {
        const text = columnarDecodeWithOrder(chars, perm);
        const fitness = quadgramFitness(model, text);
        tried++;
        if (!best || fitness > best.fitness) best = { order: perm, text, fitness };
      }
      if (best) {
        // Reconstruct a keyword whose alphabetical ranking yields this column order.
        const key = new Array<string>(cols);
        best.order.forEach((col, rank) => (key[col] = alphabet[rank]!));
        const keyword = key.join('');
        out.push({
          cipher: 'columnar',
          key: keyword,
          tool: 'columnar',
          options: { key: keyword, lettersOnly: false },
          plaintext: best.text,
          fitness: best.fitness,
          score: normalise(best.fitness),
        });
      }
    }
  }

  const unique = out
    .sort((a, b) => b.fitness - a.fitness)
    .filter((c, i, all) => all.findIndex((d) => d.plaintext === c.plaintext) === i);
  // Keep the three best plus anything within reach of the winner; drop the long tail of noise.
  const best = unique[0]?.score ?? 0;
  const ranked = unique.filter((c, i) => i < 3 || c.score >= best * 0.6).slice(0, 10);
  return { candidates: ranked, tried };
}

export const cracker = defineAnalyzer({
  kind: 'analyzer',
  id: 'crack',
  category: 'analysis',
  keywords: [
    'crack',
    'break',
    'brute force',
    'solve',
    'cryptanalysis',
    'vigenere',
    'caesar',
    'kasiski',
    'friedman',
    'رمزشکن',
  ],
  sample: {
    encode:
      'Lxfopv ef rnhr. Fvr prqal vrakf elq dylr mbq hmxz fevuyr elq bbcxtsey fdwqri nsszvq ghyvugr, frxsfd aq frtrrceni fvr peehrcr rznyo fcatkth.',
  },
  options: [
    opt.select('cipher', CRACK_TARGETS, 'auto'),
    opt.number('maxKeyLength', 12, { min: 2, max: 24, step: 1, control: 'stepper' }),
  ],
  analyze: (input, o, ctx) => crack(input, o.cipher, o.maxKeyLength, ctx.signal),
});
