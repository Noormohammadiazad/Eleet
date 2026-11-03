/** Test helpers: run any registered tool by id with partial options. */
import { defaultOptions } from '$engine/core/options';
import type { Direction, OptionValues } from '$engine/core/types';
import { getAnalyzer, getTransform } from '$engine/registry';

export async function run(
  id: string,
  direction: Direction,
  input: string,
  options: OptionValues = {},
): Promise<string> {
  const tool = getTransform(id);
  if (!tool) throw new Error(`Unknown transform ${id}`);
  const fn = direction === 'decode' ? tool.decode : tool.encode;
  if (!fn) throw new Error(`${id} cannot ${direction}`);
  return fn.call(tool, input, { ...defaultOptions(tool.options), ...options } as never, {});
}

export const encode = (id: string, input: string, options: OptionValues = {}) =>
  run(id, 'encode', input, options);
export const decode = (id: string, input: string, options: OptionValues = {}) =>
  run(id, 'decode', input, options);

export async function analyze<R>(
  id: string,
  input: string,
  options: OptionValues = {},
): Promise<R> {
  const tool = getAnalyzer(id);
  if (!tool) throw new Error(`Unknown analyzer ${id}`);
  return (await tool.analyze(
    input,
    { ...defaultOptions(tool.options), ...options } as never,
    {},
  )) as R;
}

/** A multilingual torture string: Latin, Persian with ZWNJ, emoji ZWJ sequences, CJK, combining marks. */
export const TORTURE =
  'Hello, World! سلام\u200Cها 👨\u200D👩\u200D👧 🇮🇷 日本語 e\u0301 ~`!@#$%^&*()_+-={}[]|\\:;"\'<>,.?/';
