/**
 * Localisable engine errors.
 *
 * Tools never throw human-readable prose. They throw a `TransformError` with a
 * stable `code` (and optional interpolation params); the UI resolves the code
 * against `errors.<code>` in the active language catalog. Because errors must
 * cross the Web Worker boundary, they are also convertible to plain objects.
 */
export const ERROR_CODES = [
  'invalidInput',
  'invalidBase64',
  'invalidBase32',
  'invalidBase58',
  'invalidAscii85',
  'invalidDigits',
  'invalidUtf8',
  'invalidPercent',
  'invalidPunycode',
  'invalidMorse',
  'invalidCiphertext',
  'keyRequired',
  'keyLettersOnly',
  'keyDigitsOnly',
  'notCoprime',
  'duplicateRotors',
  'invalidPlugboard',
  'decryptFailed',
  'secretRequired',
  'coverRequired',
  'nothingHidden',
  'unsupportedAlgorithm',
  'tooLarge',
  'aborted',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];
export type ErrorParams = Readonly<Record<string, string | number>>;

export interface SerializedError {
  readonly code: ErrorCode;
  readonly params?: ErrorParams;
}

export class TransformError extends Error {
  readonly code: ErrorCode;
  readonly params?: ErrorParams;

  constructor(code: ErrorCode, params?: ErrorParams) {
    super(params ? `${code} ${JSON.stringify(params)}` : code);
    this.name = 'TransformError';
    this.code = code;
    if (params) this.params = params;
  }

  toJSON(): SerializedError {
    return this.params ? { code: this.code, params: this.params } : { code: this.code };
  }
}

/** Normalises anything thrown by a tool into a serialisable error. */
export function toSerializedError(error: unknown): SerializedError {
  if (error instanceof TransformError) return error.toJSON();
  if (error instanceof DOMException && error.name === 'AbortError') return { code: 'aborted' };
  if (error instanceof DOMException && error.name === 'OperationError') {
    return { code: 'decryptFailed' };
  }
  const message = error instanceof Error ? error.message : String(error);
  return { code: 'invalidInput', params: { detail: message.slice(0, 200) } };
}

/** Throws `aborted` if the signal fired; call inside long-running loops. */
export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new TransformError('aborted');
}
