/** Small number-theory helpers used by the classical ciphers. */

/** Mathematical modulo: always returns a value in [0, m). */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/** Modular multiplicative inverse via the extended Euclidean algorithm, or null. */
export function modInverse(a: number, m: number): number | null {
  let [oldR, r] = [mod(a, m), m];
  let [oldS, s] = [1, 0];
  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  return oldR === 1 ? mod(oldS, m) : null;
}
