/**
 * Deterministic pseudo-random numbers.
 *
 * "Random" features (leet glyph variety, zalgo noise, uwu stutters, homoglyph
 * density…) are driven by a seeded PRNG instead of `Math.random()`, so a given
 * input + options always yields the same output. That makes results testable,
 * reproducible and — crucially — shareable via URL.
 *
 * Algorithm: SplitMix32 to scramble the seed, then Mulberry32 as the generator.
 * Not cryptographically secure — never use it for keys (the AES tool uses
 * `crypto.getRandomValues`).
 */
export type Rng = () => number;

function splitmix32(seed: number): number {
  let z = (seed + 0x9e3779b9) | 0;
  z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
  z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
  return (z ^ (z >>> 16)) >>> 0;
}

/** Returns a function producing floats in [0, 1). */
export function createRng(seed: number): Rng {
  let state = splitmix32(Math.floor(seed));
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer in [0, max). */
export function randInt(rng: Rng, max: number): number {
  return Math.floor(rng() * max);
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[randInt(rng, items.length)]!;
}

/** True with probability `p`. */
export function chance(rng: Rng, p: number): boolean {
  return rng() < p;
}
