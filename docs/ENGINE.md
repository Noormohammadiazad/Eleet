# Engine guide — writing a tool

The engine (`src/engine`) is plain TypeScript with no knowledge of Svelte or the DOM. This guide walks
through adding a tool end to end and documents the contracts every tool must honour.

- [Anatomy of a transform](#anatomy-of-a-transform)
- [Option schema reference](#option-schema-reference)
- [Contracts](#contracts)
- [Errors](#errors)
- [Analyzers](#analyzers)
- [Registering and translating](#registering-and-translating)
- [Testing a tool](#testing-a-tool)
- [Adding a bespoke UI panel](#adding-a-bespoke-ui-panel)
- [Utilities you should reuse](#utilities-you-should-reuse)

## Anatomy of a transform

```ts
// src/engine/transforms/ciphers/scytale.ts
/**
 * Scytale — the Spartan transposition cipher: a strip of leather wound around
 * a rod of fixed diameter. Equivalent to a columnar transposition without a key.
 */
import { opt } from '../../core/options';
import { defineTransform } from '../../core/types';
import { graphemes } from '../../util/text';

export const scytale = defineTransform({
  kind: 'transform',
  id: 'scytale', // kebab-case; URL, storage and i18n key
  category: 'transposition', // one of CATEGORY_IDS — filed by what the tool does to text
  keywords: ['scytale', 'sparta', 'transposition'], // search terms (language-neutral)
  sample: { encode: 'Help me I am under attack' }, // "Example" button
  options: [opt.number('turns', 4, { min: 2, max: 20, control: 'slider' })],
  encode: (input, o) => wind(graphemes(input), o.turns), // o is { turns: number }
  decode: (input, o) => unwind(graphemes(input), o.turns),
});
```

`defineTransform` is an identity function whose only job is type inference: `o` above is inferred
from the schema as `{ turns: number }`.

Optional members:

| Member             | Purpose                                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `decode`           | Omit for one-way tools (hashes, case conversion). The UI then hides the direction switch and marks the tool as one-way.                  |
| `involution: true` | Encode and decode are the same operation (ROT13, Atbash, Enigma, reverse). The UI shows a single mode.                                   |
| `detect(input)`    | Returns 0–1: how likely `input` is _encoded_ with this tool. Used by Magic to decide which decoders to try. Keep it a cheap regex check. |
| `sample.decode`    | A handcrafted decode example. If absent, the UI encodes `sample.encode` to produce one.                                                  |

Functions may be `async` (return a `Promise<string>`). They receive a `RunContext` whose
`signal: AbortSignal` fires when the request is superseded.

## Option schema reference

| Builder                                                                   | Value type             | Control                                        | Notes                                                                            |
| ------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------- |
| `opt.boolean(key, default)`                                               | `boolean`              | switch                                         |                                                                                  |
| `opt.number(key, default, { min, max, step?, control?, unit? })`          | `number`               | slider or stepper                              | Values are clamped to `[min, max]` when sanitised.                               |
| `opt.seed(extra?)`                                                        | `number`               | stepper + dice                                 | Key is always `seed`; feeds `createRng`.                                         |
| `opt.select(key, choices, default, { control? })`                         | union of choice values | segmented (≤ 3 choices by default) or dropdown | Choices may be plain strings (translated) or `{ value, label }` (literal label). |
| `opt.text(key, default, { multiline?, monospace?, maxLength?, secret? })` | `string`               | input / textarea / password                    | `secret: true` → masked, never stored, never shared.                             |
| `opt.json(key, default)`                                                  | structured             | none (bespoke UI)                              | Currently used for the leet glyph matrix.                                        |

Every builder accepts:

- `directions: ['encode']` — show the control only in that direction;
- `when: (values) => boolean` — conditional visibility based on other options.

## Contracts

A tool **must**:

1. **Be deterministic.** Same input + options → same output. Use `createRng(o.seed)` for anything
   random-looking. Only real cryptographic material may use `crypto.getRandomValues`.
2. **Be Unicode-correct.** Operate on grapheme clusters (`graphemes()`) for user-visible reordering
   and on UTF-8 bytes (`utf8Encode`) for binary encodings. Never split surrogate pairs.
3. **Be lossless where it claims to be reversible.** If `decode(encode(x)) !== x` for some inputs,
   document why in the file header and add the tool to the `lossy` list in the round-trip test.
4. **Fail with codes.** Throw `TransformError` for anything the user can cause (see below).
5. **Stay responsive.** For loops that may run long, call `throwIfAborted(ctx.signal)` periodically.
6. **Explain itself.** Start the file with a doc comment covering what the algorithm is, where it
   comes from and any non-obvious decision.

## Errors

```ts
import { TransformError } from '../../core/errors';

if (!key) throw new TransformError('keyRequired');
throw new TransformError('invalidBase64', { char: '!', position: 5 });
```

Codes live in `ERROR_CODES` (`core/errors.ts`). Adding a code means adding `errors.<code>` to **both**
catalogs; parameters are interpolated into the message (`{char}`, `{position}`). Unexpected exceptions
are converted to `invalidInput` with a short detail, but prefer explicit codes.

## Analyzers

Analyzers return structured, serialisable reports instead of text:

```ts
export const frequency = defineAnalyzer({
  kind: 'analyzer',
  id: 'frequency',
  category: 'analysis',
  options: [opt.number('maxKeyLength', 16, { min: 4, max: 32 })],
  analyze: async (input, o, ctx) => ({/* FrequencyReport */}),
});
```

Each analyzer needs a report component registered in `REPORTS`
(`src/components/views/extensions.ts`). Reports must be plain data (they cross the worker boundary via
structured cloning).

## Registering and translating

1. Add the tool to `TRANSFORMS` or `ANALYZERS` in `src/engine/registry.ts` (order = display order).
2. Draw its glyph in `src/lib/ui/glyphs.ts` — a 24-unit grid, 1.5-unit strokes, depicting the tool's
   mechanism. A test fails if a tool has none.
3. Add strings to `src/lib/i18n/en.ts` **and** `src/lib/i18n/fa.ts`:

```ts
scytale: {
  name: 'Scytale',
  summary: 'The Spartan leather-strip cipher.',
  description: 'Two or three sentences of history and how it works…',
  options: { turns: 'Turns around the rod' },
  // choices: { optionKey: { value: 'Label' } }   for translated select choices
  // actions: { encode: 'Wind', decode: 'Unwind' } for tool-specific verbs
},
```

Shared labels (`seed`, `key`, `format`, `unit`, `separator`…) can come from `common.options` /
`common.choices` instead. `npm test` fails if anything is missing in either language.

## Testing a tool

Use the helpers in `tests/helpers.ts`:

```ts
import { decode, encode, TORTURE } from '../helpers';

// Prefer published vectors (an RFC, a standard, a well-known textbook example) over
// outputs copied from your own implementation.
it('matches the textbook example', async () => {
  expect(await encode('scytale', PLAINTEXT, { turns: 3 })).toBe(PUBLISHED_CIPHERTEXT);
});

it('round-trips arbitrary text', async () => {
  expect(await decode('scytale', await encode('scytale', TORTURE))).toBe(TORTURE);
});
```

The registry suite automatically adds: sample round-trip, determinism, involution checks, option
sanitisation and a hostile-input robustness sweep for every registered tool.

## Adding a bespoke UI panel

If the generated form is not enough, add a component to `src/components/views/` that receives
`{ session: ToolSession }` and register it in `EXTENSIONS`:

```ts
scytale: { after: ScytaleRod },                        // below the editors
enigma: { options: EnigmaPanel, optionsMode: 'replace' }, // instead of the generated form
leet: { options: LeetStudio, optionsMode: 'append' },     // inside the options card
```

Read and write options through `session.options` / `session.setOption()` so persistence, share links
and pipelines keep working.

## Utilities you should reuse

| Module                           | Highlights                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| `util/text.ts`                   | `graphemes`, `codePoints`, `tokenizeWords`, `mapChars`, `groupBlocks`, `lettersOnly` |
| `util/bytes.ts`                  | `utf8Encode`/`utf8Decode` (strict or lenient), hex helpers, `printableRatio`         |
| `util/prng.ts`                   | `createRng`, `randInt`, `pick`, `chance`                                             |
| `util/math.ts`                   | `mod`, `gcd`, `modInverse`                                                           |
| `analysis/stats.ts`              | `letterCounts`, `chiSquared`, `indexOfCoincidence`, `shannonEntropy`                 |
| `analysis/language.ts`           | `loadEnglishModel`, `quadgramFitness`, `languageScore` (async model)                 |
| `transforms/encodings/base64.ts` | `bytesToBase64` / `base64ToBytes` for binary outputs                                 |
