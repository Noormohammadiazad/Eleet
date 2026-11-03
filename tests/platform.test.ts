import { describe, expect, it } from 'vitest';
import { decodeShare, encodeShare } from '$lib/platform/share';
import { textStats } from '$lib/ui/text-stats';
import { TORTURE } from './helpers';

describe('share links', () => {
  it('round-trip arbitrary state through deflate + Base64url', async () => {
    const state = { v: 1, d: 'decode', o: { key: 'LEMON', shift: 7 }, i: TORTURE.repeat(20) };
    const payload = await encodeShare(state);
    expect(payload.startsWith('z')).toBe(true);
    expect(payload).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(payload.length).toBeLessThan(JSON.stringify(state).length);
    expect(await decodeShare(payload)).toEqual(state);
  });

  it('rejects unknown payload formats', async () => {
    await expect(decodeShare('x123')).rejects.toThrow();
  });
});

describe('text statistics', () => {
  it('counts UTF-16 units, UTF-8 bytes and lines in one pass', () => {
    const text = 'a\né😀سلام';
    expect(textStats(text)).toEqual({
      chars: text.length - 1,
      bytes: new TextEncoder().encode(text).length,
      lines: 2,
    });
    expect(textStats('')).toEqual({ chars: 0, bytes: 0, lines: 0 });
  });
});
