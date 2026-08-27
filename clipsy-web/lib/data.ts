import { createClient } from '@supabase/supabase-js';
import type { Campaign, SortKey, WireEvent } from './types';

/**
 * Reads run through the ANON key, which is safe to ship because Row Level
 * Security decides what it can see (clipsy-engine/sql/002_security.sql).
 * The service-role key must never appear in this app.
 */
function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

const ORDER: Record<SortKey, { column: string; ascending: boolean }> = {
  hot: { column: 'heat', ascending: false },
  easy: { column: 'effort_score', ascending: false },
  rate: { column: 'rate_cpm', ascending: false },
  ending: { column: 'ends_at', ascending: true },
};

type Row = {
  id: string;
  name: string;
  source_id: string;
  url: string | null;
  rate_cpm: number | null;
  min_views: number | null;
  platforms: string[] | null;
  ends_at: string | null;
  heat: number;
  effort_label: string;
  effort_score: number;
  payout_days: number | null;
  icon_url: string | null;
  brief_url: string | null;
  platform_rates: Array<{ platform: string; rate: number | null }> | null;
  budget_total: number | null;
  budget_used_pct: number | null;
  category: string | null;
  team_pick: boolean | null;
  team_note: string | null;
  team_rank: number | null;
  sources: { name: string } | { name: string }[] | null;
};

function toCampaign(r: Row): Campaign {
  const src = Array.isArray(r.sources) ? r.sources[0] : r.sources;
  const label = r.effort_label === 'Low' || r.effort_label === 'High' ? r.effort_label : 'Medium';
  return {
    id: r.id,
    name: r.name,
    source: src?.name ?? r.source_id,
    url: r.url,
    rateCpm: r.rate_cpm,
    minViews: r.min_views,
    platforms: r.platforms ?? [],
    endsAt: r.ends_at,
    heat: r.heat ?? 0,
    effort: label,
    effortScore: r.effort_score ?? 50,
    payoutDays: r.payout_days,
    iconUrl: r.icon_url,
    briefUrl: r.brief_url,
    platformRates: r.platform_rates ?? [],
    budgetTotal: r.budget_total,
    budgetUsedPct: r.budget_used_pct,
    category: r.category,
    teamPick: r.team_pick ?? false,
    teamNote: r.team_note,
    teamRank: r.team_rank,
  };
}

const SELECT =
  'id, name, source_id, url, rate_cpm, min_views, platforms, ends_at, heat, effort_label, effort_score, payout_days, ' +
  'icon_url, brief_url, platform_rates, budget_total, budget_used_pct, category, team_pick, team_note, team_rank, sources(name)';

/**
 * Every fetch degrades to an empty array rather than throwing. Before the first
 * successful ingest the database IS empty, and a homepage that 500s because a
 * campaign table has no rows is worse than one that says "nothing live yet".
 */
export async function getCampaigns(sort: SortKey = 'hot', limit = 50): Promise<Campaign[]> {
  const db = client();
  if (!db) return [];
  const o = ORDER[sort] ?? ORDER.hot;

  const { data, error } = await db
    .from('campaigns')
    .select(SELECT)
    .eq('status', 'active')
    .order(o.column, { ascending: o.ascending, nullsFirst: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as unknown as Row[]).map(toCampaign);
}

export async function getWire(limit = 6): Promise<WireEvent[]> {
  const db = client();
  if (!db) return [];

  const { data, error } = await db
    .from('wire_events')
    .select('id, type, headline, severity, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as WireEvent[];
}

export async function getCounts(): Promise<{ campaigns: number; sources: number; wire: number }> {
  const db = client();
  if (!db) return { campaigns: 0, sources: 0, wire: 0 };

  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [campaigns, sources, wire] = await Promise.all([
    db.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('sources').select('id', { count: 'exact', head: true }).eq('enabled', true),
    db.from('wire_events').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo),
  ]);

  return { campaigns: campaigns.count ?? 0, sources: sources.count ?? 0, wire: wire.count ?? 0 };
}

/** One campaign by id, for its own page. Null when it does not exist. */
export async function getCampaign(id: string): Promise<Campaign | null> {
  const db = client();
  if (!db) return null;

  const { data, error } = await db.from('campaigns').select(SELECT).eq('id', id).eq('status', 'active').limit(1);
  if (error || !data || data.length === 0) return null;
  return toCampaign((data as unknown as Row[])[0]);
}

/** Other live campaigns, for the "more like this" rail. */
export async function getRelated(id: string, limit = 4): Promise<Campaign[]> {
  const db = client();
  if (!db) return [];

  const { data, error } = await db
    .from('campaigns')
    .select(SELECT)
    .eq('status', 'active')
    .neq('id', id)
    .order('heat', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as unknown as Row[]).map(toCampaign);
}

/** The three (or however many) campaigns your team has hand-picked as easiest. */
export async function getTeamPicks(): Promise<Campaign[]> {
  const db = client();
  if (!db) return [];

  const { data, error } = await db
    .from('campaigns')
    .select(SELECT)
    .eq('status', 'active')
    .eq('team_pick', true)
    .order('team_rank', { ascending: true, nullsFirst: false })
    .limit(6);

  if (error || !data) return [];
  return (data as unknown as Row[]).map(toCampaign);
}

/** When ingest genuinely last ran, so the site can state real freshness. */
export async function getLastRun(): Promise<string | null> {
  const db = client();
  if (!db) return null;
  const { data, error } = await db.from('ingest_runs').select('ran_at').order('ran_at', { ascending: false }).limit(1);
  if (error || !data || data.length === 0) return null;
  return (data[0] as { ran_at: string }).ran_at;
}
