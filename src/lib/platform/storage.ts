/**
 * Defensive localStorage access. Storage can be unavailable (private mode,
 * disabled site data, quota errors) — Eleet must keep working regardless, so
 * every access is wrapped and failures degrade to "not persisted".
 */
const PREFIX = 'eleet:';

export function readJSON<T>(key: string): T | undefined {
  try {
    const raw = globalThis.localStorage?.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    const empty =
      value === undefined ||
      (typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        !Object.keys(value).length);
    if (empty) globalThis.localStorage?.removeItem(PREFIX + key);
    else globalThis.localStorage?.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable or full: silently skip persistence */
  }
}
