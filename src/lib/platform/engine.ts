/**
 * Engine client — a tiny typed RPC layer over the engine Web Worker.
 *
 * - Requests are numbered; responses resolve the matching promise.
 * - `cancel(id)` tells the worker to abort (its AbortSignal fires inside the
 *   tool) and settles the promise immediately as `{ cancelled: true }`.
 * - If module workers are unavailable (very old browsers, unusual sandboxes),
 *   requests transparently run on the main thread with identical semantics.
 */
import { toSerializedError, type SerializedError } from '$engine/core/errors';
import type { PipelineStep, StepResult } from '$engine/core/pipeline';
import type { Direction, OptionValues } from '$engine/core/types';
import type { EngineRequest, EngineResponse } from '$engine/protocol';

export type EngineResult<T> =
  | { readonly ok: true; readonly value: T; readonly ms: number }
  | { readonly ok: false; readonly error: SerializedError; readonly ms: number }
  | { readonly cancelled: true };

type Pending = (result: EngineResult<unknown>) => void;
type Payload =
  Exclude<EngineRequest, { type: 'cancel' }> extends infer R
    ? R extends EngineRequest
      ? Omit<R, 'id'>
      : never
    : never;

class EngineClient {
  private worker: Worker | null = null;
  private readonly pending = new Map<number, Pending>();
  private readonly local = new Map<number, AbortController>();
  private seq = 0;

  constructor() {
    try {
      this.worker = new Worker(new URL('../../workers/engine.worker.ts', import.meta.url), {
        type: 'module',
        name: 'eleet-engine',
      });
      this.worker.addEventListener('message', (event: MessageEvent<EngineResponse>) =>
        this.settle(event.data),
      );
      this.worker.addEventListener('error', () => this.fallback());
    } catch {
      this.worker = null;
    }
  }

  private settle(response: EngineResponse): void {
    const resolve = this.pending.get(response.id);
    if (!resolve) return;
    this.pending.delete(response.id);
    resolve(
      response.ok
        ? { ok: true, value: response.result, ms: response.ms }
        : { ok: false, error: response.error, ms: response.ms },
    );
  }

  /** Switches to main-thread execution and replays nothing (callers simply retry on next input). */
  private fallback(): void {
    this.worker?.terminate();
    this.worker = null;
    for (const [id, resolve] of this.pending) {
      resolve({ cancelled: true });
      this.pending.delete(id);
    }
  }

  private send<T>(payload: Payload): { id: number; promise: Promise<EngineResult<T>> } {
    const id = ++this.seq;
    const request = { ...payload, id } as EngineRequest;
    const promise = new Promise<EngineResult<T>>((resolve) => {
      this.pending.set(id, resolve as Pending);
    });
    if (this.worker) {
      this.worker.postMessage(request);
    } else {
      void this.runLocally(request as Exclude<EngineRequest, { type: 'cancel' }>);
    }
    return { id, promise };
  }

  private async runLocally(request: Exclude<EngineRequest, { type: 'cancel' }>): Promise<void> {
    const controller = new AbortController();
    this.local.set(request.id, controller);
    const started = performance.now();
    const { execute } = await import('$engine/protocol');
    try {
      const result = await execute(request, controller.signal);
      this.settle({ id: request.id, ok: true, result, ms: performance.now() - started });
    } catch (error) {
      this.settle({
        id: request.id,
        ok: false,
        error: toSerializedError(error),
        ms: performance.now() - started,
      });
    } finally {
      this.local.delete(request.id);
    }
  }

  cancel(id: number): void {
    const resolve = this.pending.get(id);
    if (!resolve) return;
    this.pending.delete(id);
    resolve({ cancelled: true });
    if (this.worker)
      this.worker.postMessage({
        id: ++this.seq,
        type: 'cancel',
        target: id,
      } satisfies EngineRequest);
    else this.local.get(id)?.abort();
  }

  transform(tool: string, direction: Direction, input: string, options: OptionValues) {
    return this.send<string>({ type: 'transform', tool, direction, input, options });
  }

  analyze<R>(tool: string, input: string, options: OptionValues) {
    return this.send<R>({ type: 'analyze', tool, input, options });
  }

  pipeline(input: string, steps: readonly PipelineStep[]) {
    return this.send<StepResult[]>({ type: 'pipeline', input, steps });
  }
}

export const engine = new EngineClient();
