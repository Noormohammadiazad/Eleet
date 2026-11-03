/**
 * Core type system of the Eleet transformation engine.
 *
 * The engine is deliberately framework-agnostic: nothing in `src/engine` knows
 * about Svelte, the DOM or i18n. Tools are described *declaratively* — an id, a
 * category and a typed option schema — plus pure functions that do the work.
 * The UI renders option controls straight from the schema, the Web Worker runs
 * the functions, and the test-suite exercises them in plain Node.
 */

/** Which way a reversible transform is being applied. */
export type Direction = 'encode' | 'decode';

/**
 * Navigation groups, in display order. Labels live in the i18n catalogs.
 *
 * The taxonomy follows *what a tool does to the text*, the way a historian of
 * cryptography would file it, rather than where it came from: leet speak is a
 * substitution system (glyph for letter) and sits with Caesar and Enigma;
 * the scytale and the rail fence move letters without changing them; Bacon's
 * biliteral alphabet and zero-width characters hide that a message exists.
 */
export const CATEGORY_IDS = [
  'substitution',
  'transposition',
  'steganography',
  'signals',
  'encodings',
  'cryptography',
  'analysis',
  'typography',
  'persian',
  'workshop',
] as const;
export type CategoryId = (typeof CATEGORY_IDS)[number];

/* ------------------------------------------------------------------------ */
/* Option schema                                                            */
/* ------------------------------------------------------------------------ */

/** Values that can be stored, persisted and shared in a URL. */
export type OptionValue = string | number | boolean | Record<string, string[]>;
export type OptionValues = Record<string, OptionValue>;

interface OptionBase<K extends string> {
  /** Stable key; also the i18n key suffix (`tools.<id>.options.<key>`). */
  readonly key: K;
  /** Restrict the control to one direction (e.g. a "cover text" only matters when encoding). */
  readonly directions?: readonly Direction[];
  /** Conditional visibility, evaluated against the current option values. */
  readonly when?: (values: OptionValues) => boolean;
}

export interface BooleanOption<K extends string = string> extends OptionBase<K> {
  readonly type: 'boolean';
  readonly default: boolean;
}

export interface NumberOption<K extends string = string> extends OptionBase<K> {
  readonly type: 'number';
  readonly default: number;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  /** `slider` renders a range input; `stepper` a compact numeric field. */
  readonly control?: 'slider' | 'stepper';
  /** Display suffix, e.g. `%` or `Hz`. Purely cosmetic. */
  readonly unit?: string;
  /** Show a "roll the dice" button that picks a random value (used for PRNG seeds). */
  readonly randomizable?: boolean;
}

export interface Choice<V extends string = string> {
  readonly value: V;
  /**
   * Literal, language-neutral label (e.g. "Base64", "Rotor III"). When omitted,
   * the UI looks up `tools.<id>.choices.<optionKey>.<value>` in the catalog.
   */
  readonly label?: string;
}

export interface SelectOption<
  K extends string = string,
  V extends string = string,
> extends OptionBase<K> {
  readonly type: 'select';
  readonly default: V;
  readonly choices: readonly Choice<V>[];
  /** `segmented` for 2–4 short choices, `dropdown` otherwise. */
  readonly control?: 'segmented' | 'dropdown';
}

export interface TextOption<K extends string = string> extends OptionBase<K> {
  readonly type: 'text';
  readonly default: string;
  readonly multiline?: boolean;
  readonly monospace?: boolean;
  readonly maxLength?: number;
  /**
   * Secret options (passwords, HMAC keys) are masked in the UI and are NEVER
   * persisted to storage nor embedded in share links.
   */
  readonly secret?: boolean;
}

/** Structured value edited by a bespoke UI (e.g. the Leet Studio glyph matrix). */
export interface JsonOption<
  K extends string = string,
  T extends OptionValue = OptionValue,
> extends OptionBase<K> {
  readonly type: 'json';
  readonly default: T;
}

export type OptionSpec = BooleanOption | NumberOption | SelectOption | TextOption | JsonOption;

/** Maps a single option spec to the TypeScript type of its value. */
export type OptionValueOf<S> = S extends BooleanOption
  ? boolean
  : S extends NumberOption
    ? number
    : S extends SelectOption<string, infer V>
      ? V
      : S extends TextOption
        ? string
        : S extends JsonOption<string, infer T>
          ? T
          : never;

/** Derives the typed options object from a schema tuple. */
export type InferOptions<S extends readonly OptionSpec[]> = {
  [Spec in S[number] as Spec['key']]: OptionValueOf<Spec>;
};

/* ------------------------------------------------------------------------ */
/* Tools                                                                    */
/* ------------------------------------------------------------------------ */

/** Per-invocation context handed to every tool function. */
export interface RunContext {
  /** Aborted when a newer request supersedes this one. Long loops should check it. */
  readonly signal?: AbortSignal;
}

interface ToolBase<S extends readonly OptionSpec[]> {
  /** Kebab-case identifier; used in URLs, storage keys and i18n keys. */
  readonly id: string;
  readonly category: CategoryId;
  readonly options: S;
  /** Extra search terms (language-neutral: names, acronyms, synonyms). */
  readonly keywords?: readonly string[];
  /** Example input loaded by the "Try an example" action. */
  readonly sample?: Partial<Record<Direction, string>>;
}

export type Awaitable<T> = T | Promise<T>;

/**
 * A text-to-text transformation, optionally reversible.
 * Every transform can be used standalone or as a step in a pipeline.
 */
export interface TransformDef<
  S extends readonly OptionSpec[] = readonly OptionSpec[],
> extends ToolBase<S> {
  readonly kind: 'transform';
  encode(input: string, options: InferOptions<S>, ctx: RunContext): Awaitable<string>;
  decode?(input: string, options: InferOptions<S>, ctx: RunContext): Awaitable<string>;
  /** True when encode and decode are the same operation (ROT13, Atbash, Enigma…). */
  readonly involution?: boolean;
  /**
   * Heuristic likelihood (0–1) that `input` is *encoded* with this transform.
   * Used by the Magic auto-detector to prune its search tree.
   */
  detect?(input: string): number;
}

/** A tool that inspects text and produces a structured, serialisable report. */
export interface AnalyzerDef<
  S extends readonly OptionSpec[] = readonly OptionSpec[],
  R = unknown,
> extends ToolBase<S> {
  readonly kind: 'analyzer';
  analyze(input: string, options: InferOptions<S>, ctx: RunContext): Awaitable<R>;
}

/** A tool implemented entirely in the UI layer (e.g. the pipeline builder). */
export interface WorkspaceDef extends ToolBase<readonly []> {
  readonly kind: 'workspace';
}

export type AnyTransform = TransformDef<readonly OptionSpec[]>;
export type AnyAnalyzer = AnalyzerDef<readonly OptionSpec[], unknown>;
export type AnyTool = AnyTransform | AnyAnalyzer | WorkspaceDef;

/** Identity helpers that preserve literal option types for inference. */
export function defineTransform<const S extends readonly OptionSpec[]>(
  def: TransformDef<S>,
): TransformDef<S> {
  return def;
}

export function defineAnalyzer<const S extends readonly OptionSpec[], R>(
  def: AnalyzerDef<S, R>,
): AnalyzerDef<S, R> {
  return def;
}
