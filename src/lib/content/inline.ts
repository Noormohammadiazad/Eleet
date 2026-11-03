/** A run of text, optionally emphasised. */
export interface Segment {
  readonly text: string;
  readonly em: boolean;
}

/**
 * Splits `*emphasis*` markers into segments. This is the only markup dossiers
 * use, and parsing it into data keeps every word rendered as plain text.
 */
export function inline(source: string): Segment[] {
  return source
    .split(/(\*[^*\n]+\*)/)
    .filter(Boolean)
    .map((part) =>
      part.length > 2 && part.startsWith('*') && part.endsWith('*')
        ? { text: part.slice(1, -1), em: true }
        : { text: part, em: false },
    );
}
