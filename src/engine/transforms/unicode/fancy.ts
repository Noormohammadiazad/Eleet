/**
 * "Fancy fonts" — Unicode text styles.
 *
 * None of these are fonts: they are distinct code points, mostly from the
 * Mathematical Alphanumeric Symbols block (U+1D400–U+1D7FF) that Unicode 3.1
 * added for mathematical notation, plus enclosed, full-width, small-capital,
 * superscript and regional-indicator characters. Because they are plain
 * text, they survive in bios, usernames and posts where formatting is not
 * allowed — and they are invisible to naive keyword filters, which is why the
 * reverse ("normalise") direction matters for moderation and search.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';

type Table = Map<string, string>;

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';

function block(
  upper?: number,
  lower?: number,
  digits?: number,
  exceptions: Record<string, number> = {},
): Table {
  const table: Table = new Map();
  if (upper !== undefined)
    [...UPPER].forEach((ch, i) => table.set(ch, String.fromCodePoint(upper + i)));
  if (lower !== undefined)
    [...LOWER].forEach((ch, i) => table.set(ch, String.fromCodePoint(lower + i)));
  if (digits !== undefined)
    [...DIGITS].forEach((ch, i) => table.set(ch, String.fromCodePoint(digits + i)));
  for (const [ch, cp] of Object.entries(exceptions)) table.set(ch, String.fromCodePoint(cp));
  return table;
}

function zip(from: string, to: string): Table {
  const a = [...from];
  const b = [...to];
  const table: Table = new Map();
  a.forEach((ch, i) => {
    if (b[i] && b[i] !== ch) table.set(ch, b[i]!);
  });
  return table;
}

export const FANCY_STYLES = {
  bold: block(0x1d400, 0x1d41a, 0x1d7ce),
  italic: block(0x1d434, 0x1d44e, undefined, { h: 0x210e }),
  boldItalic: block(0x1d468, 0x1d482),
  script: block(0x1d49c, 0x1d4b6, undefined, {
    B: 0x212c,
    E: 0x2130,
    F: 0x2131,
    H: 0x210b,
    I: 0x2110,
    L: 0x2112,
    M: 0x2133,
    R: 0x211b,
    e: 0x212f,
    g: 0x210a,
    o: 0x2134,
  }),
  boldScript: block(0x1d4d0, 0x1d4ea),
  fraktur: block(0x1d504, 0x1d51e, undefined, {
    C: 0x212d,
    H: 0x210c,
    I: 0x2111,
    R: 0x211c,
    Z: 0x2128,
  }),
  boldFraktur: block(0x1d56c, 0x1d586),
  doubleStruck: block(0x1d538, 0x1d552, 0x1d7d8, {
    C: 0x2102,
    H: 0x210d,
    N: 0x2115,
    P: 0x2119,
    Q: 0x211a,
    R: 0x211d,
    Z: 0x2124,
  }),
  sans: block(0x1d5a0, 0x1d5ba, 0x1d7e2),
  sansBold: block(0x1d5d4, 0x1d5ee, 0x1d7ec),
  sansItalic: block(0x1d608, 0x1d622),
  sansBoldItalic: block(0x1d63c, 0x1d656),
  monospace: block(0x1d670, 0x1d68a, 0x1d7f6),
  fullwidth: (() => {
    const table: Table = new Map([[' ', '\u3000']]);
    for (let c = 0x21; c <= 0x7e; c++)
      table.set(String.fromCharCode(c), String.fromCharCode(c + 0xfee0));
    return table;
  })(),
  smallCaps: zip(LOWER + UPPER, 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘꞯʀꜱᴛᴜᴠᴡxʏᴢ' + 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘꞯʀꜱᴛᴜᴠᴡxʏᴢ'),
  circled: block(0x24b6, 0x24d0, undefined, {
    '0': 0x24ea,
    '1': 0x2460,
    '2': 0x2461,
    '3': 0x2462,
    '4': 0x2463,
    '5': 0x2464,
    '6': 0x2465,
    '7': 0x2466,
    '8': 0x2467,
    '9': 0x2468,
  }),
  negativeCircled: (() => {
    const table = block(0x1f150, 0x1f150, undefined, { '0': 0x24ff });
    [...'123456789'].forEach((d, i) => table.set(d, String.fromCodePoint(0x2776 + i)));
    return table;
  })(),
  squared: block(0x1f130, 0x1f130),
  negativeSquared: block(0x1f170, 0x1f170),
  parenthesized: (() => {
    const table = block(undefined, 0x249c);
    [...UPPER].forEach((ch, i) => table.set(ch, String.fromCodePoint(0x249c + i)));
    [...'123456789'].forEach((d, i) => table.set(d, String.fromCodePoint(0x2474 + i)));
    return table;
  })(),
  superscript: zip(
    LOWER + UPPER + DIGITS + '+-=()',
    'ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖ𐞥ʳˢᵗᵘᵛʷˣʸᶻ' + 'ᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾ𐞥ᴿˢᵀᵁⱽᵂˣʸᶻ' + '⁰¹²³⁴⁵⁶⁷⁸⁹' + '⁺⁻⁼⁽⁾',
  ),
  subscript: zip(
    'aehijklmnoprstuvx' + DIGITS + '+-=()',
    'ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ' + '₀₁₂₃₄₅₆₇₈₉' + '₊₋₌₍₎',
  ),
  regional: block(0x1f1e6, 0x1f1e6),
} satisfies Record<string, Table>;

export type FancyStyle = keyof typeof FANCY_STYLES;
export const FANCY_STYLE_NAMES = Object.keys(FANCY_STYLES) as FancyStyle[];

/** Reverse table covering every style (plus NFKC as a final fallback). */
const REVERSE: Table = (() => {
  const table: Table = new Map();
  for (const style of FANCY_STYLE_NAMES) {
    for (const [plain, fancy] of FANCY_STYLES[style]) {
      if (!table.has(fancy)) {
        // Lower-case is preferred where a style maps both cases to one glyph (small caps, circled).
        table.set(
          fancy,
          style === 'regional' ||
            style === 'squared' ||
            style === 'negativeSquared' ||
            style === 'negativeCircled'
            ? plain.toUpperCase()
            : plain,
        );
      }
    }
  }
  return table;
})();

