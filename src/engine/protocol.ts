/**
 * Message protocol between the UI thread and the engine Web Worker.
 * Every request carries a numeric id; responses echo it. A `cancel` message
 * aborts an in-flight request (its AbortSignal fires inside the tool).
 */
import { TransformError, type SerializedError } from './core/errors';
import { sanitizeOptions } from './core/options';
import { runPipeline, runTransform, type PipelineStep, type StepResult } from './core/pipeline';
import type { Direction, OptionValues } from './core/types';
import { getAnalyzer, getTransform } from './registry';

export type EngineRequest =
  | {
      readonly id: number;
      readonly type: 'transform';
      readonly tool: string;
      readonly direction: Direction;
      readonly input: string;
      readonly options: OptionValues;
    }
  | {
      readonly id: number;
      readonly type: 'analyze';
      readonly tool: string;
      readonly input: string;
      readonly options: OptionValues;
    }
  | {
      readonly id: number;
      readonly type: 'pipeline';
      readonly input: string;
      readonly steps: readonly PipelineStep[];
    }
  | { readonly id: number; readonly type: 'cancel'; readonly target: number };

export type EngineResponse =
  | { readonly id: number; readonly ok: true; readonly result: unknown; readonly ms: number }
  | {
      readonly id: number;
      readonly ok: false;
      readonly error: SerializedError;
      readonly ms: number;
    };

export type PipelineResponse = readonly StepResult[];

/** Executes a request against the engine. Shared by the worker and the main-thread fallback. */
export async function execute(
  request: Exclude<EngineRequest, { type: 'cancel' }>,
  signal: AbortSignal,
): Promise<unknown> {
  switch (request.type) {
    case 'transform': {
      const tool = getTransform(request.tool);
      if (!tool) throw new TransformError('unsupportedAlgorithm', { algorithm: request.tool });
      return runTransform(tool, request.direction, request.input, request.options, { signal });
    }
    case 'analyze': {
      const tool = getAnalyzer(request.tool);
      if (!tool) throw new TransformError('unsupportedAlgorithm', { algorithm: request.tool });
      return tool.analyze(request.input, sanitizeOptions(tool.options, request.options) as never, {
        signal,
      });
    }
    case 'pipeline':
      return runPipeline(request.input, request.steps, getTransform, { signal });
  }
}
