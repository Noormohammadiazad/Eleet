/**
 * Pig Latin — the English language game: move the leading consonant cluster
 * to the end and add "ay" ("pig" → "igpay"); vowel-initial words take "way".
 * Decoding is ambiguous ("ellway" = "well" or "ell"?), so Eleet enumerates
 * every possible split and lets the English vocabulary pick the likeliest.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { loadEnglishModel, type EnglishModel } from '../../analysis/language';
import { restoreCase } from '../leet/slang';

/** A valid leading consonant cluster: "y" starts one, "qu" travels together ("queen" → "eenquay"). */
const CLUSTER = /^(?:[^aeiouy]*qu|y?[^aeiouy]*)/;

function encodeWord(word: string, suffix: string): string {
  const lower = word.toLowerCase();
  const cluster = CLUSTER.exec(lower)![0];
  if (!cluster) return restoreCase(word, lower + suffix);
  return restoreCase(word, lower.slice(cluster.length) + cluster + 'ay');
}

function decodeWord(model: EnglishModel, word: string, suffix: string): string {
  const lower = word.toLowerCase();
  const consonant: string[] = [];
  if (lower.endsWith('ay')) {
    const base = lower.slice(0, -2);
    for (let k = 1; k <= Math.min(5, base.length - 1); k++) {
      const cluster = base.slice(-k);
      if (CLUSTER.exec(cluster)![0] === cluster) consonant.push(cluster + base.slice(0, -k));
    }
  }
  const vowel = lower.endsWith(suffix) ? [lower.slice(0, -suffix.length)] : [];
  const candidates = [...vowel, ...consonant];
  if (!candidates.length) return word;
  let best = consonant[0] ?? vowel[0]!;
  let bestRank = Number.POSITIVE_INFINITY;
  for (const c of candidates) {
    const rank = model.rank(c);
    if (rank !== null && rank < bestRank) {
      bestRank = rank;
      best = c;
    }
  }
  return restoreCase(word, best);
}

export const piglatin = defineTransform({
  kind: 'transform',
  id: 'piglatin',
  category: 'typography',
  keywords: ['pig latin', 'igpay atinlay', 'language game', 'ubbi dubbi'],
  sample: { encode: 'Please keep this secret between us' },
  options: [
    opt.select(
      'suffix',
      [
        { value: 'way', label: '-way' },
        { value: 'yay', label: '-yay' },
        { value: 'hay', label: '-hay' },
      ],
      'way',
      {
        control: 'segmented',
      },
    ),
  ],
  encode: (input, o) => input.replace(/[A-Za-z]+/g, (w) => encodeWord(w, o.suffix)),
  decode: async (input, o) => {
    const model = await loadEnglishModel();
    return input.replace(/[A-Za-z]+/g, (w) => decodeWord(model, w, o.suffix));
  },
});
