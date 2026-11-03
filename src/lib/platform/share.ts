/**
 * Share links that never touch a server.
 *
 * State (tool, direction, options and optionally the input) is serialised to
 * JSON, compressed with the browser's native `CompressionStream('deflate-raw')`
 * and Base64url-encoded into the URL *fragment*. Browsers never send the
 * fragment to the web server, so even the static host never sees the content.
 *
 * Payload prefix: `z` = deflate-raw, `j` = plain JSON (fallback for browsers
 * without CompressionStream).
 */
import { base64ToBytes, bytesToBase64 } from '$engine/transforms/encodings/base64';

/** Keep links comfortably below the ~8 KB limits of popular chat apps and browsers. */
export const MAX_SHARE_LENGTH = 6000;

async function pipe(
  bytes: Uint8Array,
  stream: CompressionStream | DecompressionStream,
): Promise<Uint8Array> {
  const source = new Blob([bytes as Uint8Array<ArrayBuffer>]).stream();
  const response = new Response(source.pipeThrough(stream));
  return new Uint8Array(await response.arrayBuffer());
}

export async function encodeShare(data: unknown): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(data));
  if (typeof CompressionStream === 'function') {
    return 'z' + bytesToBase64(await pipe(json, new CompressionStream('deflate-raw')), true, false);
  }
  return 'j' + bytesToBase64(json, true, false);
}

export async function decodeShare(payload: string): Promise<unknown> {
  const kind = payload[0];
  const bytes = base64ToBytes(payload.slice(1));
  let json: Uint8Array;
  if (kind === 'z') json = await pipe(bytes, new DecompressionStream('deflate-raw'));
  else if (kind === 'j') json = bytes;
  else throw new Error('Unknown share payload');
  return JSON.parse(new TextDecoder().decode(json));
}

export function shareUrl(route: string, payload: string): string {
  const url = new URL(location.href);
  url.hash = `/${route}?s=${payload}`;
  return url.toString();
}
