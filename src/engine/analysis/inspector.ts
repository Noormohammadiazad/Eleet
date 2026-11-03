/**
 * Unicode Inspector — X-rays text for everything the eye cannot see:
 * zero-width and invisible characters, bidirectional overrides (the
 * "Trojan Source" attack, CVE-2021-42574), Unicode tag smuggling, mixed-script
 * homoglyph words, combining-mark abuse and private-use characters.
 */
import { defineAnalyzer } from '../core/types';
import { utf8Encode } from '../util/bytes';
import { graphemes } from '../util/text';
import { SKELETON } from '../transforms/stego/homoglyph';
import { shannonEntropy } from './stats';
import {
  BIDI_CONTROLS,
  INVISIBLES,
  describe,
  generalCategory,
  isPrivateUse,
  isTag,
  isVariationSelector,
  scriptOf,
  type GeneralCategory,
  type ScriptName,
} from './unicode-info';

export type Flag =
  | 'invisible'
  | 'bidi'
  | 'tag'
  | 'confusable'
  | 'combining'
  | 'control'
  | 'privateUse'
  | 'variation'
  | 'whitespace';

export interface CodePointInfo {
  readonly cp: number;
  readonly hex: string;
  readonly category: GeneralCategory;
  readonly script: ScriptName;
  readonly name: string | null;
  readonly utf8: string;
  readonly flags: readonly Flag[];
  /** For confusables: the Latin letter it imitates. */
  readonly lookalike?: string;
}

export interface GraphemeInfo {
  readonly text: string;
  readonly codePoints: readonly CodePointInfo[];
  readonly flags: readonly Flag[];
}

export interface InspectorReport {
  readonly stats: {
    readonly graphemes: number;
    readonly codePoints: number;
    readonly utf16: number;
    readonly utf8: number;
    readonly words: number;
    readonly lines: number;
    readonly unique: number;
    readonly entropy: number;
  };
  readonly scripts: readonly { script: ScriptName; count: number }[];
  readonly findings: Readonly<Record<Flag, number>>;
  readonly mixedScriptWords: readonly string[];
  readonly graphemes: readonly GraphemeInfo[];
  readonly truncated: boolean;
}

const MAX_GRAPHEMES = 1500;

function inspectCodePoint(ch: string): CodePointInfo {
  const cp = ch.codePointAt(0)!;
  const category = generalCategory(ch);
  const flags: Flag[] = [];
  if (BIDI_CONTROLS.has(cp)) flags.push('bidi');
  else if (INVISIBLES.has(cp)) flags.push('invisible');
  if (isTag(cp)) flags.push('tag');
  if (isVariationSelector(cp)) flags.push('variation');
  if (isPrivateUse(cp)) flags.push('privateUse');
  if (category === 'Mn' || category === 'Me') flags.push('combining');
  if (category === 'Cc' && cp !== 0x0a && cp !== 0x09 && cp !== 0x0d) flags.push('control');
  if (category === 'Zs' && cp !== 0x20) flags.push('whitespace');
  const lookalike = SKELETON.get(ch);
  if (lookalike) flags.push('confusable');
  const info: CodePointInfo = {
    cp,
    hex: 'U+' + cp.toString(16).toUpperCase().padStart(4, '0'),
    category,
    script: scriptOf(ch),
    name: describe(cp),
    utf8: [...utf8Encode(ch)].map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' '),
    flags,
  };
  return lookalike ? { ...info, lookalike } : info;
}

export function inspect(input: string): InspectorReport {
  const all = graphemes(input);
  const findings: Record<Flag, number> = {
    invisible: 0,
    bidi: 0,
    tag: 0,
    confusable: 0,
    combining: 0,
    control: 0,
    privateUse: 0,
    variation: 0,
    whitespace: 0,
  };
  const scripts = new Map<ScriptName, number>();
  let codePointCount = 0;
  const cache = new Map<string, CodePointInfo>();

  const infos: GraphemeInfo[] = [];
  for (let i = 0; i < all.length; i++) {
    const g = all[i]!;
    const cps: CodePointInfo[] = [];
    for (const ch of g) {
      let info = cache.get(ch);
      if (!info) {
        info = inspectCodePoint(ch);
        cache.set(ch, info);
      }
      codePointCount++;
      for (const flag of info.flags) findings[flag]++;
      if (info.script !== 'Common' && info.script !== 'Inherited') {
        scripts.set(info.script, (scripts.get(info.script) ?? 0) + 1);
      }
      cps.push(info);
    }
    if (infos.length < MAX_GRAPHEMES) {
      infos.push({ text: g, codePoints: cps, flags: [...new Set(cps.flatMap((c) => c.flags))] });
    }
  }

  // Words mixing Latin with Cyrillic/Greek/Armenian/Cherokee letters are the homograph signature.
  const mixedScriptWords = [
    ...new Set(
      (input.match(/[\p{L}\p{M}]+/gu) ?? []).filter((word) => {
        const set = new Set(
          [...word].map(scriptOf).filter((s) => s !== 'Common' && s !== 'Inherited'),
        );
        return (
          set.has('Latin') &&
          (set.has('Cyrillic') || set.has('Greek') || set.has('Armenian') || set.has('Cherokee'))
        );
      }),
    ),
  ].slice(0, 50);

  return {
    stats: {
      graphemes: all.length,
      codePoints: codePointCount,
      utf16: input.length,
      utf8: utf8Encode(input).length,
      words: input.match(/[\p{L}\p{N}]+(?:['’\u200C-][\p{L}\p{N}]+)*/gu)?.length ?? 0,
      lines: input ? input.split('\n').length : 0,
      unique: cache.size,
      entropy: shannonEntropy(input),
    },
    scripts: [...scripts.entries()]
      .map(([script, count]) => ({ script, count }))
      .sort((a, b) => b.count - a.count),
    findings,
    mixedScriptWords,
    graphemes: infos,
    truncated: all.length > MAX_GRAPHEMES,
  };
}

export const inspector = defineAnalyzer({
  kind: 'analyzer',
  id: 'inspector',
  category: 'analysis',
  keywords: [
    'unicode',
    'inspector',
    'invisible',
    'zero width',
    'trojan source',
    'bidi',
    'homoglyph',
    'code point',
    'utf-8',
    'hidden',
  ],
  sample: {
    encode: 'Pay\u200Bpal: аccount \u202Edrowssap\u202C 👨\u200D👩\u200D👧 سلام\u200Cدنیا',
  },
  options: [],
  analyze: (input) => inspect(input),
});
