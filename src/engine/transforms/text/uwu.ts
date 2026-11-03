/**
 * UwU-speak — the "OwO what's this?" register of furry and anime internet
 * culture: r/l → w, "na" → "nya", stutters and emoticon faces. Seeded, so the
 * same text always gets the same stutters.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { createRng, pick } from '../../util/prng';

const FACES = [
  '(・`ω´・)',
  'OwO',
  'UwU',
  '>w<',
  '^w^',
  '(˘ω˘)',
  '(◕ᴗ◕✿)',
  'x3',
  ':3',
  'owo',
  'uwu',
  '(⑅˘꒳˘)',
  'ʕ•ᴥ•ʔ',
];

export const uwu = defineTransform({
  kind: 'transform',
  id: 'uwu',
  category: 'typography',
  keywords: ['uwu', 'owo', 'furry', 'anime', 'cute', 'nya'],
  sample: { encode: 'Hello friend, what are you doing? I really love this little program.' },
  options: [
    opt.number('stutter', 20, { min: 0, max: 100, step: 5, control: 'slider', unit: '%' }),
    opt.number('faces', 60, { min: 0, max: 100, step: 5, control: 'slider', unit: '%' }),
    opt.seed(),
  ],
  encode: (input, o) => {
    const rng = createRng(o.seed);
    let text = input
      .replace(/(?:r|l)/g, 'w')
      .replace(/(?:R|L)/g, 'W')
      .replace(/n([aeiou])/g, 'ny$1')
      .replace(/N([aeiou])/g, 'Ny$1')
      .replace(/N([AEIOU])/g, 'NY$1')
      .replace(/ove/g, 'uv')
      .replace(/\bth(?=[aeiou])/g, 'd');
    text = text.replace(/\b([A-Za-z])(?=[A-Za-z]{2,})/g, (ch: string) =>
      rng() < o.stutter / 100 ? `${ch}-${ch.toLowerCase()}` : ch,
    );
    return text.replace(/([.!?]+)(\s|$)/g, (_, punct: string, space: string) =>
      rng() < o.faces / 100 ? `${punct} ${pick(rng, FACES)}${space}` : punct + space,
    );
  },
});
