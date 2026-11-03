# Contributing to Eleet

Thank you for helping make Eleet better. This document explains how to set up the project, what we
expect from a change, and how releases work.

## Ground rules

- **Privacy is a feature.** Never add network requests, analytics, remote fonts or third-party scripts.
  The Content-Security-Policy will block them anyway, and reviews will too.
- **Both languages, always.** Every user-facing string goes into `src/lib/i18n/en.ts` _and_
  `src/lib/i18n/fa.ts`. The compiler and the test-suite enforce parity.
- **Write it so a stranger understands it.** Start new modules with a doc comment explaining the
  what and the why; prefer clear names over clever code.
- **Tests with evidence.** Algorithms should be tested against published vectors (RFCs, standards,
  well-known examples), not only against their own output.

## Setup

```bash
npm ci
npm run dev
```

Node.js ≥ 22.12 is required (see `.nvmrc`).

## Before you open a pull request

Run the same gates as the deployment pipeline:

```bash
npm run verify   # format:check → lint → check → test → build
```

| Gate                | Command                | Fix with             |
| ------------------- | ---------------------- | -------------------- |
| Formatting          | `npm run format:check` | `npm run format`     |
| Lint                | `npm run lint`         | `npx eslint . --fix` |
| Types (TS + Svelte) | `npm run check`        | —                    |
| Tests               | `npm test`             | —                    |
| Build               | `npm run build`        | —                    |

## Adding a tool

Read [docs/ENGINE.md](docs/ENGINE.md). In short:

1. Implement a `TransformDef` (or `AnalyzerDef`) under `src/engine/transforms/<category>/` or
   `src/engine/analysis/`, with a doc comment and a `sample`.
2. Register it in `src/engine/registry.ts`.
3. Add its strings to both catalogs and draw its glyph in `src/lib/ui/glyphs.ts`.
4. Add tests with published vectors. The registry suite adds round-trip, determinism and robustness
   checks automatically.

## Adding a dossier

1. Write `src/lib/content/dossiers/<tool>.ts` exporting a `Dossier` (`src/lib/content/types.ts`) with
   both languages for every field. Use `*emphasis*` for italics — there is no other markup.
2. Register its loader in `src/lib/content/dossiers.ts`.
3. Only use sources you can verify, and mark any reconstructed text as `illustrative`.
4. Archival images must be public domain or CC0. Put each original in its own folder
   (`<dir>/<id>/original.jpg`), run `npm install --no-save sharp && node tooling/build-archive.ts <dir>`,
   and record the title, holder, licence and source page in `src/lib/content/archive.ts`.
5. `tests/content.test.ts` checks completeness, image files and that every dispatch runs cleanly.

## Changing the UI

- Use the design tokens in `src/styles/tokens.css`; never hard-code colours in components.
- Use logical CSS properties (`inline`/`block`) so RTL keeps working.
- Check your change in **both themes and both languages**, and at phone width.
- Keep everything keyboard-operable with visible focus.
- See [docs/DESIGN.md](docs/DESIGN.md).

## Regenerating the language model

`src/engine/analysis/data/english-model.ts` is generated. To change it, edit
`tooling/build-language-model.ts` and run (network access required):

```bash
node tooling/build-language-model.ts
```

## Commit messages

Use the imperative mood and explain _why_ in the body when it is not obvious:

```text
Add Scytale transposition cipher

Completes the set of classical transposition ciphers; shares the grapheme-aware
column logic with the columnar tool.
```

## Releases

The `main` branch is deployed to GitHub Pages automatically after all gates pass. Notable changes are
recorded in [CHANGELOG.md](CHANGELOG.md).
