import { config } from '../config.ts';
import { cleanText, safeFetchJson, safeUrl } from '../safety.ts';
import type { RawCampaign, SourceAdapter } from '../types.ts';

/**
 * Clipster — public campaign feed. No auth, no browser, no DOM parsing.
 *
 *   GET https://api.clipster.gg/campaigns/public
 *   -> { success, data: { campaigns: [...], total_campaigns_count } }
 *
 * Field mapping confirmed against a live response (78 campaigns).
 */
const ENDPOINT = 'https://api.clipster.gg/campaigns/public?limit=200';

interface ClipsterPlatform { platform?: string; rate_per_one_thousand_views?: string | null }

interface ClipsterCampaign {
  thumbnail_url?: string | null;
  description?: string | null;
  pay_summary?: { mode?: string | null } | null;
  category?: string | null;
  statistics?: { potential_earnings?: string | null; total_views?: number; total_submissions?: number; total_approved?: number };
  id: string;
  name: string;
  status: string;
  type: string;
  rate_per_one_thousand_views: string | null;
  rate_per_million_views: string | null;
  minimum_views_for_earnings: number | null;
  max_earnings: string | null;
  platforms: unknown[] | null;
  allowed_platforms: unknown[] | null;
  discord_invite_url: string | null;
  is_discord_exclusive: boolean;
}

/** CAMPAIGN_TYPE_CLIPPING -> clipping, CAMPAIGN_STATUS_ACTIVE -> active, etc. */
const tail = (v: unknown, prefix: string): string =>
  typeof v === 'string' ? v.replace(prefix, '').toLowerCase() : '';

/**
 * `platforms` comes back as objects, not strings, and the key name is not
 * guaranteed. Pull the first string-ish field out of whatever shape arrives.
 */
const platformName = (p: unknown): string => {
  if (typeof p === 'string') return tail(p, 'SOCIAL_MEDIA_PLATFORM_');
  if (p && typeof p === 'object') {
    const o = p as Record<string, unknown>;
    for (const k of ['platform', 'name', 'type', 'social_media_platform', 'id']) {
      if (typeof o[k] === 'string') return tail(o[k], 'SOCIAL_MEDIA_PLATFORM_');
    }
  }
  return '';
};

export const clipster: SourceAdapter = {
  id: 'clipster',
  label: 'via Clipster',

  enabled() {
    return true; // public feed, nothing to configure
  },

  async fetchCampaigns(): Promise<RawCampaign[]> {
    const json = (await safeFetchJson(ENDPOINT, {
      headers: { Accept: 'application/json', 'User-Agent': config.userAgent },
    })) as { data?: { campaigns?: ClipsterCampaign[] } };

    const rows = json?.data?.campaigns ?? [];

    return rows
      .filter((c) => tail(c.status, 'CAMPAIGN_STATUS_') === 'active')
      .map((c): RawCampaign | null => {
        const name = cleanText(c.name);
        if (!name || !c.id) return null;

        // Clipster quotes $ per 1,000 views. We store $ per 100,000.
        const perK = Number(c.rate_per_one_thousand_views ?? 0);
        const rateCpm = Number.isFinite(perK) && perK > 0 ? Math.round(perK * 100 * 100) / 100 : null;

        const rawPlatforms = c.platforms ?? c.allowed_platforms ?? [];
        const platformList = Array.isArray(rawPlatforms) ? rawPlatforms : [];
        const platforms = platformList.map(platformName).filter(Boolean);

        // Per-platform rates, converted from $/1k to our $/100k.
        const platformRates = platformList
          .map((p) => {
            const o = p as ClipsterPlatform;
            const name = platformName(p);
            const per = Number(o?.rate_per_one_thousand_views ?? 0);
            return name ? { platform: name, rate: Number.isFinite(per) && per > 0 ? Math.round(per * 100 * 100) / 100 : null } : null;
          })
          .filter((x): x is { platform: string; rate: number | null } => x !== null);

        // The brief link lives in the description blob.
        const brief = safeUrl((String(c.description ?? '').match(/https?:\/\/\S+/) ?? [])[0] ?? null);

        const pool = Number(c.max_earnings ?? 0);
        const earned = Number(c.statistics?.potential_earnings ?? 0);
        const usedPct = pool > 0 && Number.isFinite(earned) ? Math.min(100, Math.round((earned / pool) * 100)) : null;

        return {
          sourceId: 'clipster',
          externalId: String(c.id),
          name,
          brand: null,
          // Deep-link back to the source. We index, we never re-host.
          url: safeUrl(`https://www.clipster.gg/campaigns/${c.id}`),
          rateCpm,
          minViews: typeof c.minimum_views_for_earnings === 'number' ? c.minimum_views_for_earnings : null,
          platforms,
          // Clipster publishes no deadline; campaigns end when the pool empties.
          endsAt: null,
          status: 'active',
          payoutDays: null,
          iconUrl: safeUrl(c.thumbnail_url ?? null),
          briefUrl: brief,
          platformRates,
          budgetTotal: Number.isFinite(pool) && pool > 0 ? pool : null,
          budgetUsedPct: usedPct,
          payoutMethod: null,
          category: tail(c.category ?? null, 'CAMPAIGN_CATEGORY_') || null,
          raw: {
            type: tail(c.type, 'CAMPAIGN_TYPE_'),
            pool: c.max_earnings,
            discord_exclusive: c.is_discord_exclusive,
            total_views: c.statistics?.total_views ?? null,
            total_submissions: c.statistics?.total_submissions ?? null,
            total_approved: c.statistics?.total_approved ?? null,
          },
        };
      })
      .filter((c): c is RawCampaign => c !== null);
  },
};
