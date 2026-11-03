/** Keypad helpers for the T9 predictive decoder. */

const DIGIT: Record<string, string> = {};
['abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz'].forEach((letters, i) => {
  for (const ch of letters) DIGIT[ch] = String(i + 2);
});

export function keypadDigit(ch: string): string {
  return DIGIT[ch] ?? '';
}

let index: Promise<Map<string, string[]>> | null = null;

/** Lazily builds a map from key sequence ("4663") to vocabulary words ("good", "home"…). */
export function keypadIndex(): Promise<Map<string, string[]>> {
  index ??= import('../../analysis/data/english-model').then((data) => {
    const map = new Map<string, string[]>();
    for (const word of data.VOCABULARY.split(' ')) {
      if (!/^[a-z]+$/.test(word)) continue;
      const key = [...word].map(keypadDigit).join('');
      const list = map.get(key);
      if (list) list.push(word);
      else map.set(key, [word]);
    }
    return map;
  });
  return index;
}
