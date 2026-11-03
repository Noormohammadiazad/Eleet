/// <reference lib="webworker" />
/**
 * The engine Web Worker. All transformation and analysis work runs here, so
 * even a megabyte of input or a deep Magic search never blocks typing,
 * scrolling or animation on the UI thread.
 */
import { toSerializedError } from '$engine/core/errors';
import { execute, type EngineRequest, type EngineResponse } from '$engine/protocol';

declare const self: DedicatedWorkerGlobalScope;

const inflight = new Map<number, AbortController>();

self.addEventListener('message', async (event: MessageEvent<EngineRequest>) => {
  const request = event.data;
  if (request.type === 'cancel') {
    inflight.get(request.target)?.abort();
    inflight.delete(request.target);
    return;
  }
  const controller = new AbortController();
  inflight.set(request.id, controller);
  const started = performance.now();
  let response: EngineResponse;
  try {
    const result = await execute(request, controller.signal);
    response = { id: request.id, ok: true, result, ms: performance.now() - started };
  } catch (error) {
    response = {
      id: request.id,
      ok: false,
      error: toSerializedError(error),
      ms: performance.now() - started,
    };
  }
  inflight.delete(request.id);
  if (!controller.signal.aborted) self.postMessage(response);
});
