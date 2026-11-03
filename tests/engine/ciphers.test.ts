import { describe, expect, it } from 'vitest';
import { EnigmaMachine, parsePlugboard } from '$engine/transforms/ciphers/enigma';
import { decode, encode, TORTURE } from '../helpers';

describe('Caesar & ROT', () => {
  it('shifts by three like Julius Caesar', async () => {
    expect(await encode('caesar', 'Veni, vidi, vici.', { shift: 3 })).toBe('Yhql, ylgl, ylfl.');
    expect(await decode('caesar', 'Yhql, ylgl, ylfl.', { shift: 3 })).toBe('Veni, vidi, vici.');
  });

  it.each([
    ['rot13', 'Hello, World!', 'Uryyb, Jbeyq!'],
    ['rot5', 'Call 555-0123', 'Call 000-5678'],
    ['rot18', 'Agent 007', 'Ntrag 552'],
    ['rot47', 'Hello, World!', 'w6==@[ (@C=5P'],
  ])('%s is an involution', async (variant, plain, cipher) => {
    expect(await encode('rot', plain, { variant })).toBe(cipher);
    expect(await encode('rot', cipher, { variant })).toBe(plain);
  });
});

describe('Atbash', () => {
  it('reverses the Latin alphabet', async () => {
    expect(await encode('atbash', 'Wizard of the coast')).toBe('Draziw lu gsv xlzhg');
  });

  it('reverses the Hebrew alphabet (Jeremiah 25:26: Sheshach ↔ Babel)', async () => {
    expect(await encode('atbash', 'בבל', { alphabet: 'hebrew' })).toBe('ששך'.replace('ך', 'כ'));
  });

  it('round-trips Persian', async () => {
    const text = 'سلام دنیا';
    expect(
      await encode('atbash', await encode('atbash', text, { alphabet: 'persian' }), {
        alphabet: 'persian',
      }),
    ).toBe(text);
  });
});

describe('Affine', () => {
  it('matches the textbook example (a=5, b=8)', async () => {
    expect(await encode('affine', 'AFFINE CIPHER', { a: '5', b: 8 })).toBe('IHHWVC SWFRCP');
    expect(await decode('affine', 'IHHWVC SWFRCP', { a: '5', b: 8 })).toBe('AFFINE CIPHER');
  });
});

describe('Vigenère family', () => {
  it('encrypts ATTACKATDAWN with LEMON', async () => {
    expect(await encode('vigenere', 'ATTACKATDAWN', { key: 'LEMON' })).toBe('LXFOPVEFRNHR');
  });

  it.each(['vigenere', 'beaufort', 'autokey'] as const)(
    '%s round-trips mixed text',
    async (variant) => {
      const text = 'Meet me at 10pm, near the old mill!';
      const cipher = await encode('vigenere', text, { key: 'Kryptos', variant });
      expect(cipher).not.toBe(text);
      expect(await decode('vigenere', cipher, { key: 'Kryptos', variant })).toBe(text);
    },
  );

  it('supports Gronsfeld numeric keys', async () => {
    const cipher = await encode('vigenere', 'SECRET', { key: '31415', variant: 'gronsfeld' });
    expect(cipher).toBe('VFGSJW');
    expect(await decode('vigenere', cipher, { key: '31415', variant: 'gronsfeld' })).toBe('SECRET');
  });

  it('rejects empty keys with a localisable error', async () => {
    await expect(encode('vigenere', 'abc', { key: '  ' })).rejects.toMatchObject({
      code: 'keyRequired',
    });
  });
});

describe('Playfair', () => {
  it('matches the Wikipedia example', async () => {
    const cipher = await encode('playfair', 'Hide the gold in the tree stump', {
      key: 'playfair example',
      group: false,
    });
    expect(cipher).toBe('BMODZBXDNABEKUDMUIXMMOUVIF');
    expect(await decode('playfair', cipher, { key: 'playfair example' })).toBe(
      'HIDETHEGOLDINTHETREESTUMP',
    );
  });
});

describe('Transposition', () => {
  it('winds a scytale like the textbook example (4 letters per turn)', async () => {
    expect(await encode('scytale', 'Iamhurtverybadlyhelp', { diameter: 4 })).toBe(
      'Iryyatbhmvaehedlurlp',
    );
    expect(await decode('scytale', 'Iryyatbhmvaehedlurlp', { diameter: 4 })).toBe(
      'Iamhurtverybadlyhelp',
    );
  });

  it('round-trips a scytale of any length and diameter', async () => {
    for (let diameter = 2; diameter <= 9; diameter++) {
      for (const text of ['A', 'ABCDE', 'Help me, Brasidas!', TORTURE]) {
        const sealed = await encode('scytale', text, { diameter });
        expect(await decode('scytale', sealed, { diameter })).toBe(text);
      }
    }
  });

  it('rail fence matches the classic example', async () => {
    expect(await encode('railfence', 'WEAREDISCOVEREDFLEEATONCE', { rails: 3 })).toBe(
      'WECRLTEERDSOEEFEAOCAIVDEN',
    );
  });

  it.each([2, 3, 5, 7])('rail fence round-trips with %i rails and offsets', async (rails) => {
    for (let offset = 0; offset < 4; offset++) {
      const cipher = await encode('railfence', TORTURE, { rails, offset });
      expect(await decode('railfence', cipher, { rails, offset })).toBe(TORTURE);
    }
  });

  it('columnar matches the ZEBRAS example (irregular form)', async () => {
    expect(await encode('columnar', 'WEAREDISCOVEREDFLEEATONCE', { key: 'ZEBRAS' })).toBe(
      'EVLNACDTESEAROFODEECWIREE',
    );
  });

  it('columnar round-trips arbitrary text', async () => {
    const cipher = await encode('columnar', TORTURE, { key: 'SECRET' });
    expect(await decode('columnar', cipher, { key: 'SECRET' })).toBe(TORTURE);
  });
});

