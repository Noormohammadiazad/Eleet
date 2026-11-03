import { describe, expect, it } from 'vitest';
import { morseSchedule } from '$engine/transforms/codes/morse';
import { FANCY_STYLE_NAMES } from '$engine/transforms/unicode/fancy';
import { splitWords } from '$engine/transforms/text/case';
import { decode, encode, TORTURE } from '../helpers';

describe('Morse code', () => {
  it('encodes SOS and decodes with alternative glyphs', async () => {
    expect(await encode('morse', 'SOS help')).toBe('... --- ... / .... . .-.. .--.');
    expect(await decode('morse', '••• −−− •••')).toBe('SOS');
  });

  it('supports Persian Morse', async () => {
    const code = await encode('morse', 'سلام ۱۴۰۵', { alphabet: 'persian' });
    expect(code).toBe('... .-.. .- -- / .---- ....- ----- .....');
    expect(await decode('morse', code, { alphabet: 'persian' })).toBe('سلام ۱۴۰۵');
  });

  it('rejects non-Morse input', async () => {
    await expect(decode('morse', 'hello')).rejects.toMatchObject({ code: 'invalidMorse' });
  });

  it('builds PARIS-timed keying schedules', () => {
    const events = morseSchedule('.- / -', 20);
    expect(events[0]).toEqual({ on: true, ms: 60 });
    expect(events[2]).toEqual({ on: true, ms: 180 });
    expect(events[3]).toEqual({ on: false, ms: 420 });
  });
});

describe('Spelling alphabets & tactile codes', () => {
  it('NATO round-trips and accepts variant spellings', async () => {
    expect(await encode('nato', 'SOS 9')).toBe('Sierra Oscar Sierra / Nine');
    expect(await encode('nato', '9', { style: 'icao' })).toBe('Niner');
    expect(await decode('nato', 'alpha juliet X-ray / niner')).toBe('AJX 9');
  });

  it('Braille handles capitals, numbers and punctuation', async () => {
    const cells = await encode('braille', 'Hi 42!');
    expect(cells).toBe('⠠⠓⠊ ⠼⠙⠃⠖');
    expect(await decode('braille', cells)).toBe('Hi 42!');
  });

  it('tap code folds K into C', async () => {
    expect(await encode('tapcode', 'kit', { format: 'digits' })).toBe('13 24 44');
    expect(await decode('tapcode', '. ...  .. ....  .... ....')).toBe('CIT');
  });

  it('A1Z26 and multi-tap', async () => {
    expect(await encode('a1z26', 'Hi you')).toBe('8-9 25-15-21');
    expect(await decode('a1z26', '8-9 25-15-21')).toBe('HI YOU');
    expect(await encode('t9', 'hi')).toBe('44 444');
    expect(await decode('t9', '44 444 0 7777')).toBe('hi s');
  });

  it('T9 predicts the most frequent dictionary word', async () => {
    expect(await decode('t9', '4663 43556', { mode: 't9' })).toBe('good hello');
  });
});

describe('Unicode styles', () => {
  it.each(FANCY_STYLE_NAMES)('%s normalises back to plain text', async (style) => {
    const plain = 'Leet 1337';
    const fancy = await encode('fancy', plain, { style });
    const back = await decode('fancy', fancy);
    // Styles without full coverage (e.g. subscript) leave unmapped characters untouched.
    expect(back.toLowerCase()).toBe(plain.toLowerCase());
  });

  it('produces real Mathematical Alphanumeric Symbols', async () => {
    expect(await encode('fancy', 'Hz', { style: 'doubleStruck' })).toBe('ℍ𝕫');
    expect(await encode('fancy', 'ab', { style: 'fraktur' })).toBe('𝔞𝔟');
  });

  it('keeps regional indicators from fusing into flags', async () => {
    const out = await encode('fancy', 'IR', { style: 'regional' });
    expect([...out]).toHaveLength(3);
  });

  it('flip and mirror are reversible', async () => {
    const text = 'Hello from the other side! (2026)';
    expect(await decode('flip', await encode('flip', text))).toBe(text);
    expect(await encode('flip', 'Hello')).toBe('ollǝH');
    expect(await decode('mirror', await encode('mirror', 'backwards'))).toBe('backwards');
  });

  it('zalgo is deterministic and strips cleanly without harming Persian harakat', async () => {
    const text = 'He comes — س\u064Eلام';
    const cursed = await encode('zalgo', text, { seed: 7 });
    expect(cursed).toBe(await encode('zalgo', text, { seed: 7 }));
    expect(cursed.length).toBeGreaterThan(text.length * 3);
    expect(await decode('zalgo', cursed)).toBe(text);
  });

  it('decorations add and remove combining marks', async () => {
    const struck = await encode('decorations', 'no', { style: 'strike' });
    expect(struck).toBe('n\u0336o\u0336');
    expect(await decode('decorations', struck)).toBe('no');
  });
});

describe('Text tools', () => {
  it('splits identifiers into words', () => {
    expect(splitWords('parseHTTPResponse v2_final')).toEqual([
      'parse',
      'HTTP',
      'Response',
      'v2',
      'final',
    ]);
  });

  it.each([
    ['upper', 'HELLO WORLD'],
    ['camel', 'helloWorld'],
    ['pascal', 'HelloWorld'],
    ['snake', 'hello_world'],
    ['kebab', 'hello-world'],
    ['constant', 'HELLO_WORLD'],
    ['dot', 'hello.world'],
    ['train', 'Hello-World'],
    ['alternating', 'hElLo WoRlD'],
  ])('case style %s', async (style, expected) => {
    expect(await encode('case', 'hello world', { style })).toBe(expected);
  });

  it('title case keeps minor words lower-case', async () => {
    expect(await encode('case', 'the lord of the rings', { style: 'title' })).toBe(
      'The Lord of the Rings',
    );
  });

  it('reverses by grapheme, keeping emoji and flags intact', async () => {
    expect(await encode('reverse', 'ab🇮🇷👨\u200D👩\u200D👧')).toBe('👨\u200D👩\u200D👧🇮🇷ba');
    for (const mode of ['text', 'words', 'letters', 'lines']) {
      expect(await encode('reverse', await encode('reverse', TORTURE, { mode }), { mode })).toBe(
        TORTURE,
      );
    }
  });

  it('pig latin encodes clusters and decodes via the dictionary', async () => {
    expect(await encode('piglatin', 'Pig Latin is quite strange')).toBe(
      'Igpay Atinlay isway itequay angestray',
    );
    expect(await decode('piglatin', 'Igpay Atinlay isway itequay angestray')).toBe(
      'Pig Latin is quite strange',
    );
  });

  it('uwu-ifies deterministically', async () => {
    expect(await encode('uwu', 'Hello friend', { stutter: 0, faces: 0 })).toBe('Hewwo fwiend');
  });
});
