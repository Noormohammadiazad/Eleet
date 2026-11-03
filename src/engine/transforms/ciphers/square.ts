/** Keyed 5×5 Polybius square shared by Playfair and Polybius (J folds into I). */
export function keyedSquare(key: string, omit = 'J'): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const letters = (key.toUpperCase() + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ').replace(/[^A-Z]/g, '');
  for (let ch of letters) {
    if (ch === omit) ch = omit === 'J' ? 'I' : 'C';
    if (!seen.has(ch)) {
      seen.add(ch);
      out.push(ch);
    }
  }
  return out;
}
