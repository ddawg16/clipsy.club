import { readFileSync } from 'node:fs';
import { db, unwrap } from '../db.ts';
import { cleanText, safeUrl } from '../safety.ts';
import type { RawCampaign, SourceAdapter } from '../types.ts';

/**
 * Clipsy Direct — campaigns WE run ourselves (sold to a brand, then handed to
 * our clippers). This is the tier that makes the site defensible: it exists
 * nowhere else to scrape.
 *
 * Two inputs, merged:
 *   1. data/direct-campaigns.json — committed, so a launch campaign can go live
 *      (or be edited) with a single push, no database access required. Native
 *      campaigns here may hand-set teamPick / teamNote / teamRank to feature
 *      themselves, and carry a full brief + budget.
 *   2. any rows already in the DB with source_id = 'direct' (e.g. approved
 *      community submissions edited straight in Supabase).
 *
 * The money side (submissions, view tracking, budget cap, payouts) is run on
 * the platform the `url` points at (e.g. a Whop campaign). We list it, show the
 * brief, and send clippers there — we never re-host the tracker.
 */

interface DirectRow {
  externalId: string;
  name: string;
  url?: string | null;
  briefUrl?: string | null;
  rateCpm?: number | null;
  minViews?: number | null;
  platforms?: string[];
  endsAt?: string | null;
  status?: 'active' | 'closed';
  payoutDays?: number | null;
  iconUrl?: string | null;
  budgetTotal?: number | null;
  budgetUsedPct?: number | null;
  category?: string | null;
  platformRates?: Array<{ platform: string; rate: number | null }>;
  teamPick?: boolean;
  teamNote?: string | null;
  teamRank?: number | null;
}

function fromFile(): RawCampaign[] {
  let rows: DirectRow[] = [];
  try {
    const url = new URL('../../data/direct-campaigns.json', import.meta.url);
    const parsed = JSON.parse(readFileSync(url, 'utf8')) as { campaigns?: DirectRow[] };
    rows = Array.isArray(parsed.campaigns) ? parsed.campaigns : [];
  } catch {
    return []; // no file yet is fine
  }

  return rows
    .map((r): RawCampaign | null => {
      const name = cleanText(r.name);
      if (!name || !r.externalId) return null;
      return {
        sourceId: 'direct',
        externalId: r.externalId,
        name,
        brand: null,
        url: safeUrl(r.url ?? null),
        rateCpm: typeof r.rateCpm === 'number' ? r.rateCpm : null,
        minViews: typeof r.minViews === 'number' ? r.minViews : null,
        platforms: (Array.isArray(r.platforms) ? r.platforms : []).map((p) => String(p).toLowerCase()),
        endsAt: r.endsAt ?? null,
        status: r.status === 'closed' ? 'closed' : 'active',
        payoutDays: typeof r.payoutDays === 'number' ? r.payoutDays : null,
        iconUrl: safeUrl(r.iconUrl ?? null),
        briefUrl: safeUrl(r.briefUrl ?? null),
        platformRates: Array.isArray(r.platformRates) ? r.platformRates : [],
        budgetTotal: typeof r.budgetTotal === 'number' ? r.budgetTotal : null,
        budgetUsedPct: typeof r.budgetUsedPct === 'number' ? r.budgetUsedPct : null,
        payoutMethod: null,
        category: cleanText(r.category ?? null, 40),
        teamPick: r.teamPick === true,
        teamNote: r.teamNote ?? null,
        teamRank: typeof r.teamRank === 'number' ? r.teamRank : null,
        raw: { via: 'direct-file' },
      };
    })
    .filter((c): c is RawCampaign => c !== null);
}

export const direct: SourceAdapter = {
  id: 'direct',
  label: 'Clipsy Direct',

  enabled() {
    return true;
  },

  async fetchCampaigns(): Promise<RawCampaign[]> {
    const fileRows = fromFile();
    const fileIds = new Set(fileRows.map((c) => c.externalId));

    const dbRows = unwrap(
      await db()
        .from('campaigns')
        .select('external_id, name, brand, url, rate_cpm, min_views, platforms, ends_at, status, payout_days')
        .eq('source_id', 'direct'),
      'direct: load',
    ) as Array<Record<string, unknown>>;

    // DB rows that the file also defines are owned by the file (it wins).
    const dbOnly = dbRows
      .filter((r) => !fileIds.has(String(r.external_id)))
      .map((r): RawCampaign => ({
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

    return [...fileRows, ...dbOnly];
  },
};
