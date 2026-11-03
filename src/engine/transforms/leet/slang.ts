/**
 * Word-level leet: hacker slang and morphology.
 *
 * Real leet is more than character substitution. The scene developed its own
 * vocabulary ("teh", "pwn", "n00b", "w00t") and morphology ("-xor", "-z",
 * "-age"). This module applies those rules before the character pass and
 * reverses them when decoding.
 */

/** Plain English word → leet slang. */
export const SLANG: Readonly<Record<string, string>> = {
  the: 'teh',
  you: 'j00',
  your: 'j00r',
  are: 'r',
  elite: '1337',
  leet: '1337',
  hacker: 'h4x0r',
  hackers: 'h4x0rz',
  hack: 'h4x',
  hacked: 'h4xx0r3d',
  own: 'pwn',
  owned: 'pwn3d',
  owns: 'pwnz',
  ownage: 'pwnage',
  noob: 'n00b',
  newbie: 'n00b',
  newbies: 'n00bz',
  dude: 'd00d',
  dudes: 'd00dz',
  cool: 'k3wl',
  rock: 'r0xx0r',
  rocks: 'r0xx0rz',
  rules: 'r00lz',
  skills: 'sk1llz',
  what: 'wut',
  and: '&',
  at: '@',
  for: '4',
  to: '2',
  too: '2',
  great: 'gr8',
  later: 'l8r',
  mate: 'm8',
  before: 'b4',
  see: 'c',
  why: 'y',
  okay: 'k',
  love: '<3',
  please: 'plz',
  thanks: 'thx',
  fear: 'ph34r',
  sucks: 'sux',
  woot: 'w00t',
  yay: 'w00t',
  games: 'g4m3z',
  software: 'w4r3z',
  warez: 'w4r3z',
  lol: 'l0l',
  because: 'b/c',
  people: 'ppl',
};

/** Leet slang (as it appears *after* character decoding) → plain English. */
export const UNSLANG: Readonly<Record<string, string>> = {
  teh: 'the',
  t3h: 'the',
  joo: 'you',
  j00: 'you',
  u: 'you',
  ur: 'your',
  joor: 'your',
  r: 'are',
  leet: 'leet',
  eleet: 'elite',
  haxor: 'hacker',
  haxxor: 'hacker',
  haxors: 'hackers',
  haxorz: 'hackers',
  haxxors: 'hackers',
  haxxorz: 'hackers',
  hax: 'hack',
  haxxored: 'hacked',
  pwn: 'own',
  pwned: 'owned',
  pwnd: 'owned',
  pwnt: 'owned',
  pwnz: 'owns',
  pwnage: 'ownage',
  noob: 'noob',
  noobz: 'noobs',
  n00b: 'noob',
  dood: 'dude',
  doodz: 'dudes',
  kewl: 'cool',
  roxxor: 'rock',
  roxxorz: 'rocks',
  roolz: 'rules',
  rulez: 'rules',
  skillz: 'skills',
  wut: 'what',
  gr8: 'great',
  l8r: 'later',
  m8: 'mate',
  b4: 'before',
  c: 'see',
  y: 'why',
  k: 'okay',
  plz: 'please',
  pls: 'please',
  thx: 'thanks',
  phear: 'fear',
  sux: 'sucks',
  woot: 'woot',
  gamez: 'games',
  warez: 'warez',
  ppl: 'people',
  '&': 'and',
  '@': 'at',
  '2': 'to',
  '4': 'for',
  '<3': 'love',
  '1337': 'leet',
  '31337': 'eleet',
};

/** Applies classic leet morphology to one lower-case word. */
export function applySuffixRules(word: string): string {
  if (word.length < 4) return word;
  return word
    .replace(/cks$/, 'x')
    .replace(/cker$/, 'xxor')
    .replace(/cked$/, 'xx0red')
    .replace(/(?<!x)er$/, 'xor')
    .replace(/(?<=[^aeiou])ed$/, "'d")
    .replace(/ing$/, "in'")
    .replace(/(?<=[^aeiousz])s$/, 'z');
}

/** Restores the capitalisation pattern of `original` onto `word`. */
export function restoreCase(original: string, word: string): string {
  if (original.length > 1 && original === original.toUpperCase() && /[A-Z]/.test(original)) {
    return word.toUpperCase();
  }
  if (/^[A-Z]/.test(original)) return word.charAt(0).toUpperCase() + word.slice(1);
  return word;
}
