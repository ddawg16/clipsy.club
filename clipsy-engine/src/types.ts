export type SourceId = string;

/** What every source adapter must return, normalized. */
export interface RawCampaign {
  sourceId: SourceId;
  /** Stable id/slug on the source site. Must not change between runs. */
  externalId: string;
  name: string;
  brand?: string | null;
  /** Deep link back to the source. We index, we never re-host. */
  url?: string | null;
  /** Dollars per 100k views. */
  rateCpm?: number | null;
  minViews?: number | null;
  platforms?: string[];
  endsAt?: string | null; // ISO
  status?: 'active' | 'closed';
  payoutDays?: number | null;
  /** Campaign artwork on the source. */
  iconUrl?: string | null;
  /** Link to the actual brief, which lives on the source. */
  briefUrl?: string | null;
  /** Per-platform rates in $ per 100k views. */
  platformRates?: Array<{ platform: string; rate: number | null }>;
  budgetTotal?: number | null;
  budgetUsedPct?: number | null;
  payoutMethod?: string | null;
  category?: string | null;
  /** Anything else worth keeping for later diffing. */
  raw?: Record<string, unknown>;
}

export interface SourceAdapter {
  id: SourceId;
  label: string;
  enabled(): boolean;
  fetchCampaigns(): Promise<RawCampaign[]>;
}

export interface CampaignRow {
  id: string;
  source_id: string;
  external_id: string;
  name: string;
  brand: string | null;
  url: string | null;
  rate_cpm: number | null;
  min_views: number | null;
  platforms: string[];
  ends_at: string | null;
  status: string;
  first_seen_at: string;
  last_seen_at: string;
  heat: number;
  effort_score: number;
  effort_label: string;
  payout_days: number | null;
  icon_url: string | null;
  brief_url: string | null;
  platform_rates: Array<{ platform: string; rate: number | null }> | null;
  budget_total: number | null;
  budget_used_pct: number | null;
  payout_method: string | null;
  category: string | null;
  team_pick: boolean;
  team_note: string | null;
  team_rank: number | null;
}

export interface SnapshotRow {
  campaign_id: string;
  captured_at: string;
  rate_cpm: number | null;
  min_views: number | null;
  status: string | null;
  ends_at: string | null;
}

export type WireType =
  | 'new_drop'
  | 'rate_up'
  | 'rate_down'
  | 'min_views_up'
  | 'min_views_down'
  | 'closing'
  | 'closed'
  | 'pulled'
  | 'payout_issue';

export interface WireEvent {
  campaign_id: string | null;
  source_id: string | null;
  type: WireType;
  headline: string;
  old_value: string | null;
  new_value: string | null;
  severity: 'info' | 'good' | 'warn';
}
