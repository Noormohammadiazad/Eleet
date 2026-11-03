/**
 * Pipeline (recipe) state. Steps are persisted to localStorage — they contain
 * no user text — so a carefully built recipe survives reloads. Secrets inside
 * step options (HMAC keys, AES passwords) are stripped before persisting or
 * sharing, exactly as for single tools.
 */
import { defaultOptions, diffFromDefaults, sanitizeOptions } from '$engine/core/options';
import type { PipelineStep, StepResult } from '$engine/core/pipeline';
import type { Direction, OptionValues } from '$engine/core/types';
import { getTransform } from '$engine/registry';
import { engine } from '$lib/platform/engine';
import { decodeShare, encodeShare, MAX_SHARE_LENGTH, shareUrl } from '$lib/platform/share';
import { readJSON, writeJSON } from '$lib/platform/storage';

export interface MutableStep {
  uid: string;
  tool: string;
  direction: Direction;
  options: OptionValues;
  enabled: boolean;
}

interface StoredStep {
  t: string;
  d?: Direction;
  o?: OptionValues;
  off?: true;
}

const uid = () => Math.random().toString(36).slice(2, 10);

function hydrate(stored: unknown): MutableStep[] {
  if (!Array.isArray(stored)) return [];
  return stored.flatMap((raw: StoredStep) => {
    const tool = raw && typeof raw.t === 'string' ? getTransform(raw.t) : undefined;
    if (!tool) return [];
    return [
      {
        uid: uid(),
        tool: tool.id,
        direction: raw.d === 'decode' && tool.decode && !tool.involution ? 'decode' : 'encode',
        options: sanitizeOptions(tool.options, raw.o ?? {}, { includeSecrets: false }),
        enabled: !raw.off,
      },
    ];
  });
}

function dehydrate(steps: MutableStep[]): StoredStep[] {
  return steps.map((s) => {
    const tool = getTransform(s.tool)!;
    const o = diffFromDefaults(tool.options, s.options);
    return {
      t: s.tool,
      ...(s.direction === 'decode' ? { d: 'decode' as const } : {}),
      ...(Object.keys(o).length ? { o } : {}),
      ...(s.enabled ? {} : { off: true as const }),
    };
  });
}

export const EXAMPLE_RECIPES: Record<string, { input: string; steps: StoredStep[] }> = {
  example1: {
    input: 'Meet me at the old bridge at midnight',
    steps: [{ t: 'leet' }, { t: 'base64' }, { t: 'reverse' }],
  },
  example2: {
    input:
      '55 58 4a 77 59 6e 46 32 59 58 51 67 64 6d 59 67 62 6d 45 67 62 6d 56 6e 49 48 4e 69 5a 58 6f 3d',
    steps: [{ t: 'hex', d: 'decode' }, { t: 'base64', d: 'decode' }, { t: 'rot' }],
  },
  example3: { input: 'SOS', steps: [{ t: 'morse' }, { t: 'binary' }] },
};

class PipelineState {
  input = $state('');
  steps = $state<MutableStep[]>(hydrate(readJSON('pipeline')));
  results = $state.raw<StepResult[]>([]);
  busy = $state(false);
  private current = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  add(toolId: string): void {
    const tool = getTransform(toolId);
    if (!tool) return;
    this.steps.push({
      uid: uid(),
      tool: tool.id,
      direction: 'encode',
      options: defaultOptions(tool.options),
      enabled: true,
    });
  }

  remove(id: string): void {
    this.steps = this.steps.filter((s) => s.uid !== id);
  }

  move(id: string, delta: -1 | 1): void {
    const index = this.steps.findIndex((s) => s.uid === id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= this.steps.length) return;
    const next = [...this.steps];
    [next[index], next[target]] = [next[target]!, next[index]!];
    this.steps = next;
  }

  clear(): void {
    this.steps = [];
  }

  loadExample(name: keyof typeof EXAMPLE_RECIPES): void {
    const recipe = EXAMPLE_RECIPES[name]!;
    this.steps = hydrate(recipe.steps);
    this.input = recipe.input;
  }

  persist(): void {
    writeJSON('pipeline', dehydrate($state.snapshot(this.steps) as MutableStep[]));
  }

  schedule(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.run(), 120);
  }

  async run(): Promise<void> {
    if (this.current) engine.cancel(this.current);
    const steps = ($state.snapshot(this.steps) as MutableStep[]).map(
      (s) => ({ ...s }) as PipelineStep,
    );
    if (!this.input || !steps.length) {
      this.results = [];
      this.busy = false;
      return;
    }
    const { id, promise } = engine.pipeline(this.input, steps);
    this.current = id;
    this.busy = true;
    const result = await promise;
    if (id !== this.current) return;
    this.current = 0;
    this.busy = false;
    if ('cancelled' in result) return;
    this.results = result.ok ? result.value : [];
  }

  async shareLink(): Promise<{ url: string; truncated: boolean }> {
    const recipe = dehydrate($state.snapshot(this.steps) as MutableStep[]);
    let payload = await encodeShare({ v: 1, r: recipe, i: this.input });
    let truncated = false;
    if (payload.length > MAX_SHARE_LENGTH) {
      payload = await encodeShare({ v: 1, r: recipe });
      truncated = true;
    }
    return { url: shareUrl('pipeline', payload), truncated };
  }

  async applyShare(payload: string): Promise<boolean> {
    try {
      const data = (await decodeShare(payload)) as { v?: number; r?: unknown; i?: unknown };
      if (data?.v !== 1) return false;
      this.steps = hydrate(data.r);
      if (typeof data.i === 'string') this.input = data.i;
      return true;
    } catch {
      return false;
    }
  }
}

export const pipeline = new PipelineState();
