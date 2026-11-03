/**
 * Reactive internationalisation runtime.
 *
 * `i18n.locale` is Svelte 5 `$state`, so every template expression that calls
 * `t()` re-renders automatically when the language changes — no stores, no
 * subscriptions, no page reload. Both catalogs ship in the main bundle (they
 * compress to a few kilobytes), which keeps language switching instantaneous
 * and fully offline.
 */
import { en, type Messages } from './en';
import { fa } from './fa';

export type Locale = 'en' | 'fa';

export interface LocaleInfo {
  readonly dir: 'ltr' | 'rtl';
  /** BCP 47 tag used for `Intl` formatting. */
  readonly intl: string;
  readonly catalog: Messages;
}

export const LOCALES: Readonly<Record<Locale, LocaleInfo>> = {
  en: { dir: 'ltr', intl: 'en-US', catalog: en },
  fa: { dir: 'rtl', intl: 'fa-IR', catalog: fa },
};

export const isLocale = (value: unknown): value is Locale => value === 'en' || value === 'fa';

/** Dotted paths to every leaf string of the catalog, e.g. `"workbench.copy"`. */
type Paths<T, P extends string = ''> = T extends string
  ? P
  : { [K in keyof T & string]: Paths<T[K], P extends '' ? K : `${P}.${K}`> }[keyof T & string];
export type MessageKey = Paths<Messages>;

export type Params = Readonly<Record<string, string | number>>;

function lookup(catalog: unknown, key: string): string | undefined {
  let node: unknown = catalog;
  for (const part of key.split('.')) {
    if (node === null || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

class I18n {
  locale = $state<Locale>('en');

  get info(): LocaleInfo {
    return LOCALES[this.locale];
  }

  get dir(): 'ltr' | 'rtl' {
    return LOCALES[this.locale].dir;
  }

  /** Formats a number with the locale's digits (Persian digits in `fa`). */
  number = (value: number, options?: Intl.NumberFormatOptions): string =>
    new Intl.NumberFormat(this.info.intl, options).format(value);

  /** True when `key` resolves in the active catalog. */
  has = (key: string): boolean => lookup(this.info.catalog, key) !== undefined;

  /** Translates a statically known key. */
  t = (key: MessageKey, params?: Params): string => this.tr(key, params);

  /**
   * Translates a dynamically built key (e.g. `tools.${id}.name`). Falls back to
   * English, then to the key itself, so a missing string is visible but never fatal.
   * Templates may hold two plural forms separated by "|" (selected by `params.n`).
   */
  tr = (key: string, params?: Params): string => {
    let template = lookup(this.info.catalog, key) ?? lookup(en, key) ?? key;
    // "{n} line|{n} lines": pick the plural form with Intl.PluralRules when `n` is given.
    if (template.includes('|') && typeof params?.n === 'number') {
      const [one = template, other = one] = template.split('|');
      template = new Intl.PluralRules(this.info.intl).select(params.n) === 'one' ? one : other;
    }
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (match, name: string) => {
      const value = params[name];
      if (value === undefined) return name === 'detail' ? '' : match;
      return typeof value === 'number' ? this.number(value) : value;
    });
  };
}

export const i18n = new I18n();
export const t = i18n.t;
export const tr = i18n.tr;
