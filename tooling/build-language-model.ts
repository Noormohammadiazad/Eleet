/**
 * Generates `src/engine/analysis/data/english-model.ts`.
 *
 * Classical cryptanalysis (Caesar/Vigenère/transposition cracking), the Magic
 * auto-detector and the probabilistic leet decoder all need a statistical model
 * of English. This script derives one from a corpus of public-domain novels
 * published by Project Gutenberg, so the numbers are reproducible and free of
 * licensing concerns:
 *
 *   - letter unigram frequencies
 *   - a full 26×26 table of conditional bigram log-probabilities
 *   - word-initial / word-final letter distributions (word boundaries)
 *   - the most frequent quadgrams (the classic "fitness" measure)
 *   - a frequency-ranked vocabulary, topped up with modern and internet words
 *
 * Usage (requires network access; the output is committed, so CI never runs it):
 *
 *   node tooling/build-language-model.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BOOKS: Record<string, number> = {
  'Pride and Prejudice': 1342,
  'The Adventures of Sherlock Holmes': 1661,
  Frankenstein: 84,
  "Alice's Adventures in Wonderland": 11,
  'A Tale of Two Cities': 98,
  'Moby Dick': 2701,
  Dracula: 345,
  'The Time Machine': 35,
  'The War of the Worlds': 36,
  'Treasure Island': 120,
  'The Great Gatsby': 64317,
  'The Picture of Dorian Gray': 174,
  'Little Women': 37106,
  'The Count of Monte Cristo': 1184,
};

/** Contemporary vocabulary that 19th-century novels obviously lack. */
const MODERN_WORDS = `
internet online website web email computer software hardware program programming code coder
developer password username login logout account server client network hacker hackers hack
hacking hacked security secure cyber crypto cryptography cipher encryption encrypt decrypt
encrypted decrypted decode encode encoded decoded key keys data database file files download
upload phone mobile app apps video game games gamer gamers player players online offline
text texting message messages chat forum post posts blog link links click user users admin
root system systems virus malware spam bot bots digital binary pixel screen keyboard mouse
laptop wifi bluetooth google search browser cool awesome okay ok yeah hey hi hello lol omg
dude guys noob newbie elite leet owned pwned skills skill team teams level levels score
secret secrets hidden message attack defend defense agent mission launch rocket robot
science technology engineer engineering math algorithm algorithms function variable
javascript python linux windows unix terminal command shell script scripts bug bugs debug
test tests testing github repository commit branch merge release version update upgrade
music movie movies photo photos camera picture pictures friend friends family weekend
tonight tomorrow today yesterday please thanks thank sorry welcome good great nice love
`;

const here = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(here, '../src/engine/analysis/data/english-model.ts');

