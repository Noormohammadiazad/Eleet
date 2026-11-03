/**
 * English message catalog — the reference catalog.
 *
 * Its shape defines the `Messages` type; every other language must provide
 * exactly the same keys (enforced at compile time and by a unit test).
 * Interpolation uses `{name}` placeholders.
 */
export const en = {
  meta: {
    title: 'Eleet',
    description:
      'A zero-server cabinet of secret writing: leet speak, the scytale, Caesar, Enigma, Morse, braille, Base64, AES, steganography and cryptanalysis, with historical dossiers. Everything runs in your browser.',
  },
  app: {
    name: 'Eleet',
    tagline: 'Secret writing, from Sparta to SHA-3',
    overview: 'Overview',
    home: 'Eleet — overview',
    skip: 'Skip to workspace',
    search: 'Search tools…',
    searchLabel: 'Search tools',
    searchShortcut: 'Search tools ({key})',
    noResults: 'No tools match “{query}”.',
    menu: 'Open tool menu',
    closeMenu: 'Close tool menu',
    tools: 'Tools',
    toolCount: '{n} tool|{n} tools',
    github: 'Source code on GitHub',
    theme: 'Theme',
    themes: { light: 'Light', dark: 'Dark', system: 'System' },
    switchTheme: 'Switch theme (current: {theme})',
    language: 'Language',
    switchLanguage: 'فارسی',
    switchLanguageLabel: 'تغییر زبان به فارسی',
    privacy:
      'Zero-server: everything runs locally in your browser. Nothing you type is ever uploaded.',
    offlineReady: 'Eleet is ready to work offline.',
    updateAvailable: 'A new version of Eleet is available.',
    reload: 'Reload',
    dismiss: 'Dismiss',
    footer: 'Open source under the MIT License.',
    version: 'Version {version}',
    notFound: 'That page does not exist, so here is the overview.',
    shortcuts: 'Keyboard shortcuts',
  },
  shortcuts: {
    palette: 'Search tools',
    swap: 'Swap input and output',
    copy: 'Copy output',
    direction: 'Toggle encode / decode',
    help: 'Show keyboard shortcuts',
  },
  categories: {
    substitution: 'Substitution',
    transposition: 'Transposition',
    steganography: 'Steganography',
    signals: 'Signals & Codes',
    encodings: 'Machine Encodings',
    cryptography: 'Modern Cryptography',
    analysis: 'Cryptanalysis',
    typography: 'Typography & Play',
    persian: 'Persian Script',
    workshop: 'Workshop',
  },
  categoryNotes: {
    substitution:
      'Each letter is exchanged for another sign while the order stays put — from Hebrew scribes to the bulletin boards of the 1980s.',
    transposition: 'The letters stay exactly as they are and trade places instead.',
    steganography:
      'Conceal that there is a message at all: in letter case, look-alike letters or invisible characters.',
    signals:
      'Letters turned into dots and dashes, taps, torch positions, raised points and spoken words.',
    encodings: 'How bytes survive email, URLs and the web. Portable, not secret.',
    cryptography:
      'Digests, message authentication and real encryption, built on the browser’s own cryptography.',
    analysis:
      'Read what was meant to stay unread: statistics, exhaustive search and automatic decoding.',
    typography: 'Unicode lettering, upside-down and mirrored text, and the oldest word games.',
    persian: 'Finglish, abjad numerals, digit systems and the wrong-keyboard fix.',
    workshop: 'Chain any instruments into a recipe and share it as a link.',
  },
  era: {
    bce: '{year} BCE',
    ce: '{year}',
    circa: 'c. {date}',
  },
  home: {
    kicker: 'A cabinet of secret writing',
    title: 'Secret writing, from the scytale to SHA-3.',
    lede: 'Eleet is a working cabinet of {n} instruments for transforming text: Spartan rods and Enigma rotors, Morse and braille, Base64 and AES, leet speak and the Persian abjad. Every one of them runs on your own device — nothing you type ever leaves it.',
    begin: 'Open the specimen sheet',
    browse: 'Browse the catalogue',
    specimen: {
      title: 'Specimen sheet',
      hint: 'One line, set in many hands. Type your own and watch it change.',
      label: 'Specimen text',
      sample: 'Meet me at the old lighthouse',
      reset: 'Restore the sample line',
      open: 'Open {tool} with this text',
    },
    catalogue: {
      title: 'The catalogue',
      hint: '{n} instruments in {m} drawers.',
    },
    archive: {
      title: 'From the archive',
      hint: 'Dossiers on the people, machines and intercepted letters behind the instruments, illustrated with public-domain artifacts from libraries and archives.',
      read: 'Read the {tool} dossier',
    },
    rules: {
      title: 'House rules',
      local: 'Nothing leaves your device',
      localBody:
        'There is no server to send anything to, and a strict Content-Security-Policy forbids the page from contacting any other origin.',
      offline: 'Works offline',
      offlineBody:
        'After the first visit Eleet is stored on your device and keeps working without a connection.',
      open: 'Open source',
      openBody:
        'Every algorithm is written from first principles in readable, tested TypeScript, under the MIT License.',
    },
    colophon:
      'Set in Newsreader, Inter, JetBrains Mono, Vazirmatn and Noto Naskh Arabic. Archival images are in the public domain; each figure names its source.',
  },
  dossier: {
    label: 'Dossier',
    dispatches: 'Dispatches',
    tryIt: 'Load into the workbench',
    loaded: 'Loaded into the workbench.',
    figure: 'Fig. {n}',
    source: 'Source',
    publicDomain: 'Public domain',
    cc0: 'CC0 1.0',
    diagram: 'Diagram drawn for Eleet',
    loading: 'Opening the file…',
    read: 'Read the dossier',
    enlarge: 'Enlarge: {title}',
    close: 'Close',
    reading: 'Further reading',
    illustrative: 'Illustration',
    illustrativeHint: 'A demonstration made for Eleet, not a surviving historical text.',
    jump: 'Dossier',
  },
  workbench: {
    input: 'Input',
    output: 'Output',
    encode: 'Encode',
    decode: 'Decode',
    direction: 'Direction',
    swap: 'Swap input and output',
    options: 'Options',
    resetOptions: 'Reset options',
    copy: 'Copy',
    copied: 'Copied to clipboard',
    copiedShort: 'Copied',
    copyFailed: 'Could not access the clipboard',
    paste: 'Paste',
    clear: 'Clear',
    sample: 'Example',
    sampleLabel: 'Load an example input',
    share: 'Share',
    shareLabel: 'Copy a link that reproduces this result',
    shareCopied: 'Share link copied — the text travels in the link itself, never through a server.',
    shareTooLong: 'The input is too large to fit in a link; the link includes the options only.',
    download: 'Download',
    useAsInput: 'Use as input',
    characters: '{n} char|{n} chars',
    bytes: '{n} byte|{n} bytes',
    lines: '{n} line|{n} lines',
    duration: '{n} ms',
    working: 'Working…',
    placeholder: 'Type or paste text here…',
    placeholderDecode: 'Paste the text to decode…',
    emptyOutput: 'The result appears here as you type.',
    oneWay: 'One-way transform',
    show: 'Show',
    hide: 'Hide',
    randomize: 'Random seed',
    about: 'About this tool',
    error: 'Could not process the input',
    run: 'Run',
    history: 'History',
  },
  errors: {
    invalidInput: 'The input could not be processed. {detail}',
    invalidBase64: 'This is not valid Base64 (unexpected “{char}” at position {position}).',
    invalidBase32: 'This is not valid Base32 (unexpected “{char}” at position {position}).',
    invalidBase58: 'This is not valid Base58 (unexpected “{char}” at position {position}).',
    invalidAscii85: 'This is not valid Ascii85.',
    invalidDigits: 'Expected base-{base} digits.',
    invalidUtf8: 'The decoded bytes are not valid UTF-8 text.',
    invalidPercent: 'Malformed percent-encoding.',
    invalidPunycode: 'Malformed Punycode.',
    invalidMorse: 'Morse code may only contain dots, dashes, spaces and “/”.',
    invalidCiphertext: 'This is not an Eleet sealed box (expected Base64 output of this tool).',
    keyRequired: 'A key is required.',
    keyLettersOnly: 'The key must contain at least one letter A–Z.',
    keyDigitsOnly: 'A Gronsfeld key may only contain digits.',
    notCoprime: 'The multiplier {a} shares a factor with 26, so it cannot be inverted.',
    duplicateRotors: 'Each rotor can only be installed once.',
    invalidPlugboard: 'Plugboard pairs must be distinct letter pairs, like “AB CD EF”.',
    decryptFailed: 'Decryption failed: wrong password or corrupted data.',
    secretRequired: 'Type the secret message to hide.',
    coverRequired: 'The cover text needs at least {needed} letters (it has {available}).',
    nothingHidden: 'No hidden message was found in this text.',
    unsupportedAlgorithm: 'Unsupported algorithm: {algorithm}.',
    tooLarge: 'The input is too large.',
    aborted: 'Cancelled.',
  },
  common: {
    options: {
      seed: 'Seed',
      key: 'Key',
      density: 'Density',
      format: 'Output format',
      unit: 'Unit',
      separator: 'Separator',
      prefix: 'Prefix (0x, 0b, 0o)',
      uppercase: 'Upper-case letters',
      alphabet: 'Alphabet',
      padding: 'Padding (=)',
      style: 'Style',
      mode: 'Mode',
      variant: 'Variant',
      algorithm: 'Algorithm',
      cover: 'Cover text',
      maxKeyLength: 'Max key length',
    },
    choices: {
      unit: { bytes: 'UTF-8 bytes', codepoints: 'Code points' },
      separator: { space: 'Space', none: 'None', comma: 'Comma', newline: 'New line' },
      keyFormat: { text: 'Text', hex: 'Hex' },
    },
  },
  tools: {
    leet: {
      name: 'Leet Speak',
      summary: 'Turn text into l337 5p34k — and back again.',
      description:
        'Leet (from “elite”) grew out of 1980s bulletin-board systems, where hackers and warez groups swapped letters for look-alike digits and symbols to show status and dodge keyword filters. Eleet models it faithfully: four tiers of glyphs from readable “h3ll0” to hardcore ASCII art “|-|3|_|_0”, scene slang (“teh”, “pwn3d”, “n00b”), morphology (“-xor”, “-z”) and a probabilistic decoder that reads leet back into plain English. Every built-in preset is collision-free — no two letters ever share a glyph — so i becomes 1 while l stays l.',
      actions: { encode: 'Leetify', decode: 'Decode' },
      options: {
        preset: 'Intensity',
        density: 'Density',
        strategy: 'Glyph choice',
        caseMode: 'Letter case',
        slang: 'Hacker slang',
        suffixes: 'Leet morphology (-xor, -z)',
        keepNumbers: 'Keep real numbers',
        custom: 'Glyph matrix',
      },
      choices: {
        preset: {
          readable: 'Readable',
          classic: 'Classic',
          hardcore: 'Hardcore',
          cyrillic: 'Cyrillic',
          custom: 'Custom',
        },
        strategy: { first: 'Preferred', random: 'Random', cycle: 'Cycle' },
        caseMode: {
          preserve: 'Preserve',
          lower: 'lower',
          upper: 'UPPER',
          alternate: 'aLtErNaTe',
          random: 'rAnDOm',
        },
      },
    },
    caesar: {
      name: 'Caesar Cipher',
      summary: 'Shift every letter along the alphabet.',
      description:
        'According to Suetonius, Julius Caesar protected military messages by shifting each letter three places: A became D, B became E. With only 25 possible keys it falls instantly to brute force — the panel below tries them all and ranks them by how English they look.',
      options: { shift: 'Shift' },
    },
    rot: {
      name: 'ROT13 & Friends',
      summary: 'ROT13, ROT5, ROT18 and ROT47 rotations.',
      description:
        'ROT13 became the Usenet convention of the 1980s for hiding spoilers and punchlines: rotating the 26 letters by 13 is its own inverse. ROT5 rotates digits, ROT18 does both, and ROT47 rotates all 94 printable ASCII characters.',
      options: { variant: 'Rotation' },
    },
    atbash: {
      name: 'Atbash',
      summary: 'Mirror the alphabet: A↔Z, B↔Y…',
      description:
        'One of the oldest ciphers on record, used in the Hebrew Bible — “Sheshach” in Jeremiah 25:26 is Atbash for Babel. The first letter swaps with the last, the second with the second-to-last, and so on. Eleet implements it for the Latin, Hebrew and Persian alphabets.',
      options: { alphabet: 'Alphabet' },
      choices: { alphabet: { latin: 'Latin', hebrew: 'Hebrew', persian: 'Persian' } },
    },
    affine: {
      name: 'Affine Cipher',
      summary: 'Encrypt with the function (a·x + b) mod 26.',
      description:
        'A mathematical generalisation of Caesar: each letter x becomes (a·x + b) mod 26. The multiplier a must be coprime with 26 so the mapping can be inverted, leaving 12 × 26 = 312 keys — few enough for the cracker to try them all.',
      options: { a: 'Multiplier a', b: 'Offset b' },
    },
    vigenere: {
      name: 'Vigenère Cipher',
      summary: 'The polyalphabetic “indecipherable cipher”.',
      description:
        'Described by Bellaso in 1553 and misattributed to Vigenère, it shifts each letter by the matching letter of a repeating keyword. It resisted attack for three centuries until Babbage and Kasiski broke it in the 1850s–60s. Includes the Beaufort, Autokey and Gronsfeld variants.',
      options: { variant: 'Variant', key: 'Keyword' },
      choices: {
        variant: {
          vigenere: 'Vigenère',
          beaufort: 'Beaufort',
          autokey: 'Autokey',
          gronsfeld: 'Gronsfeld',
        },
      },
    },
    playfair: {
      name: 'Playfair Cipher',
      summary: 'Encrypt letter pairs on a keyed 5×5 square.',
      description:
        'Invented by Charles Wheatstone in 1854 and promoted by Lord Playfair, it was the first practical digraph cipher, used by British forces in the Boer War and World War I. Pairs of letters are swapped around the corners of rectangles on a keyed 5×5 grid (J shares a cell with I).',
      options: {
        key: 'Keyword',
        filler: 'Filler letter',
        group: 'Group in fives',
        stripFiller: 'Remove filler letters',
      },
    },
    scytale: {
      name: 'Scytale',
      summary: 'Wind a strip around a rod; unwind it to scramble.',
      description:
        'The Spartan σκυτάλη is the oldest transposition device on record. A strip of leather was wound edge to edge around a staff and the message written along it; unwound, the letters fall out of order, and only a staff of the same thickness lines them up again. The key is simply the number of letters in one turn.',
      options: { diameter: 'Letters per turn' },
    },
    railfence: {
      name: 'Rail Fence',
      summary: 'Write in a zig-zag, read row by row.',
      description:
        'A transposition cipher: the letters stay the same but change places. The message is written diagonally down and up across several “rails”, then read off one rail at a time. It was used for field messages in the American Civil War.',
      options: { rails: 'Rails', offset: 'Offset' },
    },
    columnar: {
      name: 'Columnar Transposition',
      summary: 'Scramble columns in keyword order.',
      description:
        'The message is written in rows under a keyword and the columns are read out in the alphabetical order of the keyword’s letters. Columnar transposition was the backbone of the German ADFGVX cipher of 1918 and of many Cold War hand ciphers.',
      options: { key: 'Keyword', lettersOnly: 'Letters only' },
    },
    bacon: {
      name: 'Bacon’s Cipher',
      summary: 'Five-symbol binary code — hideable in letter case.',
      description:
        'Francis Bacon (1605) encoded each letter as five A/B symbols. His real insight was steganographic: A and B can be any two distinguishable forms, such as two typefaces. The “letter case” mode hides your message in the capitalisation of an innocent cover text.',
      options: {
        mode: 'Mode',
        variant: 'Alphabet',
        symbolA: 'Symbol A',
        symbolB: 'Symbol B',
        cover: 'Cover text',
      },
      choices: {
        mode: { symbols: 'A/B symbols', case: 'Letter case' },
        variant: { modern: '26 letters', classic: '24 letters (I=J, U=V)' },
      },
    },
    polybius: {
      name: 'Polybius Square',
      summary: 'Letters become grid coordinates.',
      description:
        'Described by the Greek historian Polybius around 150 BC for signalling with torches. Each letter becomes its row and column on a 5×5 grid. With A-D-F-G-X labels it is the first half of the German WWI ADFGX cipher.',
      options: { labels: 'Coordinates', key: 'Keyword' },
      choices: { labels: { digits: '1–5', letters: 'A–E', adfgx: 'ADFGX' } },
    },
    xor: {
      name: 'XOR Cipher',
      summary: 'Repeating-key exclusive-or on UTF-8 bytes.',
      description:
        'XOR is the atom of modern cryptography: with a truly random key as long as the message it is the unbreakable one-time pad; with a short repeating key it is the classic first challenge of every CTF. Output is binary, shown as hex or Base64.',
      options: { key: 'Key', keyFormat: 'Key format', format: 'Output format' },
    },
    enigma: {
      name: 'Enigma Machine',
      summary: 'Simulate the German Enigma I / M3.',
      description:
        'A faithful simulation of the three-rotor Wehrmacht and Kriegsmarine Enigma, with ring settings, plugboard and the double-stepping anomaly of the middle rotor. The machine is reciprocal — the same settings decrypt — and never encrypts a letter to itself, the flaw that let Polish and Bletchley Park codebreakers break it.',
      actions: { encode: 'Type', decode: 'Type' },
      options: {
        reflector: 'Reflector',
        rotor1: 'Left rotor',
        rotor2: 'Middle rotor',
        rotor3: 'Right rotor',
        ring1: 'Left ring',
        ring2: 'Middle ring',
        ring3: 'Right ring',
        pos1: 'Left start',
        pos2: 'Middle start',
        pos3: 'Right start',
        plugboard: 'Plugboard',
        format: 'Other characters',
      },
      choices: { format: { keep: 'Keep', remove: 'Remove', groups: 'Groups of 5' } },
    },
    base64: {
      name: 'Base64',
      summary: 'Binary-to-text encoding used by email and the web.',
      description:
        'Base64 (RFC 4648) represents every 3 bytes as 4 characters from a 64-symbol alphabet, which is how attachments survive email and images fit inside data URLs. The URL-safe variant swaps “+/” for “-_”. Eleet encodes the UTF-8 bytes, so any language and any emoji round-trips.',
      options: { alphabet: 'Alphabet', padding: 'Padding (=)', wrap: 'Line width' },
      choices: { alphabet: { standard: 'Standard', url: 'URL-safe' } },
    },
    base32: {
      name: 'Base32',
      summary: 'Case-insensitive encoding for keys and codes.',
      description:
        'Base32 uses only upper-case letters and digits, so it survives case-insensitive systems and is easy to read aloud. It encodes two-factor (TOTP) secrets and Tor onion addresses. Includes the RFC 4648, “extended hex” and Crockford alphabets.',
      options: { alphabet: 'Alphabet', padding: 'Padding (=)' },
    },
    base58: {
      name: 'Base58',
      summary: 'Bitcoin’s unambiguous alphabet.',
      description:
        'Designed by Satoshi Nakamoto for Bitcoin addresses, Base58 drops the look-alike characters 0, O, I and l as well as + and /, so an address can be copied by hand without mistakes. Flickr and Ripple use their own orderings.',
      options: { alphabet: 'Alphabet' },
    },
    ascii85: {
      name: 'Ascii85',
      summary: 'Compact Base85 encoding from PostScript and PDF.',
      description:
        'Created by Paul E. Rutter for the “btoa” tool and adopted by Adobe for PostScript and PDF, Ascii85 packs 4 bytes into 5 printable characters — 25% overhead instead of Base64’s 33%. Runs of zero bytes compress to a single “z”.',
      options: { delimiters: 'Adobe delimiters <~ ~>' },
    },
    hex: {
      name: 'Hexadecimal',
      summary: 'Base-16, the programmer’s view of bytes.',
      description:
        'Every byte becomes two hexadecimal digits — exactly what a hex editor or packet dump shows. Switch to code points to see the Unicode numbers of each character instead of their UTF-8 bytes.',
    },
    binary: {
      name: 'Binary',
      summary: 'Ones and zeros.',
      description:
        'Each UTF-8 byte written as eight bits — the raw ones and zeros the computer actually stores. A staple of puzzles, CTFs and movie hacker screens.',
    },
    octal: {
      name: 'Octal',
      summary: 'Base-8, as used by Unix permissions and C escapes.',
      description:
        'Base 8 groups bits in threes. It survives today in Unix file permissions (chmod 755) and in C string escapes like \\101.',
    },
    decimal: {
      name: 'Character Codes',
      summary: 'Decimal ASCII / Unicode numbers.',
      description:
        'Every character as its decimal code — the classic ASCII table for Latin letters (A = 65) and the Unicode code point for everything else (€ = 8364).',
    },
    url: {
      name: 'URL Encoding',
      summary: 'Percent-encoding for links and forms.',
      description:
        'Percent-encoding (RFC 3986) turns characters that are unsafe in a URL into %XX byte escapes. “Component” is right for query values, “URI” keeps the structure of a full address, “form” uses + for spaces, and “everything” escapes every single byte.',
      options: { mode: 'Mode' },
      choices: {
        mode: { component: 'Component', uri: 'Full URI', form: 'Form', all: 'Everything' },
      },
    },
    html: {
      name: 'HTML Entities',
      summary: 'Escape text safely for HTML.',
      description:
        'Character references such as &lt; and &#233; let any character appear in HTML without being mistaken for markup. Escaping user input this way is the first line of defence against cross-site scripting (XSS).',
      options: { format: 'Reference style', scope: 'Escape' },
      choices: {
        format: { named: 'Named', decimal: 'Decimal', hex: 'Hex' },
        scope: { special: 'Only < > & " \'', nonAscii: 'Specials + non-ASCII', all: 'Everything' },
      },
    },
    'unicode-escape': {
      name: 'Unicode Escapes',
      summary: '\\uXXXX, \\u{…}, U+XXXX and friends.',
      description:
        'Escape sequences for writing any character in source code: JavaScript \\uXXXX (with surrogate pairs), ES2015 \\u{…}, Python \\U, CSS, the U+XXXX notation of the Unicode standard and C-style UTF-8 byte escapes. Decoding recognises every style at once.',
      options: { format: 'Format', asciiToo: 'Escape ASCII too' },
    },
    punycode: {
      name: 'Punycode',
      summary: 'Internationalised domain names (xn--).',
      description:
        'Punycode (RFC 3492) lets domains in any script travel through the ASCII-only DNS: “münchen.de” becomes “xn--mnchen-3ya.de”. The same mechanism enables IDN homograph attacks, where look-alike letters spoof a trusted domain.',
      options: { mode: 'Mode' },
      choices: { mode: { domain: 'Domain names', raw: 'Raw label' } },
    },
    morse: {
      name: 'Morse Code',
      summary: 'Dots and dashes — with sound and light.',
      description:
        'Samuel Morse and Alfred Vail’s telegraph code (1840s) was standardised internationally in 1865 and carried the world’s news for a century. Eleet supports International and Persian Morse, and can play your message as audio or flashing light at any speed.',
      options: { alphabet: 'Alphabet', dot: 'Dot', dash: 'Dash', wordGap: 'Word gap' },
      choices: { alphabet: { latin: 'International', persian: 'Persian' } },
    },
    nato: {
      name: 'Spelling Alphabets',
      summary: 'Alfa, Bravo, Charlie…',
      description:
        'The NATO/ICAO radiotelephony alphabet (1956) gives every letter an unmistakable code word so that “B” and “D” are never confused over a noisy radio. ICAO style uses the aviation pronunciations of digits (“Tree”, “Niner”); LAPD is the alphabet of American police radio.',
      options: { style: 'Alphabet', letterCase: 'Word case' },
      choices: {
        style: { nato: 'NATO', icao: 'ICAO (Niner)', lapd: 'LAPD' },
        letterCase: { title: 'Title', upper: 'UPPER', lower: 'lower' },
      },
    },
    braille: {
      name: 'Braille',
      summary: 'Six-dot tactile writing.',
      description:
        'Louis Braille published his six-dot system in 1829, adapting a military “night writing” code. Eleet writes uncontracted (Grade 1) English braille using the Unicode Braille Patterns block, with capital and number signs.',
      options: { blankCells: 'Blank braille cells for spaces' },
    },
    tapcode: {
      name: 'Tap Code',
      summary: 'The prisoners’ knock code.',
      description:
        'American prisoners of war in Vietnam’s Hỏa Lò prison communicated through walls by tapping coordinates on a 5×5 grid — row taps, a pause, column taps — with C standing in for K.',
      options: { format: 'Notation' },
      choices: { format: { dots: 'Taps (. ..)', digits: 'Digits (12)' } },
    },
    a1z26: {
      name: 'A1Z26',
      summary: 'Letters as their alphabet position.',
      description:
        'The simplest substitution: A = 1, B = 2 … Z = 26. A favourite of puzzle hunts, escape rooms and alternate-reality games.',
      options: { separator: 'Format' },
    },
    t9: {
      name: 'Phone Keypad',
      summary: 'Multi-tap and T9 predictive text.',
      description:
        'Before smartphones, texts were typed on number keys. Multi-tap presses a key repeatedly (“44 33 555 555 666”); T9 (1995) presses each key once and predicts the word — which Eleet reproduces with its English vocabulary.',
      options: { mode: 'Mode' },
      choices: { mode: { multitap: 'Multi-tap', t9: 'T9 predictive' } },
    },
    fancy: {
      name: 'Fancy Text',
      summary: '𝐁𝐨𝐥𝐝, 𝓼𝓬𝓻𝓲𝓹𝓽, 𝔣𝔯𝔞𝔨𝔱𝔲𝔯, ｗｉｄｅ and 19 more styles.',
      description:
        'These are not fonts but distinct Unicode characters, mostly from the Mathematical Alphanumeric Symbols block, so they survive anywhere plain text goes — bios, usernames, posts. Decoding normalises them back to plain letters, which matters for search and moderation.',
      options: { style: 'Style' },
      choices: {
        style: {
          bold: 'Bold',
          italic: 'Italic',
          boldItalic: 'Bold italic',
          script: 'Script',
          boldScript: 'Bold script',
          fraktur: 'Fraktur',
          boldFraktur: 'Bold fraktur',
          doubleStruck: 'Double-struck',
          sans: 'Sans-serif',
          sansBold: 'Sans bold',
          sansItalic: 'Sans italic',
          sansBoldItalic: 'Sans bold italic',
          monospace: 'Monospace',
          fullwidth: 'Full-width',
          smallCaps: 'Small caps',
          circled: 'Circled',
          negativeCircled: 'Negative circled',
          squared: 'Squared',
          negativeSquared: 'Negative squared',
          parenthesized: 'Parenthesised',
          superscript: 'Superscript',
          subscript: 'Subscript',
          regional: 'Regional indicators',
        },
      },
    },
    flip: {
      name: 'Upside-Down Text',
      summary: 'ɹǝʌo ʇı dılɟ',
      description:
        'Each character is replaced by a look-alike that appears rotated 180°, and the text is reversed so it reads correctly when you turn your screen over. A classic of early-2000s forums and MSN nicknames.',
    },
    mirror: {
      name: 'Mirror Text',
      summary: 'Reflect text like Leonardo’s notebooks.',
      description:
        'Leonardo da Vinci filled his notebooks with mirror writing. This tool reverses the text and swaps each character for a horizontally reflected look-alike where Unicode has one.',
    },
    zalgo: {
      name: 'Zalgo Text',
      summary: 'Summon glitchy, cursed text.',
      description:
        'Zalgo stacks dozens of combining diacritical marks above, through and below each letter until the text seems to bleed off the line. Born in a 2004 internet horror meme, it is also a handy stress test for text renderers. Decoding strips the marks again.',
      options: { intensity: 'Intensity', up: 'Above', middle: 'Through', down: 'Below' },
    },
    decorations: {
      name: 'Text Decorations',
      summary: 'S̶t̶r̶i̶k̶e̶, u̲n̲d̲e̲r̲l̲i̲n̲e̲ and more in plain text.',
      description:
        'Strike-through, underline, overline, slashes and enclosing shapes made purely from combining characters, so the styling survives in places that do not support formatting.',
      options: { style: 'Decoration', spaces: 'Decorate spaces too' },
      choices: {
        style: {
          strike: 'Strike-through',
          slash: 'Slashed',
          underline: 'Underline',
          doubleUnderline: 'Double underline',
          overline: 'Overline',
          tilde: 'Tilde overlay',
          crossAbove: 'Crosses above',
          dotsBelow: 'Dots below',
          circle: 'Enclosing circle',
          square: 'Enclosing square',
          keycap: 'Keycap',
        },
      },
    },
    case: {
      name: 'Case Converter',
      summary: 'UPPER, Title, camelCase, snake_case, sPoNgEbOb…',
      description:
        'From typographic conventions (Title Case, Sentence case) to programming identifiers (camelCase, snake_case, kebab-case) to internet mockery (aLtErNaTiNg). Word splitting understands existing identifiers like “parseHTTPResponse”.',
      options: { style: 'Style' },
      choices: {
        style: {
          upper: 'UPPER CASE',
          lower: 'lower case',
          title: 'Title Case',
          sentence: 'Sentence case',
          camel: 'camelCase',
          pascal: 'PascalCase',
          snake: 'snake_case',
          kebab: 'kebab-case',
          constant: 'CONSTANT_CASE',
          dot: 'dot.case',
          train: 'Train-Case',
          inverse: 'iNVERSE cASE',
          alternating: 'aLtErNaTiNg',
          random: 'RaNDoM',
        },
      },
    },
    reverse: {
      name: 'Reverse Text',
      summary: 'Backwards by character, word, letter or line.',
      description:
        'Reverses text at four levels. It works on grapheme clusters, so emoji sequences, flags and accented letters stay intact instead of breaking into invisible fragments.',
      options: { mode: 'Reverse' },
      choices: {
        mode: {
          text: 'Whole text',
          words: 'Word order',
          letters: 'Each word',
          lines: 'Line order',
        },
      },
    },
    piglatin: {
      name: 'Pig Latin',
      summary: 'Igpay Atinlay, the language game.',
      description:
        'Move the opening consonants to the end and add “ay”: “pig” becomes “igpay”; words starting with a vowel just add “way”. Decoding is ambiguous, so Eleet tries every split and lets its English vocabulary choose.',
      options: { suffix: 'Vowel suffix' },
    },
    uwu: {
      name: 'UwU Speak',
      summary: 'Hewwo! OwO what’s this?',
      description:
        'The cute register of furry and anime internet culture: r and l become w, “na” becomes “nya”, words stutter and emoticons appear. Seeded, so the same text always gets the same result.',
      options: { stutter: 'Stutter', faces: 'Faces' },
    },
    'zero-width': {
      name: 'Invisible Ink',
      summary: 'Hide secrets in zero-width characters.',
      description:
        'Hides a message inside ordinary text using characters that take up no space: zero-width joiners and spaces, or the Unicode Tags block — the “ASCII smuggling” trick used in 2024 to slip hidden instructions past human reviewers. Paste suspicious text in Reveal mode to expose it.',
      actions: { encode: 'Hide', decode: 'Reveal' },
      options: { scheme: 'Scheme', cover: 'Cover text', position: 'Placement' },
      choices: {
        scheme: { zeroWidth: 'Zero-width', tags: 'Unicode Tags' },
        position: { afterFirstWord: 'After first word', start: 'Start', end: 'End' },
      },
    },
    homoglyph: {
      name: 'Homoglyphs',
      summary: 'Look-alike letters from other scripts.',
      description:
        'The Cyrillic “а” and Latin “a” are pixel-identical but different characters. Homoglyphs power IDN phishing (раураl.com), filter evasion and invisible text fingerprinting. Decoding folds every known look-alike back to plain ASCII.',
      actions: { encode: 'Disguise', decode: 'Normalise' },
      options: { density: 'Density' },
    },
    hash: {
      name: 'Hash Functions',
      summary: 'MD5, SHA-1/2/3, Keccak-256, CRC-32.',
      description:
        'A hash function turns any input into a fixed-size fingerprint; change one bit and the digest changes completely. Hashes verify downloads, address content in Git and — slowed down and salted — protect stored passwords. MD5 and SHA-1 are broken for security use.',
      actions: { encode: 'Hash', decode: 'Hash' },
      options: { algorithm: 'Algorithm', format: 'Output' },
    },
    hmac: {
      name: 'HMAC',
      summary: 'Keyed hash for authenticity.',
      description:
        'HMAC (RFC 2104) mixes a secret key into a hash so that only someone holding the key can produce a valid tag. It signs API requests, JSON Web Tokens (HS256) and cookies. The key never leaves your browser and is never saved or shared.',
      actions: { encode: 'Sign', decode: 'Sign' },
      options: { algorithm: 'Algorithm', key: 'Secret key', format: 'Output' },
    },
    aes: {
      name: 'AES Encryption',
      summary: 'Password-protect text with AES-256-GCM.',
      description:
        'Real, modern encryption: AES-256 in authenticated GCM mode, with the key derived from your password by PBKDF2-SHA-256 at 600,000 iterations. Each message gets a fresh random salt and nonce, and any tampering is detected. Your password is never stored.',
      actions: { encode: 'Encrypt', decode: 'Decrypt' },
      options: { password: 'Password', iterations: 'PBKDF2 iterations' },
    },
    finglish: {
      name: 'Finglish',
      summary: 'Persian ⇄ Latin letters (Pinglish).',
      description:
        'Finglish is Persian written with Latin letters, the way a generation of Iranians texted before phones had Persian keyboards — leet’s cultural cousin, borrowing digits for sounds Latin lacks (3 = ع, 7 = ح). Eleet restores unwritten short vowels and knows the spelling of everyday words.',
      actions: { encode: 'To Finglish', decode: 'To Persian' },
      options: {
        longA: 'Long “ā”',
        arabizi: 'Arabizi digits (3, 7, 2)',
        guessVowels: 'Restore short vowels',
      },
    },
    abjad: {
      name: 'Abjad Numerals',
      summary: 'The numeric value of Persian letters.',
      description:
        'In the abjad system every letter has a number (ا = 1, ب = 2 … غ = 1000). Persian poets hid dates in verse this way — a chronogram (ماده تاریخ) whose letters add up to the year it commemorates. Decode spells a number in abjad letters.',
      actions: { encode: 'Text → number', decode: 'Number → letters' },
      options: { breakdown: 'Show' },
      choices: { breakdown: { total: 'Total', words: 'Per word', letters: 'Per letter' } },
    },
    digits: {
      name: 'Digit Converter',
      summary: '0123 ⇄ ۰۱۲۳ ⇄ ٠١٢٣',
      description:
        'Western, Persian and Eastern Arabic digits look alike but are different characters — a common cause of failed form validation and search. Convert every digit to one system, optionally with the matching decimal separator.',
      actions: { encode: 'Convert', decode: 'Convert' },
      options: { target: 'Convert to', separators: 'Convert decimal separators' },
      choices: { target: { persian: 'Persian ۱۲۳', arabic: 'Arabic ١٢٣', latin: 'Latin 123' } },
    },
    keyboard: {
      name: 'Keyboard Fixer',
      summary: 'Typed “sghl” instead of «سلام»? Fix it.',
      description:
        'Everyone who types Persian has sent a message with the wrong keyboard layout active. This maps between US QWERTY and the Iranian standard layout (ISIRI 9147) in both directions, shift layer included.',
      actions: { encode: 'EN → FA', decode: 'FA → EN' },
    },
    magic: {
      name: 'Magic Decoder',
      summary: 'Automatically peel unknown layers of encoding.',
      description:
        'Paste anything — Base64 inside hex, ROT13, Morse, leet — and Magic searches through dozens of decoders several layers deep, ranking every result by how much it looks like real language. Inspired by CyberChef’s Magic operation.',
      actions: { encode: 'Analyse', decode: 'Analyse' },
      options: { depth: 'Search depth', beam: 'Beam width' },
    },
    crack: {
      name: 'Cipher Cracker',
      summary: 'Break classical ciphers without the key.',
      description:
        'Automated ciphertext-only attacks: exhaustive search for Caesar, Atbash, affine and rail fence; Friedman’s index of coincidence plus chi-squared analysis to recover Vigenère and Beaufort keys; and permutation search for short columnar keys. Results are ranked by English quadgram fitness.',
      actions: { encode: 'Crack', decode: 'Crack' },
      options: { cipher: 'Cipher', maxKeyLength: 'Max key length' },
      choices: {
        cipher: {
          auto: 'Try everything',
          caesar: 'Caesar',
          affine: 'Affine',
          atbash: 'Atbash',
          vigenere: 'Vigenère',
          beaufort: 'Beaufort',
          railfence: 'Rail fence',
          columnar: 'Columnar',
        },
      },
    },
    frequency: {
      name: 'Frequency Analysis',
      summary: 'Letter statistics, IoC and cipher fingerprinting.',
      description:
        'The oldest code-breaking technique, first described by al-Kindi in 9th-century Baghdad: count the letters and compare them with the language. The index of coincidence and n-gram statistics then tell plaintext, substitution, transposition and polyalphabetic ciphers apart.',
      actions: { encode: 'Analyse', decode: 'Analyse' },
      options: { maxKeyLength: 'Max period' },
    },
    inspector: {
      name: 'Unicode Inspector',
      summary: 'X-ray text for hidden and deceptive characters.',
      description:
        'Reveals everything the eye cannot see: zero-width characters, bidirectional overrides (the “Trojan Source” attack, CVE-2021-42574), Unicode tag smuggling, look-alike letters from other scripts and stacked combining marks — with code points and UTF-8 bytes for every character.',
      actions: { encode: 'Inspect', decode: 'Inspect' },
    },
    pipeline: {
      name: 'Pipeline',
      summary: 'Chain tools into a recipe.',
      description:
        'Combine any tools into a recipe: the output of each step feeds the next. Build layered puzzles (leet → Base64 → reverse), reproduce multi-step encodings, and share the whole recipe as a link.',
    },
  },
  views: {
    scytale: {
      title: 'The rod',
      onRod: 'On the rod — written along it, one row per face',
      offRod: 'Off the rod — the strip as the messenger carries it',
      turn: 'Turn {n}',
      hint: 'Every column is one turn of the strip. Point at a turn to follow it from rod to strip.',
      turns: '{n} turn|{n} turns',
      empty: 'Type a message to wind it around the rod.',
    },
    leetStudio: {
      title: 'Glyph matrix',
      hint: 'Click a letter to choose which glyphs it may become. Editing switches the intensity to Custom.',
      edit: 'Edit glyphs for {letter}',
      add: 'Add glyph',
      addPlaceholder: 'e.g. |-|',
      remove: 'Remove {glyph}',
      none: 'unchanged',
      resetFrom: 'Reset to {preset}',
      preview: 'Alphabet preview',
    },
    caesar: {
      title: 'All 25 shifts',
      hint: 'Ranked by χ² distance from English letter frequencies — the most readable candidate comes first.',
      use: 'Use shift {n}',
    },
    enigma: {
      machine: 'Machine settings',
      rotors: 'Rotors',
      rings: 'Ring settings (Ringstellung)',
      start: 'Start positions (Grundstellung)',
      plugboard: 'Plugboard (Steckerbrett)',
      windows: 'Rotor windows after typing',
      reflector: 'Reflector',
      lampboard: 'Lampboard',
      reciprocal:
        'Enigma is reciprocal: paste the ciphertext with the same settings to decrypt it.',
      random: 'Random settings',
      left: 'Left',
      middle: 'Middle',
      right: 'Right',
    },
    morse: {
      title: 'Transmitter',
      play: 'Play',
      stop: 'Stop',
      wpm: 'Speed',
      farnsworth: 'Spacing (Farnsworth)',
      tone: 'Tone',
      volume: 'Volume',
      light: 'Signal lamp',
      download: 'Download WAV',
      unit: '{n} WPM',
    },
    gallery: {
      title: 'All styles',
      hint: 'Click any style to copy it.',
      copy: 'Copy {style}',
    },
    hash: {
      title: 'All digests',
      broken: 'broken',
      bits: '{n} bits',
    },
    analysis: {
      running: 'Analysing…',
      empty: 'Paste some text to analyse.',
      noCandidates: 'Nothing convincing found.',
      open: 'Open in {tool}',
      score: 'Confidence',
      steps: 'Steps',
      explored: '{n} decoding explored|{n} decodings explored',
      tried: '{n} key tried|{n} keys tried',
      inputScore: 'Input already looks like natural language ({score}).',
      key: 'Key',
    },
    frequency: {
      letters: 'Letter frequencies',
      observed: 'This text',
      expected: 'English',
      totalLetters: 'Letters',
      ioc: 'Index of coincidence',
      chi: 'χ² vs English',
      entropy: 'Entropy',
      fitness: 'Quadgram fitness',
      bigrams: 'Top bigrams',
      trigrams: 'Top trigrams',
      characters: 'Most frequent characters',
      keyLengths: 'Likely Vigenère key lengths',
      bitsPerChar: '{n} bits/char',
      verdictTitle: 'Verdict',
      verdict: {
        empty: 'Nothing to analyse yet.',
        short: 'Too little text for reliable statistics — try at least a couple of sentences.',
        nonLatin: 'Mostly non-Latin text; English letter statistics do not apply.',
        english: 'Reads like English plaintext.',
        transposition:
          'English letter frequencies but scrambled order — likely a transposition cipher (rail fence, columnar).',
        monoalphabetic:
          'IoC matches English but letters are substituted — likely a monoalphabetic cipher (Caesar, Atbash, affine, simple substitution).',
        polyalphabetic:
          'Flattened letter frequencies — likely a polyalphabetic cipher such as Vigenère. See the key-length estimate below.',
        random: 'Near-uniform letters — random data, a long-key cipher or modern encryption.',
      },
    },
    inspector: {
      stats: 'Statistics',
      graphemes: 'Graphemes',
      codePoints: 'Code points',
      utf16: 'UTF-16 units',
      utf8: 'UTF-8 bytes',
      words: 'Words',
      lines: 'Lines',
      unique: 'Unique characters',
      entropy: 'Entropy',
      scripts: 'Scripts',
      findings: 'Findings',
      clean: 'No hidden or deceptive characters found.',
      characters: 'Characters',
      truncated: 'Showing the first {n} characters.',
      mixedScript: 'Words mixing scripts (possible homograph spoofing)',
      onlySuspicious: 'Only suspicious characters',
      flags: {
        invisible: 'Invisible',
        bidi: 'Bidi control',
        tag: 'Tag character',
        confusable: 'Look-alike',
        combining: 'Combining mark',
        control: 'Control',
        privateUse: 'Private use',
        variation: 'Variation selector',
        whitespace: 'Unusual space',
      },
      flagHelp: {
        invisible:
          'Takes up no space. ZWNJ is normal in Persian and ZWJ in emoji; anything else may hide data.',
        bidi: 'Reorders text visually — the “Trojan Source” attack hides malicious code this way.',
        tag: 'Invisible Unicode tag — can smuggle hidden ASCII instructions.',
        confusable: 'Looks identical to a Latin letter — typical of phishing domains.',
        combining: 'Attaches to the previous character (accents, Zalgo).',
        control: 'Non-printing control character.',
        privateUse: 'Private-use code point with no standard meaning.',
        variation: 'Selects an alternate glyph (text vs emoji presentation).',
        whitespace: 'A space character other than the normal space.',
      },
      lookalikeOf: 'looks like “{letter}”',
      category: 'Category',
      script: 'Script',
      bytes: 'UTF-8',
    },
    pipeline: {
      steps: 'Recipe',
      add: 'Add step',
      addPlaceholder: 'Search a tool to add…',
      empty: 'Your recipe is empty. Add a step to start chaining transforms.',
      remove: 'Remove step',
      moveUp: 'Move up',
      moveDown: 'Move down',
      enable: 'Enable step',
      disable: 'Disable step',
      step: 'Step {n}',
      final: 'Final output',
      clear: 'Clear recipe',
      skipped: 'Skipped',
      examples: 'Example recipes',
      example1: 'Leet → Base64 → Reverse',
      example2: 'Decode: hex → Base64 → ROT13',
      example3: 'Morse → Binary',
    },
  },
};

type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };

/** The shape every catalog must match. */
export type Messages = Widen<typeof en>;
