/**
 * Enigma I / M3 — a faithful simulation of the Wehrmacht and Kriegsmarine
 * three-rotor machines, including ring settings (Ringstellung), the
 * plugboard (Steckerbrett), the notch-driven stepping and the famous
 * *double-stepping anomaly* of the middle rotor.
 *
 * Because the reflector routes the signal back through the rotors, Enigma is
 * reciprocal: with identical settings, encrypting the ciphertext yields the
 * plaintext — and no letter can ever encrypt to itself, the flaw that the
 * Polish Cipher Bureau and Bletchley Park exploited.
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { groupBlocks } from '../../util/text';

export const ROTORS = {
  I: { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notches: 'Q' },
  II: { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notches: 'E' },
  III: { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notches: 'V' },
  IV: { wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', notches: 'J' },
  V: { wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK', notches: 'Z' },
  VI: { wiring: 'JPGVOUMFYQBENHZRDKASXLICTW', notches: 'ZM' },
  VII: { wiring: 'NZJHGRCXMYSWBOUFAIVLPEKQDT', notches: 'ZM' },
  VIII: { wiring: 'FKQHTLXOCBJSPDZRAMEWNIUYGV', notches: 'ZM' },
} as const;
export type RotorName = keyof typeof ROTORS;
export const ROTOR_NAMES = Object.keys(ROTORS) as RotorName[];

export const REFLECTORS = {
  // UKW-A: the reflector of the early Enigma I (in service until 1937), as in the 1930 manual.
  A: 'EJMZALYXVBWFCRQUONTSPIKHGD',
  B: 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
  C: 'FVPJIAOYEDRZXWGCTKUQSBNMHL',
} as const;
export type ReflectorName = keyof typeof REFLECTORS;

const A = 65;
const toIndex = (ch: string) => ch.charCodeAt(0) - A;
const toChar = (i: number) => String.fromCharCode(A + i);
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export interface EnigmaSettings {
  readonly rotors: readonly [RotorName, RotorName, RotorName];
  readonly reflector: ReflectorName;
  /** Ring settings, 0–25 (A–Z), left to right. */
  readonly rings: readonly [number, number, number];
  /** Initial window letters, 0–25 (A–Z), left to right. */
  readonly positions: readonly [number, number, number];
  /** Plugboard pairs such as "AB CD EF". */
  readonly plugboard: string;
}

class Rotor {
  readonly forward: number[];
  readonly backward: number[];
  readonly notches: number[];
  position: number;
  readonly ring: number;

  constructor(name: RotorName, ring: number, position: number) {
    const { wiring, notches } = ROTORS[name];
    this.forward = [...wiring].map(toIndex);
    this.backward = new Array<number>(26);
    this.forward.forEach((out, i) => (this.backward[out] = i));
    this.notches = [...notches].map(toIndex);
    this.ring = ring;
    this.position = position;
  }

  atNotch(): boolean {
    return this.notches.includes(this.position);
  }

  step(): void {
    this.position = (this.position + 1) % 26;
  }

  pass(c: number, table: number[]): number {
    const shift = this.position - this.ring;
    return (table[(c + shift + 26) % 26]! - shift + 26) % 26;
  }
}

/** Parses and validates a plugboard string into a 26-entry permutation. */
export function parsePlugboard(spec: string): number[] {
  const map = Array.from({ length: 26 }, (_, i) => i);
  const cleaned = spec.toUpperCase().replace(/[^A-Z]/g, '');
  if (cleaned.length % 2 !== 0) throw new TransformError('invalidPlugboard');
  const pairs = cleaned.match(/../g) ?? [];
  const used = new Set<number>();
  for (const pair of pairs) {
    const a = toIndex(pair[0]!);
    const b = toIndex(pair[1]!);
    if (a === b || used.has(a) || used.has(b)) throw new TransformError('invalidPlugboard');
    used.add(a).add(b);
    map[a] = b;
    map[b] = a;
  }
  return map;
}

export class EnigmaMachine {
  private readonly rotors: [Rotor, Rotor, Rotor];
  private readonly reflector: number[];
  private readonly plugboard: number[];

  constructor(settings: EnigmaSettings) {
    const [l, m, r] = settings.rotors;
    if (new Set(settings.rotors).size !== 3) throw new TransformError('duplicateRotors');
    this.rotors = [
      new Rotor(l, settings.rings[0], settings.positions[0]),
      new Rotor(m, settings.rings[1], settings.positions[1]),
      new Rotor(r, settings.rings[2], settings.positions[2]),
    ];
    this.reflector = [...REFLECTORS[settings.reflector]].map(toIndex);
    this.plugboard = parsePlugboard(settings.plugboard);
  }