async function fetchBook(id: number): Promise<string> {
  const url = `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  const raw = await response.text();
  const start = raw.search(/\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG/i);
  const end = raw.search(/\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG/i);
  const body = raw.slice(start >= 0 ? raw.indexOf('\n', start) : 0, end >= 0 ? end : undefined);
  return body.replace(/[’‘]/g, "'");
}

function main(corpus: string): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const idx = (ch: string) => letters.indexOf(ch);
  const unigram = new Array<number>(26).fill(0);
  const bigram = new Array<number>(26 * 26).fill(0);
  const initial = new Array<number>(26).fill(0);
  const final = new Array<number>(26).fill(0);
  const quadgrams = new Map<string, number>();
  const words = new Map<string, number>();

  const lower = corpus.toLowerCase();
  for (const match of lower.matchAll(/[a-z]+(?:'[a-z]+)?/g)) {
    const word = match[0];
    words.set(word, (words.get(word) ?? 0) + 1);
    const plain = word.replace(/'/g, '');
    initial[idx(plain[0]!)]!++;
    final[idx(plain[plain.length - 1]!)]!++;
  }

  const stream = lower.replace(/[^a-z]/g, '');
  for (let i = 0; i < stream.length; i++) {
    const a = idx(stream[i]!);
    unigram[a]!++;
    if (i + 1 < stream.length) bigram[a * 26 + idx(stream[i + 1]!)]!++;
    if (i + 3 < stream.length) {
      const q = stream.slice(i, i + 4);
      quadgrams.set(q, (quadgrams.get(q) ?? 0) + 1);
    }
  }

  const total = unigram.reduce((a, b) => a + b, 0);
  const unigramFreq = unigram.map((n) => +(n / total).toFixed(5));

  // Conditional bigram log10-probabilities with add-0.5 smoothing, stored as
  // centi-bels (integers) to keep the file compact: value = round(-100·log10 p).
  const bigramScores: number[] = [];
  for (let a = 0; a < 26; a++) {
    let row = 0;
    for (let b = 0; b < 26; b++) row += bigram[a * 26 + b]!;
    for (let b = 0; b < 26; b++) {
      const p = (bigram[a * 26 + b]! + 0.5) / (row + 13);
      bigramScores.push(Math.round(-100 * Math.log10(p)));
    }
  }

  const dist = (counts: number[]) => {
    const sum = counts.reduce((a, b) => a + b, 0);
    return counts.map((n) => Math.round(-100 * Math.log10((n + 0.5) / (sum + 13))));
  };

  const quadTotal = [...quadgrams.values()].reduce((a, b) => a + b, 0);
  const topQuads = [...quadgrams.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3000);
  const quadFloor = Math.round(-100 * Math.log10(0.01 / quadTotal));
  const quadKeys = topQuads.map(([q]) => q).join('');
  const quadScores = topQuads.map(([, n]) => Math.round(-100 * Math.log10(n / quadTotal)));

  const modern = MODERN_WORDS.split(/\s+/).filter(Boolean);
  const ranked = [...words.entries()]
    .filter(([w, n]) => n >= 3 && (w.length > 1 || w === 'a' || w === 'i'))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6000)
    .map(([w]) => w);
  const vocabulary = [...new Set([...ranked.slice(0, 5000), ...modern, ...ranked.slice(5000)])];

  const sources = Object.entries(BOOKS)
    .map(([title, id]) => ` *   - ${title} (#${id})`)
    .join('\n');

  return `/* eslint-disable */
/**
 * English language model — GENERATED FILE, do not edit by hand.
 * Regenerate with: node tooling/build-language-model.ts
 *
 * Derived from ${total.toLocaleString('en-US')} letters of public-domain text (Project Gutenberg):
${sources}
 *
 * Log-probabilities are stored as integer centi-bels: value = round(-100 · log10 p).
 */

/** Relative frequency of a–z. */
export const UNIGRAM = ${JSON.stringify(unigramFreq)} as const;

/** 26×26 row-major table of -100·log10 P(next | previous). */
export const BIGRAM = ${JSON.stringify(bigramScores)} as const;

/** -100·log10 P(letter starts a word). */
export const WORD_INITIAL = ${JSON.stringify(dist(initial))} as const;

/** -100·log10 P(letter ends a word). */
export const WORD_FINAL = ${JSON.stringify(dist(final))} as const;

/** The ${topQuads.length} most frequent quadgrams, concatenated (4 letters each). */
export const QUADGRAM_KEYS = ${JSON.stringify(quadKeys)};

/** -100·log10 P(quadgram), aligned with QUADGRAM_KEYS. */
export const QUADGRAM_SCORES = ${JSON.stringify(quadScores)} as const;

/** Score assigned to quadgrams missing from the table. */
export const QUADGRAM_FLOOR = ${quadFloor};

/** Vocabulary ordered by descending frequency (space-separated). */
export const VOCABULARY = ${JSON.stringify(vocabulary.join(' '))};
`;
}

const texts: string[] = [];
for (const [title, id] of Object.entries(BOOKS)) {
  process.stdout.write(`Fetching ${title}… `);
  texts.push(await fetchBook(id));
  process.stdout.write('ok\n');
}
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, main(texts.join('\n')));
console.log(`Wrote ${OUTPUT}`);
