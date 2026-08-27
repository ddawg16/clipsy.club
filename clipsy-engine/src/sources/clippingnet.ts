import { config } from '../config.ts';
import { cleanText, safeFetchJson, safeUrl } from '../safety.ts';
import type { RawCampaign, SourceAdapter } from '../types.ts';

/**
 * clipping.net — their PUBLIC showcase endpoint.
 *
 *   GET https://clipping.net/api/clip/campaigns
 *   -> { campaigns: [{ name, icon, days, minViews, mode, rateLabel, rates:[{p,r}], platforms }] }
 *
 * This is the feed their own marketing homepage renders from — deliberately
 * published, no auth, no session. It returns a handful of showcase campaigns,
 * NOT their full internal board. We index only what they publish publicly and
 * always deep-link back; we never touch a logged-in page.
 *
 * The endpoint carries no campaign id, so external_id is derived from the name.
 * If they rename a campaign it reads as a new one — acceptable at this volume.
 */
const ENDPOINT = 'https://clipping.net/api/clip/campaigns';

interface Rate { p?: string; r?: string }
interface Row {
  name?: string;
  icon?: string | null;
  days?: number | null;
  minViews?: number | null;
  mode?: string | null;
  rateLabel?: string | null;
  rates?: Rate[] | null;
  platforms?: string[] | null;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

/** "$300" -> 300. Their rateLabel says "per 100k", which is our storage unit. */
const money = (v: unknown): number | null => {
  if (typeof v !== 'string') return null;
  const n = Number(v.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const clippingnet: SourceAdapter = {
  id: 'clippingnet',
  label: 'via clipping.net',

  enabled() {
    return true; // public endpoint, nothing to configure
  },

  async fetchCampaigns(): Promise<RawCampaign[]> {
    const json = (await safeFetchJson(ENDPOINT, {
      headers: { Accept: 'application/json', 'User-Agent': config.userAgent },
    })) as { campaigns?: Row[] };

    return (json?.campaigns ?? [])
      .map((c): RawCampaign | null => {
        const name = cleanText(c.name);
        if (!name) return null;

        // Rates are quoted per platform; take the best on offer.
        const rates = (Array.isArray(c.rates) ? c.rates : []).map((x) => money(x?.r)).filter((n): n is number => n !== null);
        const rateCpm = rates.length ? Math.max(...rates) : null;

        const platforms = (Array.isArray(c.platforms) ? c.platforms : [])
          .map((p) => cleanText(p, 40))
          .filter((p): p is string => p !== null);

        // They quote a rate per platform; keep all of them for the card.
        const platformRates = (Array.isArray(c.rates) ? c.rates : [])
          .map((x) => {
            const name = cleanText(x?.p, 40);
            return name ? { platform: name, rate: money(x?.r) } : null;
          })
          .filter((x): x is { platform: string; rate: number | null } => x !== null);

        const days = typeof c.days === 'number' && c.days > 0 && c.days < 3650 ? c.days : null;

        return {
          sourceId: 'clippingnet',
          externalId: slug(name),
          name,
          brand: null,
          url: 'https://clipping.net/',
          rateCpm,
          minViews: typeof c.minViews === 'number' ? c.minViews : null,
          platforms,
          endsAt: days ? new Date(Date.now() + days * 86_400_000).toISOString() : null,
          status: 'active',
          payoutDays: null,
          iconUrl: safeUrl(c.icon ?? null),
          briefUrl: null,
          platformRates,
          budgetTotal: null,
          budgetUsedPct: null,
          payoutMethod: null,
          category: cleanText(c.mode, 40),
          raw: { mode: c.mode ?? null, rateLabel: c.rateLabel ?? null, rate_count: rates.length },
        };
      })
      .filter((c): c is RawCampaign => c !== null);
  },
};
