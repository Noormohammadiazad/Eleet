/**
 * Positional number encodings — hexadecimal, binary, octal and decimal —
 * generated from one factory. Each can express either the UTF-8 *bytes* of the
 * text (what a hex editor shows) or its Unicode *code points* (what a
 * programmer's `charCodeAt` loop shows).
 */
import { TransformError } from '../../core/errors';
import { opt } from '../../core/options';
import { defineTransform, type AnyTransform } from '../../core/types';
import { utf8Decode, utf8Encode } from '../../util/bytes';

interface RadixSpec {
  readonly id: 'hex' | 'binary' | 'octal' | 'decimal';
  readonly radix: 2 | 8 | 10 | 16;
  readonly prefix: string;
  readonly byteWidth: number;
  readonly defaultUnit: 'bytes' | 'codepoints';
  readonly keywords: readonly string[];
  readonly sample: string;
}

const SEPARATORS = { space: ' ', none: '', comma: ', ', newline: '\n' } as const;

function makeRadix(spec: RadixSpec): AnyTransform {
  const digitPattern = { 2: '[01]', 8: '[0-7]', 10: '[0-9]', 16: '[0-9a-fA-F]' }[spec.radix];
  const tokenPattern = new RegExp(`^${digitPattern}+$`);

  return defineTransform({
    kind: 'transform',
    id: spec.id,
    category: 'encodings',
    keywords: spec.keywords,
    sample: { encode: spec.sample },
    options: [
      opt.select('unit', ['bytes', 'codepoints'], spec.defaultUnit, { control: 'segmented' }),
      opt.select('separator', ['space', 'none', 'comma', 'newline'], 'space', {
        directions: ['encode'],
      }),
      opt.boolean('prefix', false, {
        directions: ['encode'],
        when: () => spec.radix !== 10,
      }),
      ...(spec.radix === 16 ? [opt.boolean('uppercase', false, { directions: ['encode'] })] : []),
    ],
    encode: (input, o) => {
      const values =
        o.unit === 'bytes' ? [...utf8Encode(input)] : [...input].map((ch) => ch.codePointAt(0)!);
      const width = o.unit === 'bytes' ? spec.byteWidth : 0;
      const upper = (o as { uppercase?: boolean }).uppercase === true;
      return values
        .map((v) => {
          let digits = v.toString(spec.radix);
          if (width) digits = digits.padStart(width, '0');
          if (upper) digits = digits.toUpperCase();
          return (o.prefix ? spec.prefix : '') + digits;
        })
        .join(SEPARATORS[o.separator]);
    },
    decode: (input, o) => {
      let clean = input.trim();
      if (spec.prefix) clean = clean.replace(new RegExp(spec.prefix, 'gi'), ' ');
      if (spec.id === 'hex') clean = clean.replace(/\\x/gi, ' ');
      const hasSeparators = /[^0-9a-fA-F]/.test(clean.replace(/^\s+|\s+$/g, ''));
      let tokens: string[];
      if (hasSeparators || o.unit === 'codepoints') {
        tokens = clean.split(/[^0-9a-fA-F]+/).filter(Boolean);
      } else {
        if (clean.length % spec.byteWidth !== 0) {
          throw new TransformError('invalidDigits', { base: spec.radix });
        }
        tokens = clean.match(new RegExp(`.{${spec.byteWidth}}`, 'g')) ?? [];
      }
      const values = tokens.map((t) => {
        if (!tokenPattern.test(t)) {
          throw new TransformError('invalidDigits', { base: spec.radix, token: t });
        }
        return parseInt(t, spec.radix);
      });
      if (o.unit === 'bytes') {
        if (values.some((v) => v > 255))
          throw new TransformError('invalidDigits', { base: spec.radix });
        return utf8Decode(Uint8Array.from(values));
      }
      if (values.some((v) => v > 0x10ffff))
        throw new TransformError('invalidDigits', { base: spec.radix });
      return String.fromCodePoint(...values);
    },
    detect: (input) => {
      const s = input.trim();
      if (spec.radix === 2) return /^[01]{8}(?:[\s,]*[01]{8})*$/.test(s) ? 0.95 : 0;
      if (spec.radix === 16)
        return /^(?:0x)?[0-9a-f]{2}(?:[\s,:]*(?:0x)?[0-9a-f]{2})+$/i.test(s) ? 0.85 : 0;
      if (spec.radix === 8) return /^[0-3][0-7]{2}(?:\s+[0-3][0-7]{2})+$/.test(s) ? 0.5 : 0;
      return /^\d{2,7}(?:[\s,]+\d{2,7})+$/.test(s) ? 0.6 : 0;
    },
  });
}

export const hex = makeRadix({
  id: 'hex',
  radix: 16,
  prefix: '0x',
  byteWidth: 2,
  defaultUnit: 'bytes',
  keywords: ['hex', 'hexadecimal', 'base16', 'bytes', 'هگز'],
  sample: 'Eleet ❤ Unicode',
});

export const binary = makeRadix({
  id: 'binary',
  radix: 2,
  prefix: '0b',
  byteWidth: 8,
  defaultUnit: 'bytes',
  keywords: ['binary', 'bits', 'base2', 'bin', 'دودویی', 'باینری'],
  sample: 'Hi!',
});

export const octal = makeRadix({
  id: 'octal',
  radix: 8,
  prefix: '0o',
  byteWidth: 3,
  defaultUnit: 'bytes',
  keywords: ['octal', 'base8', 'oct'],
  sample: 'Octal',
});

export const decimal = makeRadix({
  id: 'decimal',
  radix: 10,
  prefix: '',
  byteWidth: 3,
  defaultUnit: 'codepoints',
  keywords: ['decimal', 'ascii', 'char code', 'charcode', 'code point', 'ord'],
  sample: 'ASCII',
});
