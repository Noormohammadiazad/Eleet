/**
 * Zalgo text — "he comes", rendered as a storm of diacritics.
 * Stacks Unicode combining diacritical marks (U+0300–U+036F) above, through
 * and below each character. Born from the 2004 Something Awful creepypasta,
 * it doubles as a stress test for text renderers. Decoding strips only these
 * marks, so legitimate diacritics — including Persian harakat — survive.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { createRng, pick, randInt } from '../../util/prng';
import { graphemes } from '../../util/text';

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => String.fromCharCode(from + i));

const UP = [
  ...range(0x0300, 0x0314),
  '\u033D',
  '\u033E',
  '\u033F',
  '\u0340',
  '\u0341',
  '\u0342',
  '\u0343',
  '\u0344',
  '\u0346',
  '\u034A',
  '\u034B',
  '\u034C',
  '\u0350',
  '\u0351',
  '\u0352',
  '\u0357',
  '\u035B',
  ...range(0x0363, 0x036f),
];
const MIDDLE = [
  '\u0315',
  '\u031B',
  '\u0334',
  '\u0335',
  '\u0336',
  '\u0337',
  '\u0338',
  '\u035C',
  '\u035D',
  '\u035E',
  '\u035F',
  '\u0360',
  '\u0362',
  '\u0489',
];
const DOWN = [
  ...range(0x0316, 0x0319),
  ...range(0x031c, 0x0333),
  ...range(0x0339, 0x033c),
  '\u0345',
  '\u0347',
  '\u0348',
  '\u0349',
  '\u034D',
  '\u034E',
  '\u0353',
  '\u0354',
  '\u0355',
  '\u0356',
  '\u0359',
  '\u035A',
];

const ZALGO_MARKS = /[\u0300-\u036F\u0489]/g;

export const zalgo = defineTransform({
  kind: 'transform',
  id: 'zalgo',
  category: 'typography',
  keywords: ['zalgo', 'glitch', 'cursed', 'creepy', 'combining', 'he comes'],
  sample: { encode: 'He comes' },
  options: [
    opt.number('intensity', 6, {
      min: 1,
      max: 24,
      step: 1,
      control: 'slider',
      directions: ['encode'],
    }),
    opt.boolean('up', true, { directions: ['encode'] }),
    opt.boolean('middle', true, { directions: ['encode'] }),
    opt.boolean('down', true, { directions: ['encode'] }),
    opt.seed({ directions: ['encode'] }),
  ],
  encode: (input, o) => {
    const rng = createRng(o.seed);
    return graphemes(input)
      .map((g) => {
        if (/^\s+$/.test(g)) return g;
        let out = g;
        const n = () => 1 + randInt(rng, o.intensity);
        if (o.up) for (let i = n(); i > 0; i--) out += pick(rng, UP);
        if (o.middle) for (let i = Math.ceil(n() / 3); i > 0; i--) out += pick(rng, MIDDLE);
        if (o.down) for (let i = n(); i > 0; i--) out += pick(rng, DOWN);
        return out;
      })
      .join('');
  },
  decode: (input) => input.replace(ZALGO_MARKS, ''),
  detect: (input) => {
    const marks = input.match(ZALGO_MARKS)?.length ?? 0;
    return marks > 3 && marks > input.replace(ZALGO_MARKS, '').length ? 0.95 : 0;
  },
});
