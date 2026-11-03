/**
 * Magic — automatic multi-layer decoding.
 *
 * Given an unknown blob ("SGVsbG8=", ".... . .-.. .-.. ---", "Uryyb"…), Magic
 * performs a beam search over ~30 decoders, up to a configurable depth, and
 * ranks every intermediate result by how much it looks like natural language
 * (English or Persian). Cheap regex detectors prune decoders that cannot
 * apply, so even three layers deep the search stays interactive.
 *
 * Inspired by the "Magic" operation of GCHQ's CyberChef, re-implemented from
 * first principles on top of Eleet's own transforms and language model.
 */
import { throwIfAborted } from '../core/errors';
import { defaultOptions, opt } from '../core/options';
import {
  defineAnalyzer,
  type AnyTransform,
  type Direction,
  type OptionValues,
} from '../core/types';
import { caesarBruteForce } from '../transforms/ciphers/caesar';
import { atbashCipher } from '../transforms/ciphers/atbash';
import { bacon } from '../transforms/ciphers/bacon';
import { rot } from '../transforms/ciphers/rot';
import { a1z26 } from '../transforms/codes/a1z26';
import { braille } from '../transforms/codes/braille';
import { morse } from '../transforms/codes/morse';
import { nato } from '../transforms/codes/nato';
import { ascii85 } from '../transforms/encodings/ascii85';
import { base32 } from '../transforms/encodings/base32';
import { base58 } from '../transforms/encodings/base58';
import { base64 } from '../transforms/encodings/base64';
import { html } from '../transforms/encodings/html';
import { punycode } from '../transforms/encodings/punycode';
import { binary, decimal, hex, octal } from '../transforms/encodings/radix';
import { unicodeEscape } from '../transforms/encodings/unicode-escape';
import { url } from '../transforms/encodings/url';
import { leet } from '../transforms/leet';
import { keyboard } from '../transforms/persian/keyboard';
import { homoglyph } from '../transforms/stego/homoglyph';
import { zeroWidth } from '../transforms/stego/zero-width';
import { reverseText } from '../transforms/text/reverse';
import { fancy } from '../transforms/unicode/fancy';
import { flipText } from '../transforms/unicode/flip';
import { zalgo } from '../transforms/unicode/zalgo';
import { languageScore, loadEnglishModel } from './language';

export interface MagicStep {
  readonly tool: string;
  readonly direction: Direction;
  readonly options: OptionValues;
  /** Short parameter hint shown in the UI, e.g. "ROT13" or "shift 7". */
  readonly hint?: string;
}

export interface MagicCandidate {
  readonly steps: readonly MagicStep[];
  readonly output: string;
  readonly score: number;
}

export interface MagicReport {
  readonly inputScore: number;
  readonly candidates: readonly MagicCandidate[];
  readonly explored: number;
}

interface Recipe {
  readonly transform: AnyTransform;
  readonly direction: Direction;
  readonly overrides?: OptionValues;
  readonly hint?: string;
  /** Returns false when the recipe obviously cannot apply to `text`. */
  readonly applies: (text: string) => boolean;
}

const letterRich = (t: string) => {
  const letters = t.match(/[A-Za-z]/g)?.length ?? 0;
  return letters >= 4 && letters / Math.max(1, t.replace(/\s/g, '').length) > 0.6;
};
const byDetector = (tr: AnyTransform) => (t: string) => (tr.detect?.(t) ?? 0) > 0.3;

