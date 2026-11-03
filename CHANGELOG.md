# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [1.1.0] — 2026-11-03

### Added

- **An overview page** at `#/`: a masthead, a live specimen sheet that sets one line of text in
  fourteen instruments at once, the catalogue in ten numbered drawers with eras, archive plates and
  the house rules.
- **Historical dossiers** for fourteen instruments (Atbash, Caesar, Vigenère, Playfair, Enigma, Leet,
  Scytale, Bacon, Invisible Ink, Polybius, Braille, Morse, Frequency Analysis, Cipher Cracker), in
  English and Persian, with dated dispatches that load into the workbench and further reading.
- **Archival imagery**: thirteen public-domain artifacts (the Zimmermann Telegram, a Luftwaffe Enigma
  key sheet, al-Kindi's manuscript, the Babington postscript, Trithemius's _Steganographia_…) as
  lazily loaded AVIF/WebP with blurred placeholders and full provenance; original diagrams where no
  artifact exists.
- **Scytale** transform with a live drawing of the rod and the strip.
- Enigma reflector **UKW-A**, so the 1930 manual's worked example decrypts exactly.
- A drawn **glyph set** — one glyph per instrument, depicting its mechanism.
- Copy confirmation in place, a sliding segmented-control indicator, physical press states.

### Changed

- **Brand**: the name is Eleet everywhere and the document title is simply "Eleet". New mark: a
  capital E whose middle arm is its Morse code, a single dot.
- **Taxonomy**: tools are filed by what they do to text — Substitution, Transposition,
  Steganography, Signals & Codes, Machine Encodings, Modern Cryptography, Cryptanalysis, Typography &
  Play, Persian Script, Workshop. Leet speak is a substitution system among its peers.
- **Leet determinism**: every built-in preset is collision-free — no two letters share a glyph and
  no glyph is a plain letter — so _i_ → `1` while _l_ stays `l`. Ambiguous folk glyphs (`1` and `|`
  for l, `ph`, `vv`, `z` for s…) are decode-only.
- Bacon's letter-case mode omits the terminator group when the cover has no room for it, which lets
  Bacon's own 23-letter example carry FUGE.
- **Design language "Archive"**: Newsreader and Noto Naskh Arabic for display and prose, a paper and
  ink palette with Prussian blue and vermilion, hairline rules instead of cards and glows.
- The service worker precaches only the core font subsets and never the archive.

## [1.0.0] — 2026-09-29

### Added

- **Leet Speak studio**: four glyph tiers, presets, density, preferred/random/cycle strategies, scene
  slang, leet morphology, case styling, seeds, an editable A–Z glyph matrix and a probabilistic
  beam-search decoder backed by an English language model.
- **Classical ciphers**: Caesar (with brute-force ranking), ROT5/13/18/47, Atbash (Latin, Hebrew,
  Persian), affine, Vigenère/Beaufort/Autokey/Gronsfeld, Playfair, rail fence, columnar
  transposition, Bacon (symbols and letter-case steganography), Polybius/ADFGX, repeating-key XOR and
  a visual Enigma I/M3 with lampboard.
- **Data encodings**: Base64 (+ URL-safe), Base32 (RFC 4648, hex, Crockford), Base58 (Bitcoin, Flickr,
  Ripple), Ascii85, hexadecimal, binary, octal, character codes, URL, HTML entities, Unicode escapes
  and Punycode.
- **Signals & codes**: International and Persian Morse with an audio/light transmitter and WAV export,
  NATO/ICAO/LAPD spelling alphabets, Braille, tap code, A1Z26, multi-tap and T9 prediction.
- **Unicode art**: 23 fancy-text styles with a gallery, upside-down and mirror text, Zalgo and
  combining decorations.
- **Text games**: case styles, grapheme-aware reversal, Pig Latin and UwU speak.
- **Steganography**: zero-width and Unicode-Tags invisible ink; homoglyph disguise and normalisation.
- **Modern crypto**: MD5, SHA-1/256/384/512, SHA3-256/512, Keccak-256, CRC-32, HMAC and password-based
  AES-256-GCM.
- **Persian tools**: Finglish ⇄ Persian, abjad numerals, digit-system conversion and a keyboard-layout
  fixer.
- **Cryptanalysis**: Magic multi-layer decoder, classical cipher cracker, frequency analysis with
  cipher fingerprinting, Unicode Inspector, and a pipeline builder.
- Bilingual English/Persian interface with full RTL support; light, dark and system themes.
- Command palette, keyboard shortcuts, share links in the URL fragment, per-tool option memory.
- Installable PWA with offline support and a build-time Content-Security-Policy.
