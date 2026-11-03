/**
 * Vite plugin: Content-Security-Policy injection.
 *
 * GitHub Pages cannot send custom HTTP headers, so the policy is delivered as a
 * `<meta http-equiv="Content-Security-Policy">` tag. The only inline script in
 * `index.html` (the pre-paint theme/locale bootstrap) is allowed by its SHA-256
 * hash, which is computed here at build time — so editing that script can never
 * silently break the policy.
 *
 * The resulting policy guarantees, at the browser level, that Eleet cannot talk
 * to any third-party origin: no analytics, no CDNs, no data exfiltration.
 */
import { createHash } from 'node:crypto';
import type { Plugin } from 'vite';

const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;

function sha256(source: string): string {
  return `'sha256-${createHash('sha256').update(source, 'utf8').digest('base64')}'`;
}

export function contentSecurityPolicy(): Plugin {
  return {
    name: 'eleet:csp',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const hashes = [...html.matchAll(INLINE_SCRIPT)].map((m) => sha256(m[1] ?? ''));
        const policy = [
          `default-src 'self'`,
          `script-src 'self' ${hashes.join(' ')}`.trim(),
          // Svelte sets dynamic inline styles (e.g. slider fills); no inline <style> tags are shipped.
          `style-src 'self' 'unsafe-inline'`,
          `img-src 'self' data: blob:`,
          `font-src 'self'`,
          `connect-src 'self'`,
          `worker-src 'self'`,
          `manifest-src 'self'`,
          `media-src 'self' blob:`,
          `object-src 'none'`,
          `base-uri 'self'`,
          `form-action 'none'`,
        ].join('; ');
        return html.replace(
          /<head>/,
          `<head>\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`,
        );
      },
    },
  };
}
