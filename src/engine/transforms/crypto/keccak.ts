/**
 * Keccak-f[1600] sponge — SHA-3 (FIPS 202) and the original Keccak-256 used by
 * Ethereum. The two differ only in the domain-separation padding byte
 * (0x06 for SHA-3, 0x01 for Keccak). 64-bit lanes are held as pairs of 32-bit
 * integers, keeping the implementation fast without BigInt.
 */
const ROUND_CONSTANTS: readonly [number, number][] = [
  [0x00000001, 0x00000000],
  [0x00008082, 0x00000000],
  [0x0000808a, 0x80000000],
  [0x80008000, 0x80000000],
  [0x0000808b, 0x00000000],
  [0x80000001, 0x00000000],
  [0x80008081, 0x80000000],
  [0x00008009, 0x80000000],
  [0x0000008a, 0x00000000],
  [0x00000088, 0x00000000],
  [0x80008009, 0x00000000],
  [0x8000000a, 0x00000000],
  [0x8000808b, 0x00000000],
  [0x0000008b, 0x80000000],
  [0x00008089, 0x80000000],
  [0x00008003, 0x80000000],
  [0x00008002, 0x80000000],
  [0x00000080, 0x80000000],
  [0x0000800a, 0x00000000],
  [0x8000000a, 0x80000000],
  [0x80008081, 0x80000000],
  [0x00008080, 0x80000000],
  [0x80000001, 0x00000000],
  [0x80008008, 0x80000000],
];

/** Rotation offsets r[x + 5y]. */
const ROTATIONS = [
  0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14,
];

function keccakF(lo: Uint32Array, hi: Uint32Array): void {
  const cLo = new Uint32Array(5);
  const cHi = new Uint32Array(5);
  const bLo = new Uint32Array(25);
  const bHi = new Uint32Array(25);
  for (let round = 0; round < 24; round++) {
    // θ
    for (let x = 0; x < 5; x++) {
      cLo[x] = lo[x]! ^ lo[x + 5]! ^ lo[x + 10]! ^ lo[x + 15]! ^ lo[x + 20]!;
      cHi[x] = hi[x]! ^ hi[x + 5]! ^ hi[x + 10]! ^ hi[x + 15]! ^ hi[x + 20]!;
    }
    for (let x = 0; x < 5; x++) {
      const nLo = cLo[(x + 1) % 5]!;
      const nHi = cHi[(x + 1) % 5]!;
      const dLo = cLo[(x + 4) % 5]! ^ ((nLo << 1) | (nHi >>> 31));
      const dHi = cHi[(x + 4) % 5]! ^ ((nHi << 1) | (nLo >>> 31));
      for (let y = 0; y < 25; y += 5) {
        lo[x + y]! ^= dLo;
        hi[x + y]! ^= dHi;
      }
    }
    // ρ and π
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        const i = x + 5 * y;
        const r = ROTATIONS[i]!;
        const l = lo[i]!;
        const h = hi[i]!;
        let rl: number;
        let rh: number;
        if (r === 0) [rl, rh] = [l, h];
        else if (r < 32) [rl, rh] = [(l << r) | (h >>> (32 - r)), (h << r) | (l >>> (32 - r))];
        else if (r === 32) [rl, rh] = [h, l];
        else {
          const s = r - 32;
          [rl, rh] = [(h << s) | (l >>> (32 - s)), (l << s) | (h >>> (32 - s))];
        }
        const j = y + 5 * ((2 * x + 3 * y) % 5);
        bLo[j] = rl;
        bHi[j] = rh;
      }
    }
    // χ
    for (let y = 0; y < 25; y += 5) {
      for (let x = 0; x < 5; x++) {
        lo[x + y] = bLo[x + y]! ^ (~bLo[((x + 1) % 5) + y]! & bLo[((x + 2) % 5) + y]!);
        hi[x + y] = bHi[x + y]! ^ (~bHi[((x + 1) % 5) + y]! & bHi[((x + 2) % 5) + y]!);
      }
    }
    // ι
    lo[0]! ^= ROUND_CONSTANTS[round]![0];
    hi[0]! ^= ROUND_CONSTANTS[round]![1];
  }
}

export function keccak(
  data: Uint8Array,
  outputBits: 224 | 256 | 384 | 512,
  padByte: 0x01 | 0x06,
): Uint8Array {
  const rate = 200 - (outputBits / 8) * 2;
  const lo = new Uint32Array(25);
  const hi = new Uint32Array(25);
  const padded = new Uint8Array(Math.floor(data.length / rate) * rate + rate);
  padded.set(data);
  padded[data.length]! ^= padByte;
  padded[padded.length - 1]! ^= 0x80;

  const absorbByte = (i: number, byte: number) => {
    const lane = i >> 3;
    const shift = (i & 3) * 8;
    if ((i & 7) < 4) lo[lane]! ^= byte << shift;
    else hi[lane]! ^= byte << shift;
  };
  for (let offset = 0; offset < padded.length; offset += rate) {
    for (let i = 0; i < rate; i++) absorbByte(i, padded[offset + i]!);
    keccakF(lo, hi);
  }

  const out = new Uint8Array(outputBits / 8);
  for (let i = 0; i < out.length; i++) {
    const lane = i >> 3;
    const shift = (i & 3) * 8;
    out[i] = (((i & 7) < 4 ? lo[lane]! : hi[lane]!) >>> shift) & 0xff;
  }
  return out;
}

export const sha3 = (data: Uint8Array, bits: 224 | 256 | 384 | 512) => keccak(data, bits, 0x06);
export const keccak256 = (data: Uint8Array) => keccak(data, 256, 0x01);
