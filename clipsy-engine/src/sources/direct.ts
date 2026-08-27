import { db, unwrap } from '../db.ts';
import type { RawCampaign, SourceAdapter } from '../types.ts';

/**
 * Clipsy Direct — campaigns you sold yourself, plus approved community
 * submissions. No scraping involved: these already live in your database.
 *
 * This tier is the one that actually makes the site defensible. Nobody can
 * scrape it off you, because it does not exist anywhere else.
 */
export const direct: SourceAdapter = {
  id: 'direct',
  label: 'Clipsy Direct',

  enabled() {
    return true;
  },

  async fetchCampaigns(): Promise<RawCampaign[]> {
    const rows = unwrap(
      await db()
        .from('campaigns')
        .select('external_id, name, brand, url, rate_cpm, min_views, platforms, ends_at, status, payout_days')
        .eq('source_id', 'direct'),
      'direct: load',
    ) as Array<Record<string, unknown>>;

    // Direct campaigns are edited by hand, so we pass them straight through the
    // same pipeline — that way they get snapshots, Wire events and scores too.
    return rows.map((r) => ({
      sourceId: 'direct',
      externalId: String(r.external_id),
      name: String(r.name),
      brand: (r.brand as string | null) ?? null,
      url: (r.url as string | null) ?? null,
      rateCpm: (r.rate_cpm as number | null) ?? null,
      minViews: (r.min_views as number | null) ?? null,
      platforms: (r.platforms as string[] | null) ?? [],
      endsAt: (r.ends_at as string | null) ?? null,
      status: (r.status as 'active' | 'closed') ?? 'active',
      payoutDays: (r.payout_days as number | null) ?? null,
    }));
  },
};
