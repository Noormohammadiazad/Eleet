/**
 * Content model for the historical dossiers.
 *
 * Dossiers are plain data — no markup strings — so they can be translated,
 * type-checked and rendered without `{@html}`. Inline emphasis is written as
 * `*italic*` and parsed into text segments by `$lib/content/inline`.
 */
import type { Direction, OptionValues } from '$engine/core/types';
import type { ArchiveId } from './archive-media';

export interface Localized<T = string> {
  readonly en: T;
  readonly fa: T;
}

/** Diagrams drawn for Eleet (theme-aware SVG components). */
export type DiagramId = 'scytale' | 'caesar' | 'polybius' | 'playfair' | 'morse' | 'leet';

export type Figure =
  | { readonly image: ArchiveId; readonly caption: Localized }
  | { readonly diagram: DiagramId; readonly caption: Localized };

export interface Dispatch {
  readonly date: Localized;
  readonly title: Localized;
  readonly body: Localized;
  /** The wording of the original, shown verbatim. */
  readonly quote?: string;
  /** A reconstruction for demonstration, not a surviving historical text. */
  readonly illustrative?: boolean;
  /** Loads the tool's workbench with this input, direction and options. */
  readonly load?: {
    readonly direction: Direction;
    readonly input: string;
    readonly options?: OptionValues;
  };
}

export interface Reading {
  readonly author: string;
  readonly title: string;
  readonly year: number;
}

export interface Dossier {
  readonly headline: Localized;
  /** The standfirst: one or two sentences under the headline. */
  readonly dek: Localized;
  readonly body: Localized<readonly string[]>;
  readonly figures: readonly Figure[];
  readonly dispatches: readonly Dispatch[];
  readonly reading?: readonly Reading[];
}
