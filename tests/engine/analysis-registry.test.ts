import { describe, expect, it } from 'vitest';
import type { CrackReport } from '$engine/analysis/crack';
import type { FrequencyReport } from '$engine/analysis/frequency';
import type { InspectorReport } from '$engine/analysis/inspector';
import type { MagicReport } from '$engine/analysis/magic';
import { defaultOptions, diffFromDefaults, sanitizeOptions } from '$engine/core/options';
import { runPipeline, type PipelineStep } from '$engine/core/pipeline';
import { CATEGORY_IDS } from '$engine/core/types';
import { TOOLS, TRANSFORMS, getTransform, toolsByCategory } from '$engine/registry';
import { analyze, decode, encode, TORTURE } from '../helpers';

describe('Magic auto-detection', () => {
  it('peels Base64 → hex → plaintext', async () => {
    const hexed = await encode('hex', 'The quick brown fox');
    const report = await analyze<MagicReport>('magic', await encode('base64', hexed));
    const best = report.candidates[0]!;
    expect(best.output).toBe('The quick brown fox');
    expect(best.steps.map((s) => s.tool)).toEqual(['base64', 'hex']);
  });

  it.each([
    ['rot', 'Gur dhvpx oebja sbk whzcf bire gur ynml qbt'],
    ['morse', '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'],
    ['binary', '01001000 01100101 01101100 01101100 01101111 00100001'],
    ['url', 'Hello%2C%20World%21%20How%20are%20you%3F'],
  ])('recognises %s', async (tool, input) => {
    const report = await analyze<MagicReport>('magic', input, { depth: 2 });
    expect(report.candidates[0]!.steps[0]!.tool).toBe(tool);
    expect(report.candidates[0]!.score).toBeGreaterThan(0.4);
  });

  it('finds Persian typed on an English layout', async () => {
    const report = await analyze<MagicReport>('magic', 'sghl nkdh', { depth: 1 });
    expect(report.candidates.some((c) => c.output === 'سلام دنیا')).toBe(true);
  });
});

describe('Classical cipher cracker', () => {
  const plain =
    'It is a truth universally acknowledged that a single man in possession of a good fortune must be in want of a wife.';

  it('breaks Caesar', async () => {
    const report = await analyze<CrackReport>(
      'crack',
      await encode('caesar', plain, { shift: 11 }),
      { cipher: 'caesar' },
    );
    expect(report.candidates[0]).toMatchObject({
      cipher: 'caesar',
      options: { shift: 11 },
      plaintext: plain,
    });
  });

  it('breaks affine', async () => {
    const report = await analyze<CrackReport>(
      'crack',
      await encode('affine', plain, { a: '7', b: 3 }),
      { cipher: 'affine' },
    );
    expect(report.candidates[0]!.plaintext).toBe(plain);
  });

  it('recovers a Vigenère key with Friedman + χ²', async () => {
    const long = plain.repeat(2);
    const report = await analyze<CrackReport>(
      'crack',
      await encode('vigenere', long, { key: 'AUSTEN' }),
      { cipher: 'vigenere' },
    );
    expect(report.candidates[0]).toMatchObject({ key: 'AUSTEN', plaintext: long });
  });

  it('breaks rail fence and short columnar keys in auto mode', async () => {
    const rail = await analyze<CrackReport>(
      'crack',
      await encode('railfence', plain, { rails: 4 }),
    );
    expect(rail.candidates[0]!.plaintext).toBe(plain);
    const col = await analyze<CrackReport>(
      'crack',
      await encode('columnar', plain, { key: 'BRIDE' }),
      { cipher: 'columnar' },
    );
    expect(col.candidates[0]!.plaintext).toBe(plain);
  });
});

describe('Frequency analysis', () => {
  it('classifies plaintext, substitution and polyalphabetic ciphertext', async () => {
    const text =
      'Frequency analysis is based on the fact that, in any given stretch of written language, certain letters and combinations of letters occur with varying frequencies. Moreover, there is a characteristic distribution of letters that is roughly the same for almost all samples of that language.';
    const verdict = async (t: string) => (await analyze<FrequencyReport>('frequency', t)).verdict;
    expect(await verdict(text)).toBe('english');
    expect(await verdict(await encode('caesar', text, { shift: 7 }))).toBe('monoalphabetic');
    expect(await verdict(await encode('railfence', text, { rails: 5 }))).toBe('transposition');
    expect(await verdict(await encode('vigenere', text, { key: 'CRYPTANALYSIS' }))).toBe(
      'polyalphabetic',
    );
    expect(await verdict('سلام دنیا، این یک متن فارسی است')).toBe('nonLatin');
  });

  it('reports letter statistics', async () => {
    const report = await analyze<FrequencyReport>('frequency', 'aaab');
    expect(report.letters[0]).toMatchObject({ letter: 'A', count: 3, percent: 75 });
    expect(report.totalLetters).toBe(4);
  });
});

describe('Unicode inspector', () => {
  it('flags invisible, bidi, tag and homoglyph characters', async () => {
    const report = await analyze<InspectorReport>(
      'inspector',
      'Pay\u200Bpal \u202Eevil\u202C \u{E0041} раураl',
    );
    expect(report.findings.invisible).toBe(1);
    expect(report.findings.bidi).toBe(2);
    expect(report.findings.tag).toBe(1);
    expect(report.findings.confusable).toBeGreaterThanOrEqual(4);
    expect(report.mixedScriptWords).toContain('раураl');
  });

  it('counts graphemes, code points and bytes correctly', async () => {
    const report = await analyze<InspectorReport>('inspector', 'e\u0301👨\u200D👩\u200D👧');
    expect(report.stats).toMatchObject({ graphemes: 2, codePoints: 7, utf16: 10 });
  });
});

