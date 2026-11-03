/**
 * Probabilistic leet decoder.
 *
 * Decoding leet is genuinely ambiguous: `1` may be *i* or *l*, `|` may be *i*,
 * *l* or part of `|-|` (*h*), `(` may be *c* or the start of `()` (*o*), and
 * `ph` may be *f* or simply "ph". A greedy table lookup gets this wrong
 * constantly, so Eleet treats decoding as a search problem:
 *
 *  1. Each whitespace-delimited chunk is scanned for every glyph that could
 *     start at every position (multi-character ASCII art included).
 *  2. A beam search explores segmentations, scoring each hypothesis with an
 *     English letter-bigram model, word-boundary statistics and glyph priors.
 *  3. Completed words receive a dictionary bonus (≈6 000-word vocabulary),
 *     so `l1k3` resolves to "like" rather than "llke".
 *  4. Hacker slang and leet morphology are reversed ("teh" → "the",
 *     "haxxor" → "hacker", "skillz" → "skills").
 */
import { throwIfAborted } from '../../core/errors';
import { loadEnglishModel, type EnglishModel } from '../../analysis/language';
import { reverseIndex, type ReverseGlyph } from './alphabet';
import { UNSLANG, restoreCase } from './slang';

export interface LeetDecodeOptions {
  readonly slang: boolean;
  readonly keepNumbers: boolean;
}

interface Candidate {
  readonly length: number;
  readonly letter: string;
  readonly prior: number;
}

interface Hypothesis {
  out: string;
  word: string;
  prev: number;
  score: number;
  /** Literal (non-glyph) letters emitted so far, split by case — used to restore SHOUTING. */
  upper: number;
  lower: number;
}

const BEAM_WIDTH = 24;
const TIER_PRIOR = { 1: -0.3, 2: -0.8, 3: -0.15, 4: -0.2 } as const;
/** Extra cost for glyphs made of ASCII letters (`ph`, `vv`, `z`) — they compete with a literal reading. */
const LETTER_GLYPH_PENALTY = -1.3;
/** Cost of keeping a glyph character (digit/symbol) literally instead of decoding it. */
const LITERAL_GLYPH_PENALTY = -6;
/** Pure numbers are decoded only when they spell one of the N most frequent words ("15" → "is"). */
const NUMBER_WORD_MAX_RANK = 400;

let glyphIndex: ReverseGlyph[] | null = null;
let glyphChars: Set<string> | null = null;

function index(): { glyphs: ReverseGlyph[]; chars: Set<string> } {
  glyphIndex ??= reverseIndex();
  glyphChars ??= new Set(glyphIndex.flatMap((g) => [...g.glyph].filter((c) => !/[a-z]/i.test(c))));
  return { glyphs: glyphIndex, chars: glyphChars };
}

/** Lower-cases ASCII only, so string offsets never shift (unlike `toLowerCase` on İ). */
function asciiLower(text: string): string {
  return text.replace(/[A-Z]/g, (c) => c.toLowerCase());
}

function candidatesAt(chunkLower: string, pos: number, glyphs: ReverseGlyph[]): Candidate[] {
  const out: Candidate[] = [];
  for (const g of glyphs) {
    const glyph = asciiLower(g.glyph);
    if (chunkLower.startsWith(glyph, pos)) {
      const prior = TIER_PRIOR[g.tier] + (/[a-z]/.test(glyph) ? LETTER_GLYPH_PENALTY : 0);
      out.push({ length: glyph.length, letter: g.letter, prior });
    }
  }
  return out;
}

/** Inflections accepted when the stem is in the vocabulary. */
const INFLECTIONS: readonly [suffix: string, replacement: string][] = [
  ['s', ''],
  ['es', ''],
  ["'s", ''],
  ['ed', ''],
  ['ed', 'e'],
  ['ing', ''],
  ['ing', 'e'],
  ['ly', ''],
  ['er', ''],
  ['ers', ''],
];

function isKnown(model: EnglishModel, word: string): boolean {
  if (model.has(word)) return true;
  return INFLECTIONS.some(
    ([suffix, replacement]) =>
      word.length > suffix.length + 2 &&
      word.endsWith(suffix) &&
      model.has(word.slice(0, -suffix.length) + replacement),
  );
}

function wordScore(model: EnglishModel, word: string, slang: boolean): number {
  if (!word) return 0;
  if (slang && Object.hasOwn(UNSLANG, word)) return 1.5;
  if (isKnown(model, word)) return 2 + 0.25 * word.length;
  return word.length === 1 ? -1.5 : -1;
}

function closeWord(model: EnglishModel, h: Hypothesis, slang: boolean): number {
  return h.word ? model.final(h.prev) + wordScore(model, h.word, slang) : 0;
}

