/**
 * Frequency analysis — the oldest cryptanalytic technique, first described by
 * al-Kindi in 9th-century Baghdad (*A Manuscript on Deciphering Cryptographic
 * Messages*). Letter counts are compared against English; the index of
 * coincidence and quadgram fitness then suggest what kind of cipher (if any)
 * produced the text, and — for polyalphabetic ciphers — the likely key length.
 */
import { opt } from '../core/options';
import { defineAnalyzer } from '../core/types';
import { loadEnglishModel, quadgramFitness } from './language';
import {
  ENGLISH_LETTER_FREQ,
  chiSquared,
  indexOfCoincidence,
  letterCounts,
  shannonEntropy,
} from './stats';

export type Verdict =
  | 'empty'
  | 'short'
  | 'nonLatin'
  | 'english'
  | 'transposition'
  | 'monoalphabetic'
  | 'polyalphabetic'
  | 'random';

export interface FrequencyReport {
  readonly letters: readonly { letter: string; count: number; percent: number; expected: number }[];
  readonly totalLetters: number;
  readonly chiSquared: number;
  readonly ioc: number;
  readonly entropy: number;
  readonly fitness: number;
  readonly verdict: Verdict;
  readonly bigrams: readonly { gram: string; count: number }[];
  readonly trigrams: readonly { gram: string; count: number }[];
  readonly characters: readonly { char: string; count: number; percent: number }[];
  readonly keyLengths: readonly { length: number; ioc: number }[];
}

function topNgrams(letters: string, n: number, limit: number) {
  const counts = new Map<string, number>();
  for (let i = 0; i + n <= letters.length; i++) {
    const gram = letters.slice(i, i + n);
    counts.set(gram, (counts.get(gram) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([gram, count]) => ({ gram, count }));
}

/** Average column IoC for each candidate period — peaks reveal a Vigenère key length. */
export function periodicIoc(letters: string, maxLength: number): { length: number; ioc: number }[] {
  const out = [];
  for (let length = 1; length <= maxLength; length++) {
    let sum = 0;
    for (let c = 0; c < length; c++) {
      let column = '';
      for (let i = c; i < letters.length; i += length) column += letters[i];
      sum += indexOfCoincidence(column);
    }
    out.push({ length, ioc: sum / length });
  }
  return out;
}

export const frequency = defineAnalyzer({
  kind: 'analyzer',
  id: 'frequency',
  category: 'analysis',
  keywords: [
    'frequency',
    'analysis',
    'al-kindi',
    'index of coincidence',
    'ioc',
    'chi squared',
    'cryptanalysis',
    'histogram',
  ],
  sample: {
    encode:
      'Wkh dqflhqw duw ri fubswrjudskb kdv ehhq xvhg iru wkrxvdqgv ri bhduv wr surwhfw vhfuhw phvvdjhv iurp hqhplhv dqg ulydov.',
  },
  options: [opt.number('maxKeyLength', 16, { min: 4, max: 32, step: 1, control: 'stepper' })],
  analyze: async (input, o): Promise<FrequencyReport> => {
    const model = await loadEnglishModel();
    const counts = letterCounts(input);
    const total = counts.reduce((a, b) => a + b, 0);
    const letters = input.toUpperCase().replace(/[^A-Z]/g, '');
    const nonSpace = input.replace(/\s/g, '');
    const ioc = indexOfCoincidence(input);
    const chi = chiSquared(input);
    const fitness = quadgramFitness(model, letters);

    let verdict: Verdict;
    if (!nonSpace) verdict = 'empty';
    else if (total < nonSpace.length * 0.4) verdict = 'nonLatin';
    else if (total < 25) verdict = 'short';
    else if (ioc >= 0.056) {
      if (fitness > -5.3) verdict = 'english';
      else verdict = chi / total < 0.6 ? 'transposition' : 'monoalphabetic';
    } else if (ioc >= 0.043) verdict = 'polyalphabetic';
    else verdict = total > 150 ? 'polyalphabetic' : 'random';

    const charCounts = new Map<string, number>();
    for (const ch of nonSpace) charCounts.set(ch, (charCounts.get(ch) ?? 0) + 1);

    return {
      letters: counts.map((count, i) => ({
        letter: String.fromCharCode(65 + i),
        count,
        percent: total ? (count / total) * 100 : 0,
        expected: ENGLISH_LETTER_FREQ[i]! * 100,
      })),
      totalLetters: total,
      chiSquared: chi,
      ioc,
      entropy: shannonEntropy(input),
      fitness,
      verdict,
      bigrams: topNgrams(letters, 2, 12),
      trigrams: topNgrams(letters, 3, 12),
      characters: [...charCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 32)
        .map(([char, count]) => ({ char, count, percent: (count / nonSpace.length) * 100 })),
      keyLengths: verdict === 'polyalphabetic' ? periodicIoc(letters, o.maxKeyLength) : [],
    };
  },
});