const RECIPES: readonly Recipe[] = [
  { transform: base64, direction: 'decode', applies: byDetector(base64) },
  { transform: base32, direction: 'decode', applies: byDetector(base32) },
  { transform: base58, direction: 'decode', applies: byDetector(base58) },
  { transform: ascii85, direction: 'decode', applies: byDetector(ascii85) },
  { transform: hex, direction: 'decode', applies: byDetector(hex) },
  { transform: binary, direction: 'decode', applies: byDetector(binary) },
  { transform: octal, direction: 'decode', applies: byDetector(octal) },
  { transform: decimal, direction: 'decode', applies: byDetector(decimal) },
  { transform: url, direction: 'decode', applies: byDetector(url) },
  { transform: html, direction: 'decode', applies: byDetector(html) },
  { transform: unicodeEscape, direction: 'decode', applies: byDetector(unicodeEscape) },
  { transform: punycode, direction: 'decode', applies: byDetector(punycode) },
  { transform: morse, direction: 'decode', applies: byDetector(morse) },
  {
    transform: morse,
    direction: 'decode',
    overrides: { alphabet: 'persian' },
    hint: 'فارسی',
    applies: byDetector(morse),
  },
  { transform: nato, direction: 'decode', applies: byDetector(nato) },
  { transform: braille, direction: 'decode', applies: byDetector(braille) },
  { transform: a1z26, direction: 'decode', applies: byDetector(a1z26) },
  {
    transform: bacon,
    direction: 'decode',
    applies: (t) => /^[\sABab/|]+$/.test(t) && (t.match(/[ABab]/g)?.length ?? 0) >= 10,
  },
  { transform: zeroWidth, direction: 'decode', applies: byDetector(zeroWidth) },
  { transform: zalgo, direction: 'decode', applies: byDetector(zalgo) },
  { transform: fancy, direction: 'decode', applies: byDetector(fancy) },
  { transform: homoglyph, direction: 'decode', applies: byDetector(homoglyph) },
  {
    transform: rot,
    direction: 'decode',
    overrides: { variant: 'rot13' },
    hint: 'ROT13',
    applies: letterRich,
  },
  {
    transform: rot,
    direction: 'decode',
    overrides: { variant: 'rot47' },
    hint: 'ROT47',
    applies: (t) => /^[!-~\s]+$/.test(t) && /[!-/:-@[-`{-~]/.test(t),
  },
  { transform: atbashCipher, direction: 'decode', applies: letterRich },
  { transform: reverseText, direction: 'decode', applies: (t) => t.length > 3 },
  { transform: flipText, direction: 'decode', applies: (t) => /[ɐɔǝɟƃɥᴉɾʞɯɹʇʌʍʎ∀Ǝ]/.test(t) },
  {
    transform: leet,
    direction: 'decode',
    overrides: { slang: true, keepNumbers: false },
    applies: byDetector(leet),
  },
  {
    transform: keyboard,
    direction: 'encode',
    hint: 'EN → FA',
    applies: (t) => /^[a-z;',[\]\s.?]+$/.test(t) && /[a-z]{3}/.test(t),
  },
];

interface Node {
  readonly steps: MagicStep[];
  readonly text: string;
  readonly score: number;
}

export async function magic(
  input: string,
  depth: number,
  beam: number,
  signal?: AbortSignal,
): Promise<MagicReport> {
  const model = await loadEnglishModel();
  const text = input.slice(0, 20_000);
  const inputScore = languageScore(model, text);
  const seen = new Set([text]);
  const results: MagicCandidate[] = [];
  let explored = 0;
  let level: Node[] = [{ steps: [], text, score: inputScore }];

  for (let d = 1; d <= depth && level.length; d++) {
    const next: Node[] = [];
    for (const node of level) {
      throwIfAborted(signal);
      const attempts: { step: MagicStep; output: Promise<string> | string }[] = [];

      for (const recipe of RECIPES) {
        if (!recipe.applies(node.text)) continue;
        const options = { ...defaultOptions(recipe.transform.options), ...recipe.overrides };
        const fn =
          recipe.direction === 'decode' ? recipe.transform.decode : recipe.transform.encode;
        if (!fn) continue;
        const step: MagicStep = {
          tool: recipe.transform.id,
          direction: recipe.direction,
          options: recipe.overrides ?? {},
          ...(recipe.hint ? { hint: recipe.hint } : {}),
        };
        try {
          attempts.push({
            step,
            output: fn.call(recipe.transform, node.text, options as never, { signal }),
          });
        } catch {
          // A decoder rejecting the input is the expected, common case.
        }
      }

      // Caesar: instead of 25 blind branches, take the single best shift by χ².
      if (letterRich(node.text)) {
        const best = caesarBruteForce(node.text).find((c) => c.shift !== 0 && c.shift !== 13);
        if (best) {
          attempts.push({
            step: {
              tool: 'caesar',
              direction: 'decode',
              options: { shift: best.shift },
              hint: `shift ${best.shift}`,
            },
            output: best.text,
          });
        }
      }

      for (const attempt of attempts) {
        let output: string;
        try {
          output = await attempt.output;
        } catch {
          continue;
        }
        explored++;
        if (!output || output === node.text || seen.has(output)) continue;
        seen.add(output);
        const score = languageScore(model, output);
        const candidate: Node = { steps: [...node.steps, attempt.step], text: output, score };
        next.push(candidate);
        results.push({
          steps: candidate.steps,
          output,
          score: score - 0.015 * (candidate.steps.length - 1),
        });
      }
    }
    level = next.sort((a, b) => b.score - a.score).slice(0, beam);
  }

  results.sort((a, b) => b.score - a.score);
  // Always show the three best guesses; beyond that only plausible ones.
  const candidates = results.filter((c, i) => i < 3 || c.score >= 0.25).slice(0, 10);
  return { inputScore, candidates, explored };
}

export const magicAnalyzer = defineAnalyzer({
  kind: 'analyzer',
  id: 'magic',
  category: 'analysis',
  keywords: [
    'magic',
    'auto detect',
    'identify',
    'decode anything',
    'cyberchef',
    'unknown',
    'ctf',
    'تشخیص',
  ],
  sample: {
    encode: 'NTQgNjggNjUgMjAgNzEgNzUgNjkgNjMgNmIgMjAgNjIgNzIgNmYgNzcgNmUgMjAgNjYgNmYgNzg=',
  },
  options: [
    opt.number('depth', 3, { min: 1, max: 5, step: 1, control: 'stepper' }),
    opt.number('beam', 6, { min: 2, max: 16, step: 1, control: 'stepper' }),
  ],
  analyze: (input, o, ctx) => magic(input, o.depth, o.beam, ctx.signal),
});
