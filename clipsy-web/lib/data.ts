import { createClient } from '@supabase/supabase-js';
import { unstable_rethrow } from 'next/navigation';
import { backendCampaigns } from './backend-campaigns';
import type { Campaign, SortKey, WireEvent } from './types';

export async function getCampaigns(sort: SortKey = 'hot', limit = 50): Promise<Campaign[]> {
  try {
    return await backendCampaigns(sort, limit);
  } catch (error) {
    unstable_rethrow(error);
    console.error('Discord campaign feed unavailable', error);
    return [];
  }
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  return (await getCampaigns('hot', 100)).find((campaign) => campaign.id === id) ?? null;
}

export async function getRelated(id: string, limit = 4): Promise<Campaign[]> {
  return (await getCampaigns('hot', 100)).filter((campaign) => campaign.id !== id).slice(0, limit);
}

export async function getTeamPicks(): Promise<Campaign[]> {
  return (await getCampaigns('hot', 100)).filter((campaign) => campaign.teamPick).slice(0, 6);
}

export type Counts = { campaigns: number; sources: number; wire: number; budget: number; unclaimed: number };

export async function getCounts(): Promise<Counts> {
  const rows = await getCampaigns('hot', 100);
  const budget = rows.reduce((sum, row) => sum + (row.budgetTotal ?? 0), 0);
  const unclaimed = rows.reduce((sum, row) => sum + (row.budgetTotal ?? 0) * (1 - (row.budgetUsedPct ?? 0) / 100), 0);
  return { campaigns: rows.length, sources: rows.length ? 1 : 0, wire: 0, budget, unclaimed };
}

// The Wire remains a separate publication. It does not determine which
// campaigns appear on the board.
export async function getWire(limit = 6): Promise<WireEvent[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await db.from('wire_events')
    .select('id, type, headline, severity, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as WireEvent[];
}

export async function getLastRun(): Promise<string | null> {
  return null;
}
