/**
 * Eleet's glyph set: one drawn symbol per instrument.
 *
 * Generic icon fonts reach for metaphors (a lightning bolt for "leet", sparkles
 * for "fancy"). These glyphs instead depict the *mechanism* of each tool, the
 * way a diagram in a cryptography textbook would: the Caesar glyph is two
 * concentric alphabet rings, Bacon is a five-symbol A/B group, AES is its 4×4
 * state with one row shifted, the scytale is a rod wound with a strip.
 *
 * Every glyph is drawn on a 24-unit grid with 1.5-unit strokes, round caps and
 * joins, and rendered by `Glyph.svelte` with `currentColor`. Shapes are plain
 * data (no markup strings), so nothing here can inject HTML.
 */

export type Shape =
  | { readonly d: string; readonly fill?: boolean }
  | { readonly c: readonly [cx: number, cy: number, r: number]; readonly fill?: boolean };

const p = (d: string): Shape => ({ d });
const f = (d: string): Shape => ({ d, fill: true });
const c = (cx: number, cy: number, r: number): Shape => ({ c: [cx, cy, r] });
const dot = (cx: number, cy: number, r = 1.15): Shape => ({ c: [cx, cy, r], fill: true });

/** A grid of filled dots, used by the counting glyphs (hex, octal, decimal, Polybius). */
function dots(cols: number, rows: number, x0: number, y0: number, step: number, r = 1.1): Shape[] {
  const out: Shape[] = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) out.push(dot(x0 + x * step, y0 + y * step, r));
  return out;
}

