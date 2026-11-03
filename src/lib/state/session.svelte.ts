/**
 * Tool sessions — the reactive state behind every workbench.
 *
 * One `ToolSession` exists per tool for the lifetime of the page, so switching
 * tools and coming back preserves the input and results. Options and the last
 * direction are persisted to localStorage (secrets excluded); the input text is
 * deliberately *not* persisted — people paste private things into a cipher tool.
 */
import type { SerializedError } from '$engine/core/errors';
import { defaultOptions, diffFromDefaults, sanitizeOptions } from '$engine/core/options';
import type { AnyAnalyzer, AnyTransform, Direction, OptionValues } from '$engine/core/types';
import { engine } from '$lib/platform/engine';
import { decodeShare, encodeShare, MAX_SHARE_LENGTH, shareUrl } from '$lib/platform/share';
import { readJSON, writeJSON } from '$lib/platform/storage';

/** Tools whose work is expensive enough to debounce while typing. */
const DEBOUNCED = new Set([
  'aes',
  'magic',
  'crack',
  'frequency',
  'inspector',
  't9',
  'piglatin',
  'hash',
  'hmac',
]);

interface StoredSession {
  options?: OptionValues;
  direction?: Direction;
}

interface SharedState {
  v: 1;
  d?: Direction;
  o?: OptionValues;
  i?: string;
}

export type SessionTool = AnyTransform | AnyAnalyzer;

export class ToolSession {
  readonly tool: SessionTool;
  input = $state('');
  direction = $state<Direction>('encode');
  options = $state<OptionValues>({});
  output = $state('');
  report = $state.raw<unknown>(null);
  error = $state<SerializedError | null>(null);
  busy = $state(false);
  ms = $state<number | null>(null);

  private current = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(tool: SessionTool) {
    this.tool = tool;
    const stored = readJSON<StoredSession>(`tool:${tool.id}`) ?? {};
    this.options = sanitizeOptions(tool.options, stored.options ?? {}, { includeSecrets: false });
    if (stored.direction === 'decode' && this.canDecode) this.direction = 'decode';
  }

  get isTransform(): boolean {
    return this.tool.kind === 'transform';
  }

  /** The tool has a distinct decode operation (not one-way, not an involution). */
  get canDecode(): boolean {
    return this.tool.kind === 'transform' && !!this.tool.decode && !this.tool.involution;
  }

  /** Schedules an engine run; call from an effect that reads input, direction and options. */
  schedule(): void {
    clearTimeout(this.timer);
    const heavy =
      this.input.length > 40_000 ||
      DEBOUNCED.has(this.tool.id) ||
      (this.tool.id === 'leet' && this.direction === 'decode');
    this.timer = setTimeout(() => void this.run(), heavy ? 220 : 0);
  }

  async run(): Promise<void> {
    if (this.current) engine.cancel(this.current);
    this.current = 0;
    const input = this.input;
    if (!input) {
      this.output = '';
      this.report = null;
      this.error = null;
      this.busy = false;
      this.ms = null;
      return;
    }
    const options = $state.snapshot(this.options) as OptionValues;
    const { id, promise } =
      this.tool.kind === 'transform'
        ? engine.transform(this.tool.id, this.canDecode ? this.direction : 'encode', input, options)
        : engine.analyze(this.tool.id, input, options);
    this.current = id;
    this.busy = true;
    const result = await promise;
    if (id !== this.current) return;
    this.current = 0;
    this.busy = false;
    if ('cancelled' in result) return;
    this.ms = result.ms;
    if (result.ok) {
      this.error = null;
      if (this.tool.kind === 'transform') this.output = result.value as string;
      else this.report = result.value;
    } else {
      this.error = result.error;
      if (this.tool.kind === 'transform') this.output = '';
      else this.report = null;
    }
  }

  persist(): void {
    const options = diffFromDefaults(
      this.tool.options,
      $state.snapshot(this.options) as OptionValues,
    );
    writeJSON(`tool:${this.tool.id}`, {
      ...(Object.keys(options).length ? { options } : {}),
      ...(this.direction === 'decode' ? { direction: 'decode' } : {}),
    } satisfies StoredSession);
  }

  setOption(key: string, value: OptionValues[string]): void {
    this.options[key] = value;
  }

  resetOptions(): void {
    this.options = defaultOptions(this.tool.options);
  }

  setDirection(direction: Direction): void {
    if (direction === 'decode' && !this.canDecode) return;
    this.direction = direction;
  }

  toggleDirection(): void {
    this.setDirection(this.direction === 'encode' ? 'decode' : 'encode');
  }

  /** Output becomes input, and the direction flips — the fastest way to verify a round trip. */
  swap(): void {
    if (!this.isTransform || !this.output) return;
    this.input = this.output;
    if (this.canDecode) this.toggleDirection();
  }

  /** Loads the tool's example (for decode, the example is produced by encoding the sample). */
  async loadSample(): Promise<void> {
    const sample = this.tool.sample ?? {};
    if (this.direction === 'decode' && this.canDecode) {
      if (sample.decode) {
        this.input = sample.decode;
        return;
      }
      if (sample.encode) {
        const options = $state.snapshot(this.options) as OptionValues;
        const result = await engine.transform(this.tool.id, 'encode', sample.encode, options)
          .promise;
        if ('ok' in result && result.ok) this.input = result.value;
        return;
      }
    }
    this.input = sample.encode ?? '';
  }

  /** Builds a share link. Returns `truncated` when the input had to be left out. */
  async shareLink(): Promise<{ url: string; truncated: boolean }> {
    const state: SharedState = { v: 1 };
    const options = diffFromDefaults(
      this.tool.options,
      $state.snapshot(this.options) as OptionValues,
    );
    if (Object.keys(options).length) state.o = options;
    if (this.direction === 'decode') state.d = 'decode';
    let payload = await encodeShare({ ...state, i: this.input });
    let truncated = false;
    if (payload.length > MAX_SHARE_LENGTH) {
      payload = await encodeShare(state);
      truncated = true;
    }
    return { url: shareUrl(this.tool.id, payload), truncated };
  }

  /** Applies a share payload from the URL. Invalid payloads are ignored safely. */
  async applyShare(payload: string): Promise<boolean> {
    try {
      const data = (await decodeShare(payload)) as Partial<SharedState>;
      if (!data || typeof data !== 'object' || data.v !== 1) return false;
      this.options = sanitizeOptions(this.tool.options, data.o ?? {}, { includeSecrets: false });
      this.direction = data.d === 'decode' && this.canDecode ? 'decode' : 'encode';
      if (typeof data.i === 'string') this.input = data.i;
      return true;
    } catch {
      return false;
    }
  }
}

// A plain cache keyed by tool id: the sessions it holds are reactive, the lookup table need not be.
// eslint-disable-next-line svelte/prefer-svelte-reactivity
const sessions = new Map<string, ToolSession>();

export function sessionFor(tool: SessionTool): ToolSession {
  let session = sessions.get(tool.id);
  if (!session) {
    session = new ToolSession(tool);
    sessions.set(tool.id, session);
  }
  return session;
}
