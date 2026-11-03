/**
 * Ergonomic builders for option schemas.
 *
 * Builders keep tool definitions short and — more importantly — preserve
 * literal types, so `InferOptions` can give every `encode`/`decode`
 * implementation a precisely typed options object:
 *
 * ```ts
 * options: [opt.number('shift', 3, { min: 1, max: 25 }), opt.select('mode', ['a', 'b'], 'a')]
 * // encode(input, o) → o: { shift: number; mode: 'a' | 'b' }
 * ```
 */
import type {
  BooleanOption,
  Choice,
  JsonOption,
  NumberOption,
  OptionSpec,
  OptionValue,
  OptionValues,
  SelectOption,
  TextOption,
} from './types';

type Extra<T> = Omit<Partial<T>, 'type' | 'key' | 'default'>;

export const opt = {
  boolean<const K extends string>(
    key: K,
    defaultValue: boolean,
    extra: Extra<BooleanOption<K>> = {},
  ): BooleanOption<K> {
    return { type: 'boolean', key, default: defaultValue, ...extra };
  },

  number<const K extends string>(
    key: K,
    defaultValue: number,
    extra: Extra<NumberOption<K>> & { min: number; max: number },
  ): NumberOption<K> {
    return { type: 'number', key, default: defaultValue, ...extra };
  },

  /** Seeds drive the deterministic PRNG so "random" output is reproducible and shareable. */
  seed(extra: Extra<NumberOption<'seed'>> = {}): NumberOption<'seed'> {
    return {
      type: 'number',
      key: 'seed',
      default: 1337,
      min: 0,
      max: 999_999,
      step: 1,
      control: 'stepper',
      randomizable: true,
      ...extra,
    };
  },

  select<const K extends string, const V extends string>(
    key: K,
    choices: readonly (V | Choice<V>)[],
    defaultValue: NoInfer<V>,
    extra: Extra<SelectOption<K, V>> = {},
  ): SelectOption<K, V> {
    return {
      type: 'select',
      key,
      default: defaultValue,
      choices: choices.map((c) => (typeof c === 'string' ? { value: c } : c)),
      ...extra,
    };
  },

  text<const K extends string>(
    key: K,
    defaultValue: string,
    extra: Extra<TextOption<K>> = {},
  ): TextOption<K> {
    return { type: 'text', key, default: defaultValue, ...extra };
  },

  json<const K extends string, T extends OptionValue>(
    key: K,
    defaultValue: T,
    extra: Extra<JsonOption<K, T>> = {},
  ): JsonOption<K, T> {
    return { type: 'json', key, default: defaultValue, ...extra };
  },
};

/** Builds the default option values of a schema. */
export function defaultOptions(specs: readonly OptionSpec[]): OptionValues {
  const values: OptionValues = {};
  for (const spec of specs) values[spec.key] = structuredCloneValue(spec.default);
  return values;
}

/**
 * Merges untrusted values (from storage or a share link) over the defaults,
 * validating every field against its spec. Unknown keys are dropped and
 * out-of-range numbers are clamped, so a malformed URL can never crash a tool.
 */
export function sanitizeOptions(
  specs: readonly OptionSpec[],
  input: unknown,
  { includeSecrets = true }: { includeSecrets?: boolean } = {},
): OptionValues {
  const source = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const out = defaultOptions(specs);
  for (const spec of specs) {
    const raw = source[spec.key];
    if (raw === undefined) continue;
    if (spec.type === 'text' && spec.secret && !includeSecrets) continue;
    switch (spec.type) {
      case 'boolean':
        if (typeof raw === 'boolean') out[spec.key] = raw;
        break;
      case 'number': {
        const n = typeof raw === 'number' ? raw : Number(raw);
        if (Number.isFinite(n)) out[spec.key] = Math.min(spec.max, Math.max(spec.min, n));
        break;
      }
      case 'select':
        if (typeof raw === 'string' && spec.choices.some((c) => c.value === raw)) {
          out[spec.key] = raw;
        }
        break;
      case 'text':
        if (typeof raw === 'string') {
          out[spec.key] = spec.maxLength ? raw.slice(0, spec.maxLength) : raw;
        }
        break;
      case 'json':
        if (isGlyphMap(raw)) out[spec.key] = raw;
        break;
    }
  }
  return out;
}

/** Returns only the values that differ from the defaults (keeps share links short). */
export function diffFromDefaults(
  specs: readonly OptionSpec[],
  values: OptionValues,
  { includeSecrets = false }: { includeSecrets?: boolean } = {},
): OptionValues {
  const out: OptionValues = {};
  for (const spec of specs) {
    if (spec.type === 'text' && spec.secret && !includeSecrets) continue;
    const value = values[spec.key];
    if (value === undefined) continue;
    if (JSON.stringify(value) !== JSON.stringify(spec.default)) out[spec.key] = value;
  }
  return out;
}

/** Whether an option should be shown for the given direction and values. */
export function isOptionVisible(
  spec: OptionSpec,
  direction: 'encode' | 'decode',
  values: OptionValues,
): boolean {
  if (spec.directions && !spec.directions.includes(direction)) return false;
  return spec.when ? spec.when(values) : true;
}

function isGlyphMap(value: unknown): value is Record<string, string[]> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value).every(
    (v) => Array.isArray(v) && v.every((g) => typeof g === 'string' && g.length <= 16),
  );
}

function structuredCloneValue<T extends OptionValue>(value: T): T {
  return typeof value === 'object' ? (JSON.parse(JSON.stringify(value)) as T) : value;
}
