import { config } from '../config.ts';
import type { RawCampaign, SourceAdapter } from '../types.ts';
import { safeFetchJson } from '../safety.ts';
import { findCampaignArrays, normalizeCampaign } from './normalize.ts';

/**
 * Whop — API tier. This is the cheapest and most durable path: an
 * authenticated JSON call, no browser, no DOM parsing.
 *
 * Set WHOP_API_KEY and WHOP_ENDPOINT in .env. The exact listing endpoint
 * depends on what your account has access to, so it is configuration rather
 * than a hardcoded path — confirm yours in Whop's API docs or with
 * `npm run discover -- <the whop campaigns page>`.
 */
export const whop: SourceAdapter = {
  id: 'whop',
  label: 'via Whop',

  enabled() {
    return Boolean(config.whop.apiKey && config.whop.endpoint);
  },

  async fetchCampaigns(): Promise<RawCampaign[]> {
    const json = await safeFetchJson(config.whop.endpoint!, {
      headers: {
        Authorization: `Bearer ${config.whop.apiKey}`,
        Accept: 'application/json',
        'User-Agent': config.userAgent,
      },
    });
    const arrays = findCampaignArrays(json);
    const rows = arrays.length > 0 ? arrays[0] : [];

    return rows
      .map((r) => normalizeCampaign('whop', r, { baseUrl: 'https://whop.com' }))
      .filter((c): c is RawCampaign => c !== null);
  },
};