export const GLYPHS: Readonly<Record<string, readonly Shape[]>> = {
  /* ------------------------------------------------------------ Substitution */
  // The alphabet folded on itself: first pairs with last around a mirror axis.
  atbash: [
    p('M12 3v18'),
    p('M4 17.5C4 10 8 5.5 12 5.5s8 4.5 8 12'),
    p('M8.5 17.5c0-3.5 1.6-6 3.5-6s3.5 2.5 3.5 6'),
    dot(4, 19.5),
    dot(8.5, 19.5),
    dot(15.5, 19.5),
    dot(20, 19.5),
  ],
  // Two concentric alphabet rings, the inner one turned by a fixed shift.
  caesar: [
    c(12, 12, 9),
    c(12, 12, 5),
    p('M12 3v2.5M21 12h-2.5M12 21v-2.5M3 12h2.5'),
    p('M15.6 8.4l1.8-1.8'),
  ],
  // y = (a·x + b) mod 26: a straight line that wraps around the modulus.
  affine: [p('M4 4v16h16'), p('M7 17l4-10M11 17l4-10M15 17l3-7.5')],
  // The tabula recta: every row is the alphabet shifted once more.
  vigenere: [
    p('M4 4h16v16H4z'),
    p('M4 9.33h16M4 14.67h16M9.33 4v16M14.67 4v16'),
    f('M4 4h5.33v5.33H4zM9.33 9.33h5.34v5.34H9.33zM14.67 14.67H20V20h-5.33z'),
  ],
  // A keyed square; a digraph swaps around the corners of its rectangle.
  playfair: [
    p('M4 4h16v16H4z'),
    p('M8 4v16M12 4v16M16 4v16M4 8h16M4 12h16M4 16h16'),
    dot(6, 6, 1.6),
    dot(14, 14, 1.6),
    p('M6 6h8v8'),
  ],
  // Three rotors side by side on their spindle, with the stepping notch.
  enigma: [
    p('M2.5 12h19'),
    p('M5 5.5h3.5v13H5zM10.25 5.5h3.5v13h-3.5zM15.5 5.5H19v13h-3.5z'),
    p('M5 9h3.5M10.25 15h3.5M15.5 11h3.5'),
  ],
  // Half a turn of the alphabet wheel: 13 of 26, its own inverse.
  rot: [
    c(12, 12, 8.5),
    p('M12 3.5v17'),
    p('M15.5 7.5a6 6 0 0 1 0 9'),
    p('M13.3 16.9l2.2-.4.3 2.2'),
  ],
  // The archetypal leet substitution: E becomes 3.
  leet: [
    p('M4 5h6M4 5v14h6M4 12h5'),
    p('M14 5h3.25a3.25 3.25 0 0 1 0 6.5H15.5h1.75a3.75 3.75 0 0 1 0 7.5H14'),
  ],

  /* ----------------------------------------------------------- Transposition */
  // A rod wound with a strip; the turns run across the message.
  scytale: [
    p('M5 19 19 5'),
    p('M3.6 17.6l2.8 2.8M17.6 3.6l2.8 2.8'),
    p('M6.5 13l4.5 4.5M9.5 10l4.5 4.5M12.5 7l4.5 4.5'),
  ],
  // The zig-zag across three rails.
  railfence: [p('M3 6h18M3 12h18M3 18h18'), p('M4 6l4 12 4-12 4 12 4-12')],
  // Columns of a grid read out in keyword order.
  columnar: [
    p('M4 7h16v13H4z'),
    p('M8 7v13M12 7v13M16 7v13'),
    p('M6 3.5c0-1 1-1.5 2-1.5h8c1 0 2 .5 2 1.5'),
    p('M16.5 4.5 18 3.5 19 5'),
  ],
  // Letters in falling order, read back the other way.
  reverse: [p('M5 16V8M9 16v-6M13 16v-4M17 16v-2'), p('M20 20H4l2.5-2M4 20l2.5 2')],

  /* ----------------------------------------------------------- Steganography */
  // Bacon's biliteral group: five symbols, each in form A or form B.
  bacon: [
    p('M1.5 9.5h2.8v5H1.5zM14.1 9.5h2.8v5h-2.8z'),
    f('M5.7 9.5h2.8v5H5.7zM9.9 9.5h2.8v5H9.9zM18.3 9.5h2.8v5h-2.8z'),
  ],
  // Same outline, different letter: a look-alike from another script.
  homoglyph: [c(7.5, 12, 4.5), c(16.5, 12, 4.5), dot(16.5, 19.5, 1)],
  // A gap with nothing in it — except a character.
  'zero-width': [p('M6 5v14M18 5v14'), p('M10 9h4M10 15h4M12 9v6')],

  /* --------------------------------------------------------- Signals & codes */
  // Coordinates on the five-by-five square (signalled with torches).
  polybius: [...dots(4, 4, 7.5, 7.5, 3.7, 0.95), p('M3 4.5h18M4.5 3v18')],
  // A braille cell: six positions, some raised.
  braille: [
    dot(9, 6, 1.9),
    dot(9, 12, 1.9),
    c(9, 18, 1.6),
    c(15, 6, 1.6),
    dot(15, 12, 1.9),
    c(15, 18, 1.6),
  ],
  // Dot, dash, dot.
  morse: [dot(4.5, 12, 1.7), p('M9 12h6'), dot(19.5, 12, 1.7)],
  // Taps through a prison wall: row, then column.
  tapcode: [p('M12 3v18'), dot(6, 9), dot(6, 13), dot(18, 7), dot(18, 11), dot(18, 15)],
  // A voice spelling over the radio.
  nato: [
    dot(5, 12, 1.6),
    p('M9 8.5a5 5 0 0 1 0 7M12.5 6a8.5 8.5 0 0 1 0 12M16 3.5a12 12 0 0 1 0 17'),
  ],
  // A numbered rule: A = 1 … Z = 26.
  a1z26: [
    p('M3 15h18'),
    p('M4 15v-5M8 15v-3M12 15v-5M16 15v-3M20 15v-5'),
    dot(4, 19, 0.9),
    dot(20, 19, 0.9),
  ],
  // The phone keypad, one key pressed.
  t9: [
    p('M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z'),
    ...dots(3, 3, 9, 9, 3, 0.95),
    dot(12, 12, 1.8),
  ],

  /* -------------------------------------------------------------- Encodings */
  // Three bytes regrouped as four characters.
  base64: [
    p('M3 5h18v5H3zM9 5v5M15 5v5'),
    p('M3 14h18v5H3zM7.5 14v5M12 14v5M16.5 14v5'),
    p('M12 10v4'),
  ],
  // Five bytes regrouped as eight characters.
  base32: [
    p('M3 5h18v5H3zM6.6 5v5M10.2 5v5M13.8 5v5M17.4 5v5'),
    p('M3 14h18v5H3zM5.25 14v5M7.5 14v5M9.75 14v5M12 14v5M14.25 14v5M16.5 14v5M18.75 14v5'),
  ],
  // An alphabet with its ambiguous characters taken out.
  base58: [
    dot(5, 8),
    dot(12, 8),
    dot(19, 8),
    dot(5, 16),
    dot(19, 16),
    p('M10.2 14.2l3.6 3.6M13.8 14.2l-3.6 3.6'),
  ],
  // Ascii85's own delimiters: <~ … ~>.
  ascii85: [p('M8 7l-5 5 5 5M16 7l5 5-5 5'), p('M8.5 12c1-1.3 2.2-1.3 3.5 0s2.5 1.3 3.5 0')],
  // Sixteen symbols.
  hex: dots(4, 4, 6, 6, 4),
  // Two symbols: one and zero.
  binary: [
    p('M7 6l2-1.5V19.5'),
    p('M15.5 4.5h1a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-1a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3z'),
  ],
  // Eight symbols.
  octal: dots(4, 2, 6, 10, 4),
  // Ten symbols, counted on two hands.
  decimal: dots(5, 2, 4, 10, 4),
  // Percent-encoding: a byte written as %XX.
  url: [c(7, 7, 2.5), c(17, 17, 2.5), p('M18.5 4.5l-13 15')],
  // The entity reference that every HTML escape begins with.
  html: [
    p(
      'M17.5 19 8.2 9.6A3.1 3.1 0 1 1 12.9 6c.9 1.6-.3 3-2 4.3L8 12.4c-1.8 1.4-2.6 2.6-2.6 4a3.6 3.6 0 0 0 6.4 2.2L17 13',
    ),
  ],
  // A backslash-u escape.
  'unicode-escape': [p('M4 4l7 16'), p('M14 10v5.5a3 3 0 0 0 6 0V10')],
  // International names, spelled in ASCII.
  punycode: [
    c(12, 12, 9),
    p('M3 12h18'),
    p('M12 3c2.5 2.5 3.6 5.5 3.6 9s-1.1 6.5-3.6 9c-2.5-2.5-3.6-5.5-3.6-9S9.5 5.5 12 3z'),
  ],

  /* --------------------------------------------------- Modern cryptography */
  // Exclusive or.
  xor: [c(12, 12, 8.5), p('M12 3.5v17M3.5 12h17')],
  // Any input, one fixed-size digest.
  hash: [p('M3 4h18l-6.5 8v6l-5 2.5V12z')],
  // A seal: proof of who wrote it.
  hmac: [
    c(12, 10, 6.5),
    c(12, 10, 3.5),
    p('M8.5 15.5 7 21l2.6-1.3L11 22l1-5.5M15.5 15.5 17 21l-2.6-1.3L13 22l-1-5.5'),
  ],
  // The AES state, a 4×4 square of bytes, with one row shifted (ShiftRows).
  aes: [
    p('M4 3h16v18H4z'),
    p('M4 7.5h16M4 12h16M4 16.5h16'),
    p('M8 3v4.5M12 3v4.5M16 3v4.5M8 12v9M12 12v9M16 12v9'),
    p('M6 7.5v4.5M10 7.5v4.5M14 7.5v4.5M18 7.5v4.5'),
  ],

  /* ------------------------------------------------------------ Cryptanalysis */
  // Letter counts falling away from E, T, A, O…
  frequency: [p('M3 20.5h18'), p('M5 20.5V4.5M9 20.5V8.5M13 20.5V11.5M17 20.5V14.5M21 20.5V17')],
  // A key recovered.
  crack: [c(7.5, 12, 4), p('M11.5 12H21M17 12v3.5M20 12v2.5')],
  // Layers of encoding, peeled one by one.
  magic: [p('M4 8 12 3.5 20 8l-8 4.5z'), p('M4 12.5 12 17l8-4.5'), p('M4 16.5 12 21l8-4.5')],
  // A loupe over a hidden character.
  inspector: [c(10, 10, 6.5), p('M14.8 14.8 21 21'), p('M8.5 7.5v5M11.5 7.5v5'), dot(10, 10, 0.9)],

  /* ------------------------------------------------------- Typography & play */
  // Capital and small letter.
  case: [p('M3 19 7.5 5 12 19M4.7 14h5.6'), c(17.5, 15.5, 3.5), p('M21 12v7')],
  // A double-struck capital, as in 𝔸.
  fancy: [p('M4 20 10.5 4h3L20 20'), p('M7 20 12 7.5'), p('M7 14.5h9.8')],
  // A capital turned upside down: ∀.
  flip: [p('M5 4l7 16 7-16'), p('M8 11h8')],
  // b mirrored as d across an axis.
  mirror: [
    p('M12 3v18'),
    p(
      'M4 5v14M4 15.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0M20 5v14M20 15.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 1 1 7 0',
    ),
  ],
  // A line of text struck through and underlined.
  decorations: [p('M6 4h12M12 4v14'), p('M4 11h16'), p('M5 21h14')],
  // A letter buried under stacked combining marks.
  zalgo: [
    p('M12 8v8'),
    p('M9 5.5h6M10.5 3h3M9 18.5h6M10.5 21h3'),
    p('M8 2.5l1.5 1.5M16 2.5 14.5 4'),
  ],
  // The first sound moves to the end, followed by "ay".
  piglatin: [
    p('M3 4h4v5H3zM8.5 4H21v5H8.5z'),
    p('M3 15h12.5v5H3zM17 15h4v5h-4z'),
    p('M5 9.5c0 2.5 4 3 9 3s5 .5 5 2'),
  ],
  // The ω in uωu.
  uwu: [p('M4 7c-1.5 6 0 11 3.5 11S12 13 12 9c0 4 1 9 4.5 9S21.5 13 20 7')],

  /* ----------------------------------------------------------- Persian script */
  // Latin letters standing in for Persian sounds.
  finglish: [
    p('M3.5 20V8.5A3.5 3.5 0 0 1 10 7M2 12.5h7'),
    c(18.5, 12.5, 2.2),
    p('M11 15.5c0 2 1.2 3 3.2 3h4c1.8 0 2.8-1.2 2.8-3.4V12.5'),
    dot(18.5, 7.2),
  ],
  // Alef is one: the letter as a number.
  abjad: [p('M6 4.5v15'), p('M10 10.5h4M10 14h4'), p('M18.5 4.5c-.6 5 .2 10 .5 15')],
  // The same quantity in two digit systems: 2 and ۲.
  digits: [
    p('M3.5 8a3.5 3.5 0 0 1 7 0c0 2.5-3 5-7 11.5h7'),
    p('M14 7c0 4 2.5 4 4 4s3-1.2 3.5-4M14.2 7.5c.6 4 .8 8 1 12'),
  ],
  // A key cap carrying two scripts.
  keyboard: [
    p(
      'M5 3.5h14a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5z',
    ),
    p('M7.5 7.5v5M7.5 7.5h3'),
    p('M16.5 15c-.3 1.7-1.3 2.5-3 2.5'),
    dot(16.5, 11.5, 0.9),
  ],

  /* ---------------------------------------------------------------- Workshop */
  // Instruments chained into a recipe.
  pipeline: [c(5, 12, 2.5), c(12, 12, 2.5), c(19, 12, 2.5), p('M7.5 12h2M14.5 12h2')],
};

/** Fallback for an id without a drawn glyph: an empty catalogue tag. */
export const FALLBACK_GLYPH: readonly Shape[] = [p('M4 5h16v14H4z'), p('M8 10h8M8 14h5')];

export function glyphFor(id: string): readonly Shape[] {
  return GLYPHS[id] ?? FALLBACK_GLYPH;
}
