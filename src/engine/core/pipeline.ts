/**
 * Pipelines ("recipes") chain transforms: the output of each enabled step is
 * the input of the next. Execution stops at the first failing step and reports
 * which one failed, so the UI can point at it.
 */
import { toSerializedError, throwIfAborted, type SerializedError } from './errors';
import { sanitizeOptions } from './options';
import type { AnyTransform, Direction, OptionValues, RunContext } from './types';

export interface PipelineStep {
  /** Stable identity for UI lists (not the tool id). */
  readonly uid: string;
  readonly tool: string;
  readonly direction: Direction;
  readonly options: OptionValues;
  readonly enabled: boolean;
}

export type StepResult =
  | { readonly ok: true; readonly output: string; readonly ms: number }
  | { readonly ok: false; readonly error: SerializedError }
  | { readonly ok: 'skipped' };

export async function runTransform(
  transform: AnyTransform,
  direction: Direction,
  input: string,
  options: OptionValues,
  ctx: RunContext = {},
): Promise<string> {
  const fn = direction === 'decode' && transform.decode ? transform.decode : transform.encode;
  const clean = sanitizeOptions(transform.options, options);
  return fn.call(transform, input, clean as never, ctx);
}

export async function runPipeline(
  input: string,
  steps: readonly PipelineStep[],
  resolve: (id: string) => AnyTransform | undefined,
  ctx: RunContext = {},
): Promise<StepResult[]> {
  const results: StepResult[] = [];
  let current = input;
  let failed = false;
  for (const step of steps) {
    if (failed || !step.enabled) {
      results.push({ ok: 'skipped' });
      continue;
    }
    throwIfAborted(ctx.signal);
    const transform = resolve(step.tool);
    if (!transform) {
      results.push({
        ok: false,
        error: { code: 'unsupportedAlgorithm', params: { algorithm: step.tool } },
      });
      failed = true;
      continue;
    }
    const started = performance.now();
    try {
      current = await runTransform(transform, step.direction, current, step.options, ctx);
      results.push({ ok: true, output: current, ms: performance.now() - started });
    } catch (error) {
      results.push({ ok: false, error: toSerializedError(error) });
      failed = true;
    }
  }
  return results;
}
