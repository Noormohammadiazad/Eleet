/**
 * The tool registry — the single source of truth for which tools exist, in
 * which order they appear, and how ids resolve to implementations.
 *
 * Adding a tool = implementing it under `transforms/` or `analysis/`, adding it
 * here, and adding its strings to both i18n catalogs (a unit test enforces the
 * latter). Nothing else in the app needs to change: navigation, search, option
 * panels, share links, persistence and pipelines are all driven by metadata.
 */
import type { AnyAnalyzer, AnyTool, AnyTransform, CategoryId, WorkspaceDef } from './core/types';
import { CATEGORY_IDS } from './core/types';
import { leet } from './transforms/leet';
import { caesar } from './transforms/ciphers/caesar';
import { rot } from './transforms/ciphers/rot';
import { atbashCipher } from './transforms/ciphers/atbash';
import { affine } from './transforms/ciphers/affine';
import { vigenere } from './transforms/ciphers/vigenere';
import { playfairCipher } from './transforms/ciphers/playfair';
import { railfence } from './transforms/ciphers/railfence';
import { columnar } from './transforms/ciphers/columnar';
import { scytale } from './transforms/ciphers/scytale';
import { bacon } from './transforms/ciphers/bacon';
import { polybius } from './transforms/ciphers/polybius';
import { xor } from './transforms/ciphers/xor';
import { enigma } from './transforms/ciphers/enigma';
import { base64 } from './transforms/encodings/base64';
import { base32 } from './transforms/encodings/base32';
import { base58 } from './transforms/encodings/base58';
import { ascii85 } from './transforms/encodings/ascii85';
import { binary, decimal, hex, octal } from './transforms/encodings/radix';
import { url } from './transforms/encodings/url';
import { html } from './transforms/encodings/html';
import { unicodeEscape } from './transforms/encodings/unicode-escape';
import { punycode } from './transforms/encodings/punycode';
import { morse } from './transforms/codes/morse';
import { nato } from './transforms/codes/nato';
import { braille } from './transforms/codes/braille';
import { tapcode } from './transforms/codes/tapcode';
import { a1z26 } from './transforms/codes/a1z26';
import { t9 } from './transforms/codes/t9';
import { fancy } from './transforms/unicode/fancy';
import { flipText } from './transforms/unicode/flip';
import { mirrorText } from './transforms/unicode/mirror';
import { zalgo } from './transforms/unicode/zalgo';
import { decorations } from './transforms/unicode/decorations';
import { caseStyles } from './transforms/text/case';
import { reverseText } from './transforms/text/reverse';
import { piglatin } from './transforms/text/piglatin';
import { uwu } from './transforms/text/uwu';
import { zeroWidth } from './transforms/stego/zero-width';
import { homoglyph } from './transforms/stego/homoglyph';
import { hash } from './transforms/crypto/hash';
import { hmac } from './transforms/crypto/hmac';
import { aes } from './transforms/crypto/aes';
import { finglish } from './transforms/persian/finglish';
import { abjad } from './transforms/persian/abjad';
import { digits } from './transforms/persian/digits';
import { keyboard } from './transforms/persian/keyboard';
import { inspector } from './analysis/inspector';
import { frequency } from './analysis/frequency';
import { magicAnalyzer } from './analysis/magic';
import { cracker } from './analysis/crack';

export const pipeline: WorkspaceDef = {
  kind: 'workspace',
  id: 'pipeline',
  category: 'workshop',
  options: [],
  keywords: ['pipeline', 'recipe', 'chain', 'combine', 'cyberchef', 'زنجیره'],
};

export const TRANSFORMS: readonly AnyTransform[] = [
  // Substitution — in historical order, from the Hebrew scribes to the BBS scene.
  atbashCipher,
  caesar,
  affine,
  vigenere,
  playfairCipher,
  enigma,
  rot,
  leet,
  // Transposition
  scytale,
  railfence,
  columnar,
  reverseText,
  // Steganography
  bacon,
  homoglyph,
  zeroWidth,
  // Signals & codes
  polybius,
  braille,
  morse,
  tapcode,
  nato,
  a1z26,
  t9,
  // Machine encodings
  base64,
  base32,
  base58,
  ascii85,
  hex,
  binary,
  octal,
  decimal,
  url,
  html,
  unicodeEscape,
  punycode,
  // Modern cryptography
  xor,
  hash,
  hmac,
  aes,
  // Typography & play
  caseStyles,
  fancy,
  flipText,
  mirrorText,
  decorations,
  zalgo,
  piglatin,
  uwu,
  // Persian script
  finglish,
  abjad,
  digits,
  keyboard,
] as unknown as readonly AnyTransform[];

export const ANALYZERS: readonly AnyAnalyzer[] = [
  magicAnalyzer,
  cracker,
  frequency,
  inspector,
] as unknown as readonly AnyAnalyzer[];

export const TOOLS: readonly AnyTool[] = [...TRANSFORMS, ...ANALYZERS, pipeline];

const byId = new Map<string, AnyTool>(TOOLS.map((t) => [t.id, t]));

export function getTool(id: string): AnyTool | undefined {
  return byId.get(id);
}

export function getTransform(id: string): AnyTransform | undefined {
  const tool = byId.get(id);
  return tool?.kind === 'transform' ? tool : undefined;
}

export function getAnalyzer(id: string): AnyAnalyzer | undefined {
  const tool = byId.get(id);
  return tool?.kind === 'analyzer' ? tool : undefined;
}

/** Tools grouped by category, in display order. */
export function toolsByCategory(): { category: CategoryId; tools: AnyTool[] }[] {
  return CATEGORY_IDS.map((category) => ({
    category,
    tools: TOOLS.filter((t) => t.category === category),
  }));
}
