import type { SourceAdapter } from '../types.ts';
import { clippingnet } from './clippingnet.ts';
import { clipster } from './clipster.ts';
import { direct } from './direct.ts';
import { whop } from './whop.ts';

/**
 * Add a new network by writing one adapter and dropping it in this list.
 *
 * Every adapter here reads a PUBLIC endpoint the site publishes itself — no
 * logins, no session cookies, no rendered-page scraping.
 */
export const adapters: SourceAdapter[] = [clipster, clippingnet, whop, direct];


export function enabledAdapters(): SourceAdapter[] {
  return adapters.filter((a) => a.enabled());
}