/** Undo leet morphology when it produces a dictionary word. */
function unslangWord(model: EnglishModel, word: string, slang: boolean): string {
  const lower = word.toLowerCase();
  if (!slang) return word;
  if (Object.hasOwn(UNSLANG, lower)) return restoreCase(word, UNSLANG[lower]!);
  if (model.has(lower)) return word;
  const variants = [
    lower.replace(/z$/, 's'),
    lower.replace(/xx?or$/, 'er'),
    lower.replace(/xx?or$/, 'cker'),
    lower.replace(/xx?orz$/, 'ers'),
    lower.replace(/'d$/, 'ed'),
    lower.replace(/in'?$/, 'ing'),
    lower.replace(/x$/, 'cks'),
  ];
  for (const v of variants) if (v !== lower && model.has(v)) return restoreCase(word, v);
  return word;
}

function decodeChunk(model: EnglishModel, chunk: string, o: LeetDecodeOptions): string {
  const trailing = /[.,!?;:"')\]]*$/.exec(chunk)?.[0] ?? '';
  const core = chunk.slice(0, chunk.length - trailing.length);
  if (o.slang && core && Object.hasOwn(UNSLANG, core.toLowerCase())) {
    return restoreCase(core, UNSLANG[core.toLowerCase()]!) + trailing;
  }
  const numeric = o.keepNumbers && /^[+-]?\d+(?:[.,:/-]\d+)*$/.test(core);

  const { glyphs, chars } = index();
  const lower = asciiLower(chunk);
  const n = chunk.length;

  let frontier = new Map<string, Hypothesis>([
    ['', { out: '', word: '', prev: -1, score: 0, upper: 0, lower: 0 }],
  ]);
  const pending: Map<string, Hypothesis>[] = Array.from({ length: n + 1 }, () => new Map());
  pending[0] = frontier;

  const push = (pos: number, h: Hypothesis) => {
    const bucket = pending[pos]!;
    const key = h.word;
    const existing = bucket.get(key);
    if (!existing || existing.score < h.score) bucket.set(key, h);
  };

  for (let pos = 0; pos < n; pos++) {
    frontier = pending[pos]!;
    if (!frontier.size) continue;
    const beam = [...frontier.values()].sort((a, b) => b.score - a.score).slice(0, BEAM_WIDTH);
    pending[pos] = new Map();
    const candidates = candidatesAt(lower, pos, glyphs);
    const cp = chunk.codePointAt(pos)!;
    const ch = String.fromCodePoint(cp);

    for (const h of beam) {
      for (const c of candidates) {
        const li = c.letter.charCodeAt(0) - 97;
        const transition = h.prev < 0 ? model.initial(li) : model.bigram(h.prev, li);
        push(pos + c.length, {
          ...h,
          out: h.out + c.letter,
          word: h.word + c.letter,
          prev: li,
          score: h.score + transition + c.prior,
        });
      }
      if (/^[a-z]$/i.test(ch)) {
        const li = ch.toLowerCase().charCodeAt(0) - 97;
        const transition = h.prev < 0 ? model.initial(li) : model.bigram(h.prev, li);
        const isUpper = ch !== ch.toLowerCase();
        push(pos + 1, {
          out: h.out + ch,
          word: h.word + ch.toLowerCase(),
          prev: li,
          score: h.score + transition,
          upper: h.upper + (isUpper ? 1 : 0),
          lower: h.lower + (isUpper ? 0 : 1),
        });
      } else {
        const penalty = chars.has(ch) ? LITERAL_GLYPH_PENALTY : 0;
        push(pos + ch.length, {
          ...h,
          out: h.out + ch,
          word: '',
          prev: -1,
          score: h.score + closeWord(model, h, o.slang) + penalty,
        });
      }
    }
  }

  let best: Hypothesis | null = null;
  let bestScore = -Infinity;
  for (const h of pending[n]!.values()) {
    const total = h.score + closeWord(model, h, o.slang);
    if (total > bestScore) {
      bestScore = total;
      best = h;
    }
  }
  let decoded = best?.out ?? chunk;
  // "H3LL0" → "HELLO": if every literal letter was upper-case, the word was shouted.
  if (best && best.upper >= 2 && best.lower === 0) decoded = decoded.toUpperCase();
  if (numeric) {
    const rank = model.rank(decoded.slice(0, decoded.length - trailing.length).toLowerCase());
    if (rank === null || rank > NUMBER_WORD_MAX_RANK || decoded.length - trailing.length < 2) {
      return chunk;
    }
  }
  return decoded.replace(/[A-Za-z']+/g, (word) => unslangWord(model, word, o.slang));
}

export async function decodeLeet(
  input: string,
  o: LeetDecodeOptions,
  signal?: AbortSignal,
): Promise<string> {
  const model = await loadEnglishModel();
  const parts = input.split(/(\s+)/);
  let out = '';
  for (const part of parts) {
    throwIfAborted(signal);
    out += !part || /^\s+$/.test(part) ? part : decodeChunk(model, part, o);
  }
  return out;
}