describe('Bacon & Polybius', () => {
  it('Bacon symbols round-trip', async () => {
    const cipher = await encode('bacon', 'Knowledge is power');
    expect(cipher.startsWith('ABABA ABBAB')).toBe(true);
    expect(await decode('bacon', cipher)).toBe('KNOWLEDGE IS POWER');
  });

  it('Bacon hides a message in letter case', async () => {
    const stego = await encode('bacon', 'Hi', { mode: 'case' });
    expect(stego.toLowerCase()).toBe((await encode('bacon', 'x', { mode: 'case' })).toLowerCase());
    expect(await decode('bacon', stego, { mode: 'case' })).toBe('HI');
  });

  it('Polybius uses row/column coordinates', async () => {
    expect(await encode('polybius', 'Polybius')).toBe('35 34 31 54 12 24 45 43');
    expect(await decode('polybius', '35 34 31 54 12 24 45 43 / 43 41 45 11 42 15')).toBe(
      'POLYBIUS SQUARE',
    );
  });

  it('Polybius with ADFGX labels round-trips', async () => {
    const cipher = await encode('polybius', 'attack at once', { labels: 'adfgx', key: 'cipher' });
    expect(cipher).toMatch(/^[ADFGX /]+$/);
    expect(await decode('polybius', cipher, { labels: 'adfgx', key: 'cipher' })).toBe(
      'ATTACK AT ONCE',
    );
  });
});

describe('XOR', () => {
  it('matches the Cryptopals repeating-key XOR vector', async () => {
    const text = "Burning 'em, if you ain't quick and nimble\nI go crazy when I hear a cymbal";
    const cipher = await encode('xor', text, { key: 'ICE' });
    expect(cipher).toBe(
      '0b3637272a2b2e63622c2e69692a23693a2a3c6324202d623d63343c2a26226324272765272' +
        'a282b2f20430a652e2c652a3124333a653e2b2027630c692b20283165286326302e27282f',
    );
    expect(await decode('xor', cipher, { key: 'ICE' })).toBe(text);
  });

  it('round-trips Unicode through Base64', async () => {
    const cipher = await encode('xor', TORTURE, { key: 'k3y', format: 'base64' });
    expect(await decode('xor', cipher, { key: 'k3y', format: 'base64' })).toBe(TORTURE);
  });
});

describe('Enigma', () => {
  const base = {
    rotors: ['I', 'II', 'III'],
    reflector: 'B',
    rings: [0, 0, 0],
    positions: [0, 0, 0],
    plugboard: '',
  } as const;

  it('produces the well-known AAAAA → BDZGO test vector', () => {
    expect(new EnigmaMachine(base).process('AAAAA', false)).toBe('BDZGO');
  });

  it('reproduces the double-stepping anomaly (ADU → ADV → AEW → BFX)', () => {
    const machine = new EnigmaMachine({ ...base, positions: [0, 3, 20] });
    const windows = [0, 1, 2].map(() => (machine.press('A'), machine.windows));
    expect(windows).toEqual(['ADV', 'AEW', 'BFX']);
  });

  it('is reciprocal and never maps a letter to itself', async () => {
    const plain = 'THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG'.repeat(4);
    const cipher = await encode('enigma', plain, {
      format: 'remove',
      pos1: 'Q',
      ring2: 'F',
      plugboard: 'AZ BY',
    });
    expect([...cipher].every((c, i) => c !== plain[i])).toBe(true);
    expect(
      await encode('enigma', cipher, {
        format: 'remove',
        pos1: 'Q',
        ring2: 'F',
        plugboard: 'AZ BY',
      }),
    ).toBe(plain);
  });

  it('validates the plugboard and rotor selection', async () => {
    expect(() => parsePlugboard('AB AC')).toThrow();
    await expect(encode('enigma', 'A', { rotor1: 'I', rotor2: 'I' })).rejects.toMatchObject({
      code: 'duplicateRotors',
    });
  });
});

describe('Historical vectors', () => {
  it('decrypts the worked example of the 1930 Enigma manual (UKW-A, II I III, rings XMV)', async () => {
    const plain = await decode(
      'enigma',
      'GCDSE AHUGW TQGRK VLFGX UCALX VYMIG MMNMF DXTGN VHVRM MEVOU YFZSL RHDRR XFJWC FHUHM UNZEF RDISI KBGPM YVXUZ',
      {
        reflector: 'A',
        rotor1: 'II',
        rotor2: 'I',
        rotor3: 'III',
        ring1: 'X',
        ring2: 'M',
        ring3: 'V',
        pos1: 'A',
        pos2: 'B',
        pos3: 'L',
        plugboard: 'AM FI NV PS TU WZ',
        format: 'groups',
      },
    );
    expect(plain).toBe(
      'FEIND LIQEI NFANT ERIEK OLONN EBEOB AQTET XANFA NGSUE DAUSG ANGBA ERWAL DEXEN DEDRE IKMOS TWAER TSNEU STADT',
    );
  });

  it('hides FUGE in Bacon’s own cover sentence (De Augmentis, 1623)', async () => {
    const options = { mode: 'case', variant: 'classic', cover: 'Manere te volo donec venero' };
    const sealed = await encode('bacon', 'FUGE', options);
    expect(sealed.toLowerCase()).toBe('manere te volo donec venero');
    expect(await decode('bacon', sealed, options)).toBe('FUGE');
  });

  it('reads Leb Kamai as Kasdim (Jeremiah 51:1)', async () => {
    expect(await encode('atbash', 'כשדים', { alphabet: 'hebrew' })).toBe('לבקמי');
  });
});