describe('Registry invariants', () => {
  it('has unique ids and known categories', () => {
    const ids = TOOLS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const tool of TOOLS) expect(CATEGORY_IDS).toContain(tool.category);
    expect(toolsByCategory().every((g) => g.tools.length > 0)).toBe(true);
  });

  it('every tool has a sample', () => {
    for (const tool of TOOLS)
      if (tool.kind !== 'workspace') expect(tool.sample?.encode, tool.id).toBeTruthy();
  });

  it('option defaults survive sanitisation and share-link diffing', () => {
    for (const tool of TOOLS) {
      const defaults = defaultOptions(tool.options);
      expect(sanitizeOptions(tool.options, defaults), tool.id).toEqual(defaults);
      expect(diffFromDefaults(tool.options, defaults), tool.id).toEqual({});
    }
  });

  it('sanitisation clamps, drops unknown keys and never leaks secrets', () => {
    const caesar = getTransform('caesar')!;
    expect(sanitizeOptions(caesar.options, { shift: 999, evil: '<script>' })).toEqual({
      shift: 25,
    });
    const aes = getTransform('aes')!;
    expect(
      sanitizeOptions(aes.options, { password: 'hunter2' }, { includeSecrets: false }).password,
    ).toBe('');
    expect(diffFromDefaults(aes.options, { password: 'hunter2', iterations: '600000' })).toEqual(
      {},
    );
  });

  // Lossy by design (case folding, alphabet reduction, dictionary guesses) or covered by dedicated tests.
  const lossy = new Set([
    'aes',
    'zalgo',
    'playfair',
    'bacon',
    'polybius',
    'tapcode',
    'a1z26',
    'nato',
    'morse',
    'enigma',
    't9',
    'leet',
    'finglish',
    'piglatin',
    'homoglyph',
    'fancy',
    'flip',
    'mirror',
    'keyboard',
    'abjad',
    'braille',
  ]);

  it.each(TRANSFORMS.filter((t) => t.decode && !lossy.has(t.id)).map((t) => t.id))(
    '%s round-trips its sample and a torture string',
    async (id) => {
      const tool = getTransform(id)!;
      for (const text of [tool.sample!.encode!, TORTURE]) {
        const encoded = await encode(id, text);
        expect(encoded).toBe(await encode(id, text));
        expect(await decode(id, encoded)).toBe(text);
      }
    },
  );

  it.each(TRANSFORMS.filter((t) => t.involution).map((t) => t.id))(
    '%s is an involution',
    async (id) => {
      const sample = getTransform(id)!.sample!.encode!;
      expect(await encode(id, await encode(id, sample))).toBe(sample);
    },
  );

  it('never throws a non-localisable error on hostile input', async () => {
    const hostile = ['', ' ', '\u0000', '\uD800', '%%%', '=====', 'ÿ'.repeat(500), TORTURE];
    for (const tool of TRANSFORMS) {
      for (const input of hostile) {
        for (const direction of ['encode', 'decode'] as const) {
          if (direction === 'decode' && !tool.decode) continue;
          try {
            await (direction === 'encode' ? encode(tool.id, input) : decode(tool.id, input));
          } catch (error) {
            expect(
              (error as { code?: string }).code,
              `${tool.id} ${direction} ${JSON.stringify(input)}`,
            ).toBeTypeOf('string');
          }
        }
      }
    }
  });
});

describe('Pipelines', () => {
  const step = (
    tool: string,
    direction: 'encode' | 'decode' = 'encode',
    options = {},
  ): PipelineStep => ({
    uid: tool + direction,
    tool,
    direction,
    options,
    enabled: true,
  });

  it('chains steps and reports every intermediate result', async () => {
    const results = await runPipeline(
      'Attack at dawn',
      [step('leet'), step('base64'), step('reverse')],
      getTransform,
    );
    expect(results.every((r) => r.ok === true)).toBe(true);
    const last = results.at(-1) as { output: string };
    const back = await runPipeline(
      last.output,
      [step('reverse'), step('base64', 'decode')],
      getTransform,
    );
    expect((back.at(-1) as { output: string }).output).toBe(await encode('leet', 'Attack at dawn'));
  });

  it('stops at the first failure and skips the rest', async () => {
    const results = await runPipeline(
      'not base64 !!',
      [step('base64', 'decode'), step('reverse')],
      getTransform,
    );
    expect(results[0]).toMatchObject({ ok: false, error: { code: 'invalidBase64' } });
    expect(results[1]).toEqual({ ok: 'skipped' });
  });

  it('skips disabled steps', async () => {
    const results = await runPipeline(
      'abc',
      [{ ...step('reverse'), enabled: false }, step('case', 'encode', { style: 'upper' })],
      getTransform,
    );
    expect(results[1]).toMatchObject({ ok: true, output: 'ABC' });
  });
});

describe('Example recipes', () => {
  it('decode to the documented plaintext', async () => {
    const { EXAMPLE_RECIPES } = await import('$lib/state/pipeline.svelte');
    const recipe = EXAMPLE_RECIPES.example2!;
    const steps = recipe.steps.map((s, i) => ({
      uid: String(i),
      tool: s.t,
      direction: s.d ?? 'encode',
      options: s.o ?? {},
      enabled: true,
    }));
    const results = await runPipeline(recipe.input, steps, getTransform);
    expect(results.at(-1)).toMatchObject({ ok: true, output: 'Decoding is an art form' });
  });
});