  /** Current window letters, left to right. */
  get windows(): string {
    return this.rotors.map((r) => toChar(r.position)).join('');
  }

  /** Advances the rotors exactly as the pawl-and-ratchet mechanism does. */
  private stepRotors(): void {
    const [left, middle, right] = this.rotors;
    if (middle.atNotch()) {
      // Double step: the middle rotor's own notch lets the pawl push it again.
      middle.step();
      left.step();
    } else if (right.atNotch()) {
      middle.step();
    }
    right.step();
  }

  /** Presses one key (A–Z). Returns the lamp that lights up. */
  press(letter: string): string {
    this.stepRotors();
    const [left, middle, right] = this.rotors;
    let c = this.plugboard[toIndex(letter)]!;
    c = right.pass(c, right.forward);
    c = middle.pass(c, middle.forward);
    c = left.pass(c, left.forward);
    c = this.reflector[c]!;
    c = left.pass(c, left.backward);
    c = middle.pass(c, middle.backward);
    c = right.pass(c, right.backward);
    return toChar(this.plugboard[c]!);
  }

  /**
   * Encrypts (= decrypts) a message. With `keepOthers`, non-letters pass through and each
   * lamp keeps the case of its key; otherwise the output is classic upper-case letters only.
   */
  process(text: string, keepOthers: boolean): string {
    let out = '';
    for (const ch of text) {
      const upper = ch.toUpperCase();
      if (upper.length === 1 && upper >= 'A' && upper <= 'Z') {
        const lamp = this.press(upper);
        out += keepOthers && ch !== upper ? lamp.toLowerCase() : lamp;
      } else if (keepOthers) out += ch;
    }
    return out;
  }
}

const letterChoices = [...LETTERS].map((l) => ({ value: l, label: l }));
const rotorChoices = ROTOR_NAMES.map((n) => ({ value: n, label: n }));

export function settingsFromOptions(o: {
  rotor1: string;
  rotor2: string;
  rotor3: string;
  reflector: string;
  ring1: string;
  ring2: string;
  ring3: string;
  pos1: string;
  pos2: string;
  pos3: string;
  plugboard: string;
}): EnigmaSettings {
  return {
    rotors: [o.rotor1, o.rotor2, o.rotor3] as [RotorName, RotorName, RotorName],
    reflector: o.reflector as ReflectorName,
    rings: [toIndex(o.ring1), toIndex(o.ring2), toIndex(o.ring3)],
    positions: [toIndex(o.pos1), toIndex(o.pos2), toIndex(o.pos3)],
    plugboard: o.plugboard,
  };
}

function run(
  input: string,
  o: Parameters<typeof settingsFromOptions>[0] & { format: string },
): string {
  const machine = new EnigmaMachine(settingsFromOptions(o));
  if (o.format === 'groups') return groupBlocks(machine.process(input, false), 5);
  return machine.process(input, o.format === 'keep');
}

export const enigma = defineTransform({
  kind: 'transform',
  id: 'enigma',
  category: 'substitution',
  involution: true,
  keywords: ['enigma', 'rotor', 'wehrmacht', 'kriegsmarine', 'bletchley', 'turing', 'انیگما'],
  sample: { encode: 'Enigma revealed' },
  options: [
    opt.select(
      'reflector',
      [
        { value: 'A', label: 'UKW-A' },
        { value: 'B', label: 'UKW-B' },
        { value: 'C', label: 'UKW-C' },
      ],
      'B',
    ),
    opt.select('rotor1', rotorChoices, 'I'),
    opt.select('rotor2', rotorChoices, 'II'),
    opt.select('rotor3', rotorChoices, 'III'),
    opt.select('ring1', letterChoices, 'A'),
    opt.select('ring2', letterChoices, 'A'),
    opt.select('ring3', letterChoices, 'A'),
    opt.select('pos1', letterChoices, 'A'),
    opt.select('pos2', letterChoices, 'A'),
    opt.select('pos3', letterChoices, 'A'),
    opt.text('plugboard', 'BQ CR DI EJ KW MT OS PX UZ GH', { monospace: true, maxLength: 64 }),
    opt.select('format', ['keep', 'remove', 'groups'], 'keep', { control: 'segmented' }),
  ],
  encode: (input, o) => run(input, o),
  decode: (input, o) => run(input, o),
});
