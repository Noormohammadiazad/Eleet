/**
 * Hash-based router.
 *
 * Routes:
 *   `#/`                      the overview (landing page)
 *   `#/leet`                  a tool
 *   `#/leet?s=<payload>`      a tool with shared state
 *
 * Hash routing needs no server rewrite rules, so it works on GitHub Pages
 * as-is, and keeps shared state in the fragment where it never reaches the
 * host's logs.
 */
import { getTool } from '$engine/registry';

interface Route {
  /** The routed tool id, or `null` for the overview. */
  tool: string | null;
  share: string | null;
  unknown: boolean;
}

export function parseRoute(hash: string): Route {
  if (hash === '' || hash === '#' || hash === '#/')
    return { tool: null, share: null, unknown: false };
  const match = /^#\/([a-z0-9-]+)(?:\?(.*))?$/.exec(hash);
  if (!match || !getTool(match[1]!)) return { tool: null, share: null, unknown: true };
  // Share payloads are Base64url, so a plain match is enough (and stays non-reactive).
  const share = /(?:^|&)s=([A-Za-z0-9_-]+)/.exec(match[2] ?? '')?.[1] ?? null;
  return { tool: match[1]!, share, unknown: false };
}

class Router {
  tool = $state<string | null>(null);
  /** A share payload waiting to be applied by the tool view. */
  share = $state<string | null>(null);
  /** True when the URL pointed at a page that does not exist. */
  unknown = $state(false);
  /** Set before navigating to a tool to land on its dossier rather than the workbench. */
  toDossier = false;

  constructor() {
    this.sync();
    globalThis.addEventListener?.('hashchange', () => this.sync());
  }

  private sync(): void {
    const route = parseRoute(globalThis.location?.hash ?? '');
    this.tool = route.tool;
    this.share = route.share;
    this.unknown = route.unknown;
  }

  /** Navigates to a tool, or to the overview with `null`. */
  go(tool: string | null): void {
    const hash = tool ? `#/${tool}` : '#/';
    if (location.hash === hash) return;
    location.hash = hash.slice(1);
  }

  /** Removes a consumed share payload from the address bar without adding history. */
  consumeShare(): void {
    this.share = null;
    history.replaceState(history.state, '', this.tool ? `#/${this.tool}` : '#/');
  }
}

export const router = new Router();
