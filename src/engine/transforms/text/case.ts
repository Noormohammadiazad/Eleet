/**
 * Case styles — from typographic (Title, Sentence) to programming
 * conventions (camelCase, snake_case, kebab-case…) to internet culture
 * ("sPoNgEbOb mOcKiNg" alternating case). Unicode-aware word splitting.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { createRng } from '../../util/prng';

export const CASE_STYLES = [
  'upper',
  'lower',
  'title',
  'sentence',
  'camel',
  'pascal',
  'snake',
  'kebab',
  'constant',
  'dot',
  'train',
  'inverse',
  'alternating',
  'random',
] as const;
export type CaseStyle = (typeof CASE_STYLES)[number];

/** Words that stay lower-case in title case (Chicago Manual of Style). */
const MINOR = new Set(
  'a an the and but or nor for so yet as at by in of off on per to up via vs'.split(' '),
);

/** Splits identifiers and prose into words: "parseHTTPResponse v2" → parse, HTTP, Response, v2. */
export function splitWords(text: string): string[] {
  return (
    text
      .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, '$1 $2')
      .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1 $2')
      .match(/[\p{L}\p{N}\p{M}]+/gu) ?? []
  );
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

export function convertCase(input: string, style: CaseStyle, seed = 1): string {
  switch (style) {
    case 'upper':
      return input.toUpperCase();
    case 'lower':
      return input.toLowerCase();
    case 'title': {
      const lines = input.split('\n');
      return lines
        .map((line) => {
          const words = line.split(/(\s+)/);
          const last = words.length - 1;
          return words
            .map((w, i) => {
              if (/^\s*$/.test(w)) return w;
              const lower = w.toLowerCase();
              return i !== 0 && i !== last && MINOR.has(lower)
                ? lower
                : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
            })
            .join('');
        })
        .join('\n');
    }
    case 'sentence':
      return input
        .toLowerCase()
        .replace(
          /(^\s*|[.!?؟]\s+)(\p{L})/gu,
          (_, pre: string, ch: string) => pre + ch.toUpperCase(),
        );
    case 'camel': {
      const words = splitWords(input);
      return words.map((w, i) => (i === 0 ? w.toLowerCase() : cap(w))).join('');
    }
    case 'pascal':
      return splitWords(input).map(cap).join('');
    case 'snake':
      return splitWords(input)
        .map((w) => w.toLowerCase())
        .join('_');
    case 'kebab':
      return splitWords(input)
        .map((w) => w.toLowerCase())
        .join('-');
    case 'constant':
      return splitWords(input)
        .map((w) => w.toUpperCase())
        .join('_');
    case 'dot':
      return splitWords(input)
        .map((w) => w.toLowerCase())
        .join('.');
    case 'train':
      return splitWords(input).map(cap).join('-');
    case 'inverse':
      return [...input]
        .map((ch) => (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()))
        .join('');
    case 'alternating': {
      let i = 0;
      return [...input]
        .map((ch) => (/\p{L}/u.test(ch) ? (i++ % 2 ? ch.toUpperCase() : ch.toLowerCase()) : ch))
        .join('');
    }
    case 'random': {
      const rng = createRng(seed);
      return [...input].map((ch) => (rng() < 0.5 ? ch.toLowerCase() : ch.toUpperCase())).join('');
    }
  }
}

export const caseStyles = defineTransform({
  kind: 'transform',
  id: 'case',
  category: 'typography',
  keywords: [
    'case',
    'uppercase',
    'lowercase',
    'title case',
    'camelCase',
    'snake_case',
    'kebab-case',
    'spongebob',
    'mocking',
  ],
  sample: { encode: 'the quick brown fox jumps over the lazy dog' },
  options: [
    opt.select('style', CASE_STYLES, 'title'),
    opt.seed({ when: (v) => v.style === 'random' }),
  ],
  encode: (input, o) => convertCase(input, o.style, o.seed),
});
