/** Single-pass, allocation-free text statistics for editor footers (fast even on megabytes). */
export interface TextStats {
  readonly chars: number;
  readonly bytes: number;
  readonly lines: number;
}

export function textStats(text: string): TextStats {
  let chars = 0;
  let bytes = 0;
  let lines = text ? 1 : 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    chars++;
    if (c < 0x80) {
      bytes += 1;
      if (c === 10) lines++;
    } else if (c < 0x800) bytes += 2;
    else if (c >= 0xd800 && c <= 0xdbff && i + 1 < text.length) {
      const next = text.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        bytes += 4;
        i++;
        continue;
      }
      bytes += 3;
    } else bytes += 3;
  }
  return { chars, bytes, lines };
}
