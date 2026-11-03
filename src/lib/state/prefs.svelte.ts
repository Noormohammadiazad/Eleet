/**
 * User preferences: theme and language.
 *
 * Persisted to localStorage under `eleet:prefs`. The very same key is read by
 * the tiny inline bootstrap script in `index.html` before first paint, so the
 * page never flashes the wrong theme or text direction.
 */
import { i18n, isLocale, type Locale } from '$lib/i18n/index.svelte';
import { readJSON, writeJSON } from '$lib/platform/storage';

export type ThemePreference = 'light' | 'dark' | 'system';
const THEMES: readonly ThemePreference[] = ['system', 'light', 'dark'];

interface StoredPrefs {
  theme?: ThemePreference;
  locale?: Locale;
}

function detectLocale(): Locale {
  const languages = globalThis.navigator?.languages ?? [];
  return languages.some((l) => /^fa\b/i.test(l)) ? 'fa' : 'en';
}

class Preferences {
  theme = $state<ThemePreference>('system');
  systemDark = $state(false);
  /** The theme actually applied after resolving "system". */
  resolvedTheme = $derived<'light' | 'dark'>(
    this.theme === 'system' ? (this.systemDark ? 'dark' : 'light') : this.theme,
  );

  constructor() {
    const stored = readJSON<StoredPrefs>('prefs') ?? {};
    if (stored.theme && THEMES.includes(stored.theme)) this.theme = stored.theme;
    i18n.locale = isLocale(stored.locale) ? stored.locale : detectLocale();

    const query = globalThis.matchMedia?.('(prefers-color-scheme: dark)');
    if (query) {
      this.systemDark = query.matches;
      query.addEventListener('change', (event) => (this.systemDark = event.matches));
    }
  }

  get locale(): Locale {
    return i18n.locale;
  }

  setLocale(locale: Locale): void {
    i18n.locale = locale;
    this.save();
  }

  toggleLocale(): void {
    this.setLocale(i18n.locale === 'en' ? 'fa' : 'en');
  }

  setTheme(theme: ThemePreference): void {
    this.theme = theme;
    this.save();
  }

  /** Cycles system → light → dark → system. */
  cycleTheme(): void {
    this.setTheme(THEMES[(THEMES.indexOf(this.theme) + 1) % THEMES.length]!);
  }

  private save(): void {
    writeJSON('prefs', { theme: this.theme, locale: i18n.locale } satisfies StoredPrefs);
  }
}

export const prefs = new Preferences();
