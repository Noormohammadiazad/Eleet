/**
 * Synchronous statistics that need no language model: frequency counts,
 * index of coincidence, chi-squared and Shannon entropy.
 */

/** Standard English letter frequencies (a–z), used for chi-squared tests. */
export const ENGLISH_LETTER_FREQ: readonly number[] = [
  0.08167, 0.01492, 0.02782, 0.04253, 0.12702, 0.02228, 0.02015, 0.06094, 0.06966, 0.00153, 0.00772,
  0.04025, 0.02406, 0.06749, 0.07507, 0.01929, 0.00095, 0.05987, 0.06327, 0.09056, 0.02758, 0.00978,
  0.0236, 0.0015, 0.01974, 0.00074,
];

/** Expected index of coincidence of English text (≈ 0.0667) vs uniform random (≈ 0.0385). */
export const ENGLISH_IOC = 0.0667;
export const RANDOM_IOC = 1 / 26;

/** Counts occurrences of each ASCII letter (case-insensitive). */
export function letterCounts(text: string): number[] {
  const counts = new Array<number>(26).fill(0);
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i) | 0x20;
    if (c >= 97 && c <= 122) counts[c - 97]!++;
  }
  return counts;
}

/**
 * Pearson's chi-squared statistic of the letter distribution against English.
 * Lower is more English-like; ~0–50 for real prose, hundreds for ciphertext.
 */
export function chiSquared(text: string): number {
  const counts = letterCounts(text);
  const n = counts.reduce((a, b) => a + b, 0);
  if (n === 0) return Infinity;
  let chi = 0;
  for (let i = 0; i < 26; i++) {
    const expected = ENGLISH_LETTER_FREQ[i]! * n;
    chi += (counts[i]! - expected) ** 2 / expected;
  }
  return chi;
}

/**
 * Index of coincidence: the probability that two randomly chosen letters are
 * equal. Invariant under monoalphabetic substitution, which is why Friedman
 * used it to tell mono- from polyalphabetic ciphers and to find key lengths.
 */
export function indexOfCoincidence(text: string): number {
  const counts = letterCounts(text);
  const n = counts.reduce((a, b) => a + b, 0);
  if (n < 2) return 0;
  let sum = 0;
  for (const c of counts) sum += c * (c - 1);
  return sum / (n * (n - 1));
}

/** Shannon entropy in bits per symbol, computed over code points. */
export function shannonEntropy(text: string): number {
  const freq = new Map<string, number>();
  let n = 0;
  for (const ch of text) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
    n++;
  }
  if (n === 0) return 0;
  let h = 0;
  for (const count of freq.values()) {
    const p = count / n;
    h -= p * Math.log2(p);
  }
  return h;
}
