# Architecture

This document explains how Eleet is put together and, more importantly, _why_. It is written for
engineers who want to change the system with confidence.

- [Goals and constraints](#goals-and-constraints)
- [Layered design](#layered-design)
- [The engine](#the-engine)
- [Execution: the worker and its protocol](#execution-the-worker-and-its-protocol)
- [Application state](#application-state)
- [Routing, share links and persistence](#routing-share-links-and-persistence)
- [The UI layer](#the-ui-layer)
- [Internationalisation](#internationalisation)
- [Theming](#theming)
- [Build pipeline](#build-pipeline)
- [Offline support](#offline-support)
- [Security hardening](#security-hardening)
- [Performance budget](#performance-budget)
- [Testing strategy](#testing-strategy)
- [Decision log](#decision-log)

## Goals and constraints

| Goal                                                                       | Consequence                                                                                |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Zero server.** Hosted as static files on GitHub Pages.                   | No backend, no API, no database; all logic in the browser; share state in the URL.         |
| **Trustworthy with secrets.** People paste passwords and private messages. | No third-party requests (enforced by CSP), secrets never persisted, input never persisted. |
| **Responsive under load.** Megabytes of input, deep searches.              | Heavy work runs in a Web Worker and is cancellable.                                        |
| **Many tools, one experience.** 54 tools today, more tomorrow.             | Tools are _data_ (a declarative schema) plus pure functions; the UI is generated.          |
| **Bilingual, bidirectional.** English LTR and Persian RTL.                 | Logical CSS properties everywhere; typed message catalogs with parity checks.              |
| **Maintainable by strangers.** Open-source project.                        | Strict typing, documented modules, tests with published vectors.                           |

## Layered design

```text
┌──────────────────────────────────────────────────────────────┐
│ components/   Svelte 5 views (generated forms, bespoke panels)│
├──────────────────────────────────────────────────────────────┤
│ lib/state     Reactive state classes ($state / $derived)      │
│ lib/i18n      Catalogs + reactive translation runtime         │
│ lib/platform  Worker RPC · storage · clipboard · share · PWA  │
├──────────────────────────────────────────────────────────────┤
│ engine/       Framework-agnostic TypeScript (no DOM, no UI)   │
└──────────────────────────────────────────────────────────────┘
```

Dependencies point strictly downwards. The engine imports nothing from `lib` or `components`, which
is what allows it to run unchanged in the worker, on the main thread and in Node-based tests.

## The engine

### Tools are declarations

Every tool is a `TransformDef`, `AnalyzerDef` or `WorkspaceDef` (`src/engine/core/types.ts`):

```ts
export const caesar = defineTransform({
  kind: 'transform',
  id: 'caesar',
  category: 'substitution',
  options: [opt.number('shift', 3, { min: 1, max: 25, control: 'slider' })],
  encode: (input, o) => shiftLetters(input, o.shift), // o: { shift: number }
  decode: (input, o) => shiftLetters(input, -o.shift),
});
```

The `opt.*` builders preserve literal types and `InferOptions` maps the schema to a precisely typed
options object, so an implementation can never read an option that does not exist or treat a select
as a number. The same schema drives:

- the generated option form (switches, sliders, steppers, segmented controls, dropdowns, text and
  secret fields, conditional visibility via `when`, per-direction visibility via `directions`);
- `sanitizeOptions` — validation and clamping of untrusted values from storage or a URL;
- `diffFromDefaults` — minimal persistence and short share links;
- secret handling — `secret: true` fields are dropped from storage and links _by construction_.

### Errors are codes, not prose

Tools throw `TransformError(code, params)`. Codes are a closed union (`ERROR_CODES`), serialisable
across the worker boundary, and translated by the UI (`errors.<code>` in each catalog). Any other
exception is normalised by `toSerializedError`.

### Determinism

Every "random" effect (leet glyph variety, Zalgo, UwU stutters, homoglyph density, random case) uses
a seeded PRNG (`util/prng.ts`, SplitMix32 → Mulberry32). The same input and options always produce
the same output, which makes results testable, reproducible and shareable. Only cryptographic
material (AES salts and nonces) uses `crypto.getRandomValues`.

### Unicode correctness

User-visible operations (reverse, rail fence, columnar, flip, mirror) work on **grapheme clusters**
via `Intl.Segmenter`, so emoji ZWJ sequences, flags and combining marks are never torn apart.
Binary encodings operate on **UTF-8 bytes**, so any script round-trips.

### The language model

Cryptanalysis needs statistics about English. `tooling/build-language-model.ts` derives them from
~7.7 million letters of public-domain novels and writes `src/engine/analysis/data/english-model.ts`
(letter frequencies, a full 26×26 conditional bigram table, word-boundary distributions, the top
3 000 quadgrams and a frequency-ranked vocabulary). At ~75 kB it is loaded with a **dynamic import**,
so it is split into its own chunk and only fetched when a tool needs it. See
[ALGORITHMS.md](ALGORITHMS.md) for how it is used.

### Registry

`src/engine/registry.ts` is the single list of tools, in display order. Navigation, search, the
command palette, the pipeline "add step" menu and the i18n completeness test all iterate it.

## Execution: the worker and its protocol

```text
UI thread                                   Worker
─────────                                   ──────
ToolSession.schedule()   (debounce 0–220 ms)
  └─ engine.transform(...) ── {id, type, tool, direction, input, options} ──▶ execute()
                                                                              ├─ sanitizeOptions
                                                                              ├─ runTransform / analyze / runPipeline
  ◀──────────────── {id, ok, result | error, ms} ───────────────────────────── └─ (AbortSignal)
  newer request? ── {type: 'cancel', target: id} ────────────────────────────▶ controller.abort()
```

- **`src/engine/protocol.ts`** defines the messages and a shared `execute()` used by both the worker
  and the main-thread fallback.
- **`src/lib/platform/engine.ts`** is the client: it numbers requests, resolves the matching promise,
  and on `cancel()` settles the promise immediately (`{ cancelled: true }`) while telling the worker
  to abort. If module workers are unavailable it transparently executes on the main thread.
- Long loops call `throwIfAborted(signal)`, so superseded work (e.g. a Magic search while the user
  keeps typing) stops promptly.

Only expensive tools are debounced (AES, Magic, cracker, frequency, inspector, T9, Pig Latin, hashes,
leet decoding, and any input over 40 000 characters); everything else responds on the next tick.

## Application state

State lives in small classes in `src/lib/state/*.svelte.ts` that use Svelte 5 runes directly:

| Module               | Responsibility                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `prefs.svelte.ts`    | Theme preference (system/light/dark), resolved theme, language; persisted.                                                                |
| `router.svelte.ts`   | Current tool and pending share payload from `location.hash`.                                                                              |
| `session.svelte.ts`  | One `ToolSession` per tool: input, direction, options, output/report, error, busy, timing; scheduling, persistence, share links, samples. |
| `pipeline.svelte.ts` | Recipe steps, intermediate results, examples, persistence, share links.                                                                   |
| `toasts.svelte.ts`   | Notifications with optional actions.                                                                                                      |

Sessions are cached per tool for the lifetime of the page, so switching tools and coming back keeps
the work in progress. Components react to state by reading it; effects in the workbench call
`session.schedule()` whenever the input, direction or (deeply) the options change.

## Routing, share links and persistence

- **Routes** are hash-based: `#/` is the overview, `#/leet` and `#/enigma` are tools. Hash routing
  needs no server rewrites, which is exactly what a static host offers. An unknown page falls back to
  the overview with a notice.
- **Share links** append `?s=<payload>` inside the fragment. The payload is JSON of
  `{ v, d, o, i }` (version, direction, non-default options, input), compressed with
  `CompressionStream('deflate-raw')` and Base64url-encoded, prefixed `z` (or `j` for uncompressed
  JSON on browsers without compression streams). Links above ~6 000 characters drop the input and
  warn the user. Payloads are validated with `sanitizeOptions`, so a crafted link cannot inject
  unknown or out-of-range values. After applying, the payload is removed from the address bar with
  `history.replaceState`.
- **Persistence** (`localStorage`, prefixed `eleet:`): preferences, per-tool non-default options and
  last direction, and the pipeline recipe. Never the input text, never secrets. Every access is
  wrapped, so disabled storage degrades gracefully.

## The UI layer

- **`App.svelte`** owns document-level effects: `<html lang dir data-theme>`, the theme-color meta,
  the title, and global shortcuts. The active tool is mounted inside `{#key}` so each tool view starts
  fresh while its session persists.
- **`Home.svelte`** is the overview at `#/`. Its specimen sheet sends one line to fourteen transforms
  through the same engine worker, cancelling stale jobs as you type; following a row hands the line to
  that tool's session before navigating.
- **`ToolView.svelte`** picks `Workbench` (transforms), `AnalyzerView` (analyzers) or `PipelineView`,
  then mounts the tool's **dossier** when it has one. Dossiers are typed data modules
  (`src/lib/content/dossiers/*.ts`) loaded with a dynamic `import()`, so each is its own small chunk;
  a dispatch's "Load into the workbench" writes direction, options and input into the session.
- **Generated forms**: `OptionsPanel` + `OptionControl` render any schema. Segmented controls are ARIA
  radio groups with direction-aware arrow keys; switches use `role="switch"`.
- **Extensions** (`components/views/extensions.ts`) let a tool add bespoke UI without touching the
  generic code: Leet Studio (glyph matrix), Enigma (machine), Scytale (rod and strip), Caesar
  (brute-force table), Morse (transmitter), Fancy (gallery), Hash (all digests) and the four analyzer
  reports.
- **Command palette**: a combobox inside a native modal `<dialog>` (free focus trap and inert
  background), searching tool names in _both_ languages, ids, keywords and summaries.

## Internationalisation

- `src/lib/i18n/en.ts` is the reference catalog; its shape defines the `Messages` type.
  `fa.ts` is typed as `Messages`, so a missing or extra key is a **compile error**.
- The runtime (`index.svelte.ts`) keeps the locale in `$state`; calling `t()` inside a template makes
  that expression reactive to language changes. `tr()` accepts dynamic keys (`tools.${id}.name`) and
  falls back to English and then to the key itself.
- Interpolation uses `{name}` placeholders; numbers are formatted with `Intl.NumberFormat` (Persian
  digits in Persian). A template may contain two plural forms, `"{n} line|{n} lines"`, selected with
  `Intl.PluralRules`.
- Tool metadata is resolved through helpers (`i18n/tools.ts`) with a fallback chain:
  `tools.<id>.options.<key>` → `common.options.<key>`; choice labels may also be literal in the
  engine (for proper nouns like "Base64" or "UKW-B").
- `tests/i18n.test.ts` checks key parity, placeholders, empty strings, untranslated prose and that
  every option and choice of every registered tool is translated.
- RTL: all layout uses logical properties; direction-sensitive icons get `.flip-rtl`; editors use
  `dir="auto"`; content that is inherently LTR (the Enigma machine, Latin glyph matrix, charts) opts in
  with `dir="ltr"`.

## Theming

Design tokens are CSS custom properties in OKLCH (`src/styles/tokens.css`). `data-theme` on `<html>`
selects the palette; `prefs.resolvedTheme` resolves "system" through `matchMedia`. An inline script
in `index.html` applies the saved theme and language **before first paint**, and theme switches use
the View Transitions API for a circular reveal (skipped under reduced motion). See
[DESIGN.md](DESIGN.md).

## Build pipeline

`vite.config.ts` wires three plugins:

1. **`@sveltejs/vite-plugin-svelte`** — compiles components in runes mode.
2. **`tooling/csp.ts`** — hashes every inline script in the final HTML and injects a
   `Content-Security-Policy` meta tag (GitHub Pages cannot send headers).
3. **`tooling/service-worker.ts`** — inspects the final bundle, derives a content hash and emits
   `sw.js` with the precache list.

`base: './'` produces relative URLs so the same artefact works on the custom domain and on a
repository sub-path. The worker is emitted as an ES module chunk.

## Offline support

The generated service worker precaches the shell (HTML, JS, CSS, icons and the six font files the two
interfaces render: the Latin subsets of Inter, JetBrains Mono and Newsreader, the Arabic-script subsets
of Vazirmatn and Noto Naskh Arabic). Archival images and rarer font subsets are cached the first time
they are used, so a visitor who never opens a dossier never downloads its pictures.
Navigations are network-first with a cached fallback; other same-origin GETs are cache-first (all
assets are content-hashed). A new deployment installs in the background but only activates when the
user accepts the "new version" toast (`SKIP_WAITING`), so a running tab never mixes chunks from two
builds. Rarer font subsets are cached on first use.

## Security hardening

- CSP: `default-src 'self'`, hashed inline script, `connect-src 'self'`, `object-src 'none'`,
  `base-uri 'self'`, `form-action 'none'`. (`style-src` allows inline styles because Svelte sets
  dynamic style attributes; no user content is ever interpolated into CSS.)
- `<meta name="referrer" content="no-referrer">` — outbound links reveal nothing.
- No `{@html}` anywhere: all user text is rendered as text.
- Share payloads and stored options are schema-validated before use.
- See [SECURITY.md](../SECURITY.md) for the threat model.

## Performance budget

| Asset                                               | Size (gzip)         | Loaded                          |
| --------------------------------------------------- | ------------------- | ------------------------------- |
| Main JS (UI, engine metadata, both catalogs, icons) | ≈ 130 kB            | always                          |
| CSS                                                 | ≈ 13 kB             | always                          |
| Worker + engine                                     | ≈ 40 kB             | on first transform              |
| English language model                              | ≈ 31 kB             | on first analysis / leet decode |
| Fonts                                               | 35–50 kB per subset | per script, via `unicode-range` |

Typical transforms complete in well under a millisecond; leet decoding of a paragraph takes ~10 ms,
and a full cracker run over a 140-character Vigenère ciphertext takes ~120 ms — all off the UI thread.

## Testing strategy

- **Vectors**: RFC 4648, RFC 3492, RFC 1321, FIPS 202, RFC 4231, Cryptopals, Enigma.
- **Differential**: every digest against Node's OpenSSL on random data around block boundaries.
- **Properties**: round-trip and involution checks for every reversible tool on a torture string.
- **Robustness**: every tool, both directions, on hostile input must succeed or throw a coded error.
- **Behavioural**: the cracker must recover known keys; Magic must peel known layer stacks; the
  frequency verdict must classify plaintext, substitution, transposition and polyalphabetic text.
- **i18n**: parity and completeness (see above).

## Decision log

**Svelte 5 over React/Solid.** The app is UI-heavy but state is local and simple; Svelte's compiled
output and runes give fine-grained updates with the smallest runtime, and `.svelte.ts` modules let
state live in plain classes.

**No SvelteKit.** A single-page, hash-routed app deploys to any static host with no adapter and no
404 tricks; there is no server rendering to benefit from.

**Hand-written CSS over a utility framework.** Logical properties, OKLCH tokens and cascade layers do
the heavy lifting; component styles are scoped by the compiler; nothing ships at runtime.

**A worker for everything.** Uniformity beats cleverness: every tool runs the same way, can be
cancelled, and cannot freeze the page, whatever the input size.

**Own MD5/Keccak/CRC-32.** WebCrypto intentionally omits them; small, well-tested implementations
avoid a dependency and are verified against OpenSSL in CI.

**Language model generated, not hand-tuned.** Numbers from a reproducible script over public-domain
texts are auditable and easy to regenerate or extend to other languages.
