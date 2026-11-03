/**
 * Combining decorations — strike-through, underline, overline, slashes and
 * enclosing shapes produced purely with combining characters, so the styling
 * survives copy-paste into plain-text fields.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { graphemes } from '../../util/text';

export const DECORATIONS = {
  strike: '\u0336',
  slash: '\u0338',
  underline: '\u0332',
  doubleUnderline: '\u0333',
  overline: '\u0305',
  tilde: '\u0334',
  crossAbove: '\u033D',
  dotsBelow: '\u0324',
  circle: '\u20DD',
  square: '\u20DE',
  keycap: '\uFE0F\u20E3',
} as const;
export type Decoration = keyof typeof DECORATIONS;

const ALL = new RegExp(
  `[${Object.values(DECORATIONS)
    .join('')
    .replace(/\uFE0F/g, '')}]\\ufe0f?|\\ufe0f\\u20e3`,
  'g',
);

export const decorations = defineTransform({
  kind: 'transform',
  id: 'decorations',
  category: 'typography',
  keywords: ['strikethrough', 'underline', 'overline', 'combining', 'keycap', 'strike'],
  sample: { encode: 'Not a bug, a feature' },
  options: [
    opt.select('style', Object.keys(DECORATIONS) as Decoration[], 'strike', {
      directions: ['encode'],
    }),
    opt.boolean('spaces', true, { directions: ['encode'] }),
  ],
  encode: (input, o) => {
    const mark = DECORATIONS[o.style];
    return graphemes(input)
      .map((g) => (/^\s+$/.test(g) && (!o.spaces || g.includes('\n')) ? g : g + mark))
      .join('');
  },
  decode: (input) => input.replace(ALL, ''),
});
