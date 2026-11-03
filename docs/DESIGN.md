# Design system — "Archive"

Eleet is set like a reading room. By day it is folio paper, iron-gall ink and Prussian blue; after
hours, the same archive by lamplight. Vermilion — the red that scribes used for headings and
numerals, the _rubric_ — marks the catalogue. The data, the text you transform, is always the loudest
thing on screen; the history around it is typeset, not decorated.

- [Principles](#principles)
- [Colour](#colour)
- [Typography](#typography)
- [Glyphs and the mark](#glyphs-and-the-mark)
- [Layout, rhythm & bidirectionality](#layout-rhythm--bidirectionality)
- [Page anatomy](#page-anatomy)
- [Components](#components)
- [Motion & micro-interactions](#motion--micro-interactions)
- [Imagery](#imagery)
- [Data visualisation](#data-visualisation)
- [Accessibility checklist](#accessibility-checklist)

## Principles

1. **A catalogue, not a dashboard.** No card grids of icons with "Features" headings, no gradients,
   glows or frosted glass. Structure comes from type, hairline rules and numbering — the conventions
   of printed catalogues and specimen books.
2. **Depict the mechanism.** Every instrument's glyph draws what it does (two alphabet rings for
   Caesar, a rod wound with a strip for the scytale), never a stock metaphor.
3. **Content first.** Editors are large, monospaced and calm; chrome is quiet and consistent.
4. **Honest controls.** Every option is a real, labelled form control generated from the tool's
   schema — no hidden gestures.
5. **Both directions are native.** Nothing is designed LTR and "flipped later".

## Colour

Tokens live in `src/styles/tokens.css` as OKLCH values, so lightness steps are perceptually even and
both themes share one hue system: warm paper and ink at hues 60–85, Prussian blue at 245–252,
vermilion at 35–42.

| Token                                                                           | Role                                                                |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `--bg`, `--surface-1/2/3`                                                       | Paper, the editor sheet, wells and pressed states                   |
| `--border`, `--border-strong`                                                   | Decorative hairlines; form-control outlines (≥ 3:1)                 |
| `--text`, `--text-2`, `--text-3`                                                | Ink, secondary and muted text (all ≥ 4.5:1 on every surface)        |
| `--accent`, `--accent-strong`, `--accent-ink`, `--accent-soft`, `--accent-line` | Prussian blue: links, focus, the active item, primary actions       |
| `--rubric`, `--rubric-soft`                                                     | Vermilion: catalogue numerals, eras, ornaments. **Never a status.** |
| `--accent-2`, `--accent-2-soft`                                                 | Verdigris, for informational marks                                  |
| `--danger`, `--warning` (+ `-soft`)                                             | Status colours, always paired with an icon and text                 |
| `--chart-1`, `--chart-ref`, `--chart-grid`                                      | Data-visualisation colours, validated separately (see below)        |

Contrast was computed for every text role on every surface in both themes: the weakest pair,
`--text-3` on `--surface-3` in light mode, is 4.8:1.

Implementation notes:

- `color-mix()` is used **in sRGB**: mixing two OKLCH colours of the same hue can yield a
  "powerless" hue in some engines, which renders as a muddy brown.
- The theme is applied with `data-theme` on `<html>`; "system" follows `prefers-color-scheme` live.

## Typography

| Face                              | Use                                        | Why                                                                                                          |
| --------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| **Newsreader** (variable, `opsz`) | Display, headings, dossier prose, numerals | A text face with an optical-size axis: delicate at 76 px, sturdy at 17 px. Real italics for the standfirsts. |
| **Noto Naskh Arabic** (variable)  | Persian display and prose                  | Naskh is the book hand of Persian; it pairs with Newsreader's proportions where Vazirmatn would read as UI.  |
| **Inter** (variable)              | Latin interface text                       | The reference interface sans; `cv11`/`ss01` for a cleaner "a" and open digits.                               |
| **Vazirmatn** (variable)          | Persian interface text                     | The de facto standard open Persian UI typeface.                                                              |
| **JetBrains Mono** (variable)     | Editors, specimens, leet glyphs            | Clear `0/O`, `1/l/I`, `\|`; tall x-height.                                                                   |

The scale is modular (≈ 1.2) for the interface — 12, 13, 15, 18, 22 px — and wider for display:
`--text-2xl` (30–42 px) for tool titles and section heads, `--text-3xl` (40–76 px) for the overview's
headline, and `--text-prose` (17 px at a 1.65 leading, 2.0 in Persian) for essays, held to a
66-character measure.

Rules:

- Font stacks are swapped by language (`:root:lang(fa)`); Vazirmatn also backs the monospace stack so
  Persian in editors never falls back to a system font.
- **Coding ligatures are disabled** (`font-feature-settings: 'calt' 0`) wherever monospace text is
  shown — otherwise `|-|` and `|_|` would fuse into single symbols and corrupt leet output.
- Numerals in the catalogue use Newsreader's old-style figures in italic vermilion (`.rubric`).
- "Caps" labels use letter-spacing and uppercase in English only; Persian has no case, so the style
  degrades to a slightly larger, unspaced label. Dossier essays open with a vermilion drop initial in
  English; Persian, a joined script, does not take one.
- Unicode-art output uses a wide fallback stack (`--font-symbols`).

## Glyphs and the mark

`src/lib/ui/glyphs.ts` holds one glyph per instrument, drawn on a 24-unit grid with 1.5-unit strokes,
round caps and joins, and rendered by `Glyph.svelte` in `currentColor`. They are data, not markup, and
a test fails if any tool lacks one. Interface chrome (search, menu, copy, chevrons) keeps Lucide icons.

The **mark** is a capital E whose middle arm is replaced by a dot — "·" is E in Morse code, the
shortest signal, given to E because it is the most frequent letter in English. On hover the wordmark
substitutes itself letter by letter with the default leet preset (E→3, e→3, t→7) while the l stays
put, which is the engine's determinism rule made visible.

## Layout, rhythm & bidirectionality

- Spacing follows a 4 px base (`--space-1` … `--space-9`, 4 → 112 px); sections on the overview are
  separated by 72 px, dossier sections by 48 px, controls by 8–16 px.
- Everything is written with **logical properties** (`margin-inline-start`, `inset-inline-end`,
  `border-block-end`…), so the layout mirrors automatically when `dir="rtl"`.
- Direction-sensitive icons carry `.flip-rtl`; glyphs, which depict mechanisms, do not flip.
- Text areas use `dir="auto"`, so a Persian UI can edit English text and vice versa. Inherently
  left-to-right artefacts — the Enigma machine, cipher squares, the scytale, charts, code points — opt
  into `dir="ltr"` locally.
- Breakpoints: the sidebar becomes an off-canvas drawer below 960 px; editors stack below 860 px;
  dossier figures move under the essay below 1100 px; the header condenses below 640 px.

## Page anatomy

- **Overview (`#/`).** Masthead (eyebrow, display headline, standfirst, two actions) → the
  **specimen sheet** (one editable line set by fourteen instruments, each row numbered, dated and
  linked) → **the catalogue** (ten drawers, each headed by a roman numeral, a heavy rule and a note)
  → **plates from the archive** → **house rules** → colophon.
- **Tool page.** A catalogue entry — `II.1 · Transposition · c. 400 BCE` — over the instrument's name
  in display type with its glyph in vermilion, then the workbench, then (where one exists) the
  **dossier**: a `§` rule, eyebrow, headline, italic standfirst, the essay beside its figures, dated
  dispatches and further reading.

## Components

Global primitives live in `src/styles/components.css` inside `@layer components` (component-scoped
Svelte styles are unlayered and therefore always win):

- **Buttons** — `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-icon`, `.btn-sm`.
- **Fields** — `.field`, `.field-label`, `.field-value`, `.input`, `.select`.
- **Segmented control** — `.segmented` with `role="radiogroup"` / `role="radio"` children, plus the
  `slidingIndicator` attachment.
- **Chips** — `.chip`, `.chip-accent`, `.chip-danger`, `.chip-warning`, `.chip-info`.
- **Panels** — `.panel`, `.panel-header`, `.panel-title`, `.panel-body`; stat rows `.stat-grid`.
- **Typographic utilities** — `.serif`, `.rubric`, `.eyebrow`, `.fleuron`, `.caps`.

## Motion & micro-interactions

- Durations: 120 ms (`--fast`) for state changes, 220 ms (`--normal`) for enters, 420 ms (`--slow`) for
  springs; `--ease-out` for things that arrive, `--ease-spring` for things that are pressed.
- **Press**: buttons scale to 96 % in 60 ms and spring back.
- **Segmented controls** have a single indicator that slides to the chosen option instead of each
  option repainting.
- **Copy** answers in place: the icon turns into a check with a small spring and the label reads
  "Copied" for 1.6 s.
- **The wordmark** rolls each substitutable letter up into its leet glyph, staggered by 45 ms.
- Archive images fade in over their blurred placeholders; catalogue glyphs warm to vermilion on hover.
- View enters animate **opacity only** — a translate would momentarily grow the document and nudge the
  scroll position. Everything respects `prefers-reduced-motion: reduce`.

## Imagery

Archival images are public-domain or CC0 scans, processed by `tooling/build-archive.ts` into AVIF and
WebP at standard widths (480/960/1440, never upscaled) with a ~300-byte blurred placeholder. They carry
intrinsic width and height (no layout shift), load lazily, are excluded from the service-worker
precache, and open into a native `<dialog>` at full size. Every figure is captioned with its title,
holder, licence and a link to its source. Where no suitable artifact exists, Eleet draws an original
diagram in the same tokens (the Caesar rings, the cipher squares, Vail's frequency table, the leet
preset, the scytale).

## Data visualisation

Charts follow a small, strict method:

- **Form first**: letter frequency is a column chart (magnitude by category); the English expectation
  is drawn as a neutral reference tick rather than a second coloured series, so a single hue carries
  the data.
- **Validated colour**: `--chart-1` (Prussian blue) was checked for contrast against each theme's
  surfaces (≥ 4.8:1 in light mode, ≥ 6:1 in dark).
- **Marks**: columns ≤ 24 px with a 4 px rounded data end and a square baseline; 1 px solid recessive
  gridlines; 2 px reference ticks.
- **Identity is never colour-alone**: a legend accompanies two encodings; every column has a hover
  tooltip, and an equivalent data table is available to assistive technology.

## Accessibility checklist

- [x] Landmarks (`header`, `nav`, `main`), skip link, logical heading order on every page.
- [x] Visible focus on every interactive element (`:focus-visible` ring in the accent colour).
- [x] Full keyboard operation, including radio-group arrow keys that respect RTL.
- [x] Native `<dialog>` for modal surfaces (focus trap, `Esc`, inert background).
- [x] Live regions for results, errors, copy confirmations and toasts; `aria-busy` while working.
- [x] Text contrast ≥ 4.5:1 and form-control outlines ≥ 3:1 in both themes; status always pairs
      colour with icon and text; vermilion is never used to signal state.
- [x] Every archival image has a descriptive `alt` and a full caption.
- [x] `lang` and `dir` on `<html>` follow the selected language.
- [x] Reduced motion honoured; no information conveyed by animation alone.
