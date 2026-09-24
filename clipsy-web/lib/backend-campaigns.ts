import 'server-only';
import { clipsyApi } from './clipsy-api';
import { deriveNiche } from './niche';
import type { Campaign, SortKey } from './types';

type BackendCampaign = {
  id: string;
  name: string;
  description?: string;
  rules?: string | null;
  niches?: string[];
  coverImageUrl?: string | null;
  allowedPlatforms: string[];
  budgetCents?: number;
  spentCents?: number;
  ratePer1kCents: number;
  holdHours?: number;
  status?: string;
  endsAt: string | null;
  updatedAt: string;
  legacy?: { minimumViews?: number } | null;
};

function toCampaign(row: BackendCampaign): Campaign {
  const used = row.budgetCents && row.spentCents != null ? Math.min(100, Math.max(0, row.spentCents / row.budgetCents * 100)) : null;
  return {
    id: row.id,
    name: row.name,
    source: 'Clipsy Direct',
    url: process.env.NEXT_PUBLIC_CLIPSY_DASHBOARD_URL ?? null,
    rateCpm: row.ratePer1kCents,
    ratePer1k: row.ratePer1kCents / 100,
    minViews: row.legacy?.minimumViews ?? null,
    platforms: row.allowedPlatforms ?? [],
    endsAt: row.endsAt,
    heat: 50,
    effort: 'Medium',
    effortScore: 50,
    payoutDays: null,
    iconUrl: row.coverImageUrl ?? null,
    briefUrl: null,
    platformRates: [],
    budgetTotal: row.budgetCents != null ? row.budgetCents / 100 : null,
    budgetUsedPct: used,
    category: row.niches?.[0] ?? null,
    niche: deriveNiche(row.name, row.niches?.[0] ?? null, 'clipsy-direct'),
    teamPick: false,
    teamNote: null,
    teamRank: null,
    description: row.description ?? '',
    rules: row.rules ?? null,
  };
}

export async function backendCampaigns(sort: SortKey = 'hot', limit = 50): Promise<Campaign[]> {
  // This is the same campaign collection used by the Discord bot. Never fall
  // back to the old scraped catalog when it is unavailable.
  const rows = await clipsyApi<BackendCampaign[]>('/api/v1/public/campaigns', { authenticated: false });
  const active = rows.filter((row) => (!row.endsAt || new Date(row.endsAt).getTime() > Date.now()));
  const campaigns = active.map(toCampaign);
  if (sort === 'rate') campaigns.sort((a, b) => (b.ratePer1k ?? 0) - (a.ratePer1k ?? 0));
  else campaigns.sort((a, b) => a.name.localeCompare(b.name));
  return campaigns.slice(0, limit);
}