export function fancyEncode(input: string, style: FancyStyle): string {
  const table = FANCY_STYLES[style];
  let out = '';
  let previousRegional = false;
  for (const ch of input) {
    const mapped = table.get(ch);
    // Two adjacent regional indicators render as a flag (🇮🇷); a ZWSP keeps them as letters.
    if (style === 'regional' && mapped && previousRegional) out += '\u200B';
    previousRegional = style === 'regional' && !!mapped;
    out += mapped ?? ch;
  }
  return out;
}

export function fancyDecode(input: string): string {
  let out = '';
  for (const ch of input.replace(/\u200B/g, '')) {
    const mapped = REVERSE.get(ch);
    out += mapped ?? ch.normalize('NFKC');
  }
  return out;
}

export const fancy = defineTransform({
  kind: 'transform',
  id: 'fancy',
  category: 'typography',
  keywords: [
    'fancy',
    'fonts',
    'bold',
    'italic',
    'script',
    'fraktur',
    'gothic',
    'double struck',
    'monospace',
    'vaporwave',
    'fullwidth',
    'small caps',
    'bubble',
    'circled',
    'instagram',
    'bio',
  ],
  sample: { encode: 'Stay 1337, stay curious' },
  options: [opt.select('style', FANCY_STYLE_NAMES, 'boldScript', { directions: ['encode'] })],
  encode: (input, o) => fancyEncode(input, o.style),
  decode: (input) => fancyDecode(input),
  detect: (input) =>
    /[\u{1D400}-\u{1D7FF}\u{1F130}-\u{1F1FF}\uFF01-\uFF5E\u24B6-\u24FF]/u.test(input) ? 0.9 : 0,
});
