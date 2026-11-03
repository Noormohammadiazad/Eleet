/**
 * Punycode (RFC 3492) — the Bootstring encoding that lets Internationalised
 * Domain Names travel through the ASCII-only DNS (`münchen` → `xn--mnchen-3ya`).
 * It is also the mechanism behind IDN homograph attacks, which is why Eleet
 * pairs it with the homoglyph tools.
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';

const BASE = 36;
const T_MIN = 1;
const T_MAX = 26;
const SKEW = 38;
const DAMP = 700;
const INITIAL_BIAS = 72;
const INITIAL_N = 128;
const MAX_INT = 0x7fffffff;

function adapt(delta: number, numPoints: number, firstTime: boolean): number {
  delta = firstTime ? Math.floor(delta / DAMP) : delta >> 1;
  delta += Math.floor(delta / numPoints);
  let k = 0;
  while (delta > ((BASE - T_MIN) * T_MAX) >> 1) {
    delta = Math.floor(delta / (BASE - T_MIN));
    k += BASE;
  }
  return k + Math.floor(((BASE - T_MIN + 1) * delta) / (delta + SKEW));
}

const digitToChar = (d: number) => String.fromCharCode(d + 22 + 75 * (d < 26 ? 1 : 0));

function charToDigit(code: number): number {
  if (code >= 48 && code <= 57) return code - 22;
  if (code >= 65 && code <= 90) return code - 65;
  if (code >= 97 && code <= 122) return code - 97;
  return BASE;
}

export function punycodeEncode(input: string): string {
  const cps = Array.from(input, (ch) => ch.codePointAt(0)!);
  let output = cps
    .filter((c) => c < 0x80)
    .map((c) => String.fromCharCode(c))
    .join('');
  const basicLength = output.length;
  let handled = basicLength;
  if (basicLength) output += '-';
  let n = INITIAL_N;
  let delta = 0;
  let bias = INITIAL_BIAS;
  while (handled < cps.length) {
    const m = Math.min(...cps.filter((c) => c >= n));
    if (m - n > Math.floor((MAX_INT - delta) / (handled + 1)))
      throw new TransformError('invalidPunycode');
    delta += (m - n) * (handled + 1);
    n = m;
    for (const c of cps) {
      if (c < n) delta++;
      if (c === n) {
        let q = delta;
        for (let k = BASE; ; k += BASE) {
          const t = k <= bias ? T_MIN : k >= bias + T_MAX ? T_MAX : k - bias;
          if (q < t) break;
          output += digitToChar(t + ((q - t) % (BASE - t)));
          q = Math.floor((q - t) / (BASE - t));
        }
        output += digitToChar(q);
        bias = adapt(delta, handled + 1, handled === basicLength);
        delta = 0;
        handled++;
      }
    }
    delta++;
    n++;
  }
  return output;
}

export function punycodeDecode(input: string): string {
  const output: number[] = [];
  const basic = Math.max(0, input.lastIndexOf('-'));
  for (let j = 0; j < basic; j++) {
    if (input.charCodeAt(j) >= 0x80) throw new TransformError('invalidPunycode');
    output.push(input.charCodeAt(j));
  }
  let n = INITIAL_N;
  let bias = INITIAL_BIAS;
  let i = 0;
  for (let index = basic > 0 ? basic + 1 : 0; index < input.length;) {
    const oldi = i;
    for (let w = 1, k = BASE; ; k += BASE) {
      if (index >= input.length) throw new TransformError('invalidPunycode');
      const digit = charToDigit(input.charCodeAt(index++));
      if (digit >= BASE || digit > Math.floor((MAX_INT - i) / w)) {
        throw new TransformError('invalidPunycode');
      }
      i += digit * w;
      const t = k <= bias ? T_MIN : k >= bias + T_MAX ? T_MAX : k - bias;
      if (digit < t) break;
      w *= BASE - t;
    }
    const length = output.length + 1;
    bias = adapt(i - oldi, length, oldi === 0);
    n += Math.floor(i / length);
    i %= length;
    if (n > 0x10ffff) throw new TransformError('invalidPunycode');
    output.splice(i++, 0, n);
  }
  return String.fromCodePoint(...output);
}

/** Converts every label of a domain; ASCII-only labels are left alone. */
function mapDomain(domain: string, fn: (label: string) => string): string {
  return domain
    .split(/([.。．｡])/)
    .map((part, i) => (i % 2 ? '.' : fn(part)))
    .join('');
}

export const punycode = defineTransform({
  kind: 'transform',
  id: 'punycode',
  category: 'encodings',
  keywords: ['punycode', 'idn', 'idna', 'xn--', 'domain', 'homograph', 'rfc3492'],
  sample: { encode: 'münchen.de ☕.com مثال.ایران' },
  options: [opt.select('mode', ['domain', 'raw'], 'domain', { control: 'segmented' })],
  encode: (input, o) =>
    o.mode === 'raw'
      ? punycodeEncode(input)
      : input
          .split(/(\s+)/)
          .map((token) =>
            /^\s+$/.test(token)
              ? token
              : mapDomain(token, (label) =>
                  /[^\p{ASCII}]/u.test(label)
                    ? 'xn--' + punycodeEncode(label.toLowerCase())
                    : label,
                ),
          )
          .join(''),
  decode: (input, o) =>
    o.mode === 'raw'
      ? punycodeDecode(input)
      : input.replace(/xn--[a-z0-9-]+/gi, (label) => punycodeDecode(label.slice(4).toLowerCase())),
  detect: (input) => (/xn--[a-z0-9-]{2,}/i.test(input) ? 0.95 : 0),
});
