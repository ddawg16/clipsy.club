export interface Campaign {
  id: string;
  name: string;
  source: string;
  url: string | null;
  rateCpm: number | null;
  minViews: number | null;
  platforms: string[];
  endsAt: string | null;
  heat: number;
  effort: 'Low' | 'Medium' | 'High';
  effortScore: number;
  payoutDays: number | null;
  iconUrl: string | null;
  briefUrl: string | null;
  platformRates: Array<{ platform: string; rate: number | null }>;
  budgetTotal: number | null;
  budgetUsedPct: number | null;
  category: string | null;
  niche: string;
  teamPick: boolean;
  teamNote: string | null;
  teamRank: number | null;
}

export interface WireEvent {
  id: number;
  type: string;
  headline: string;
  severity: 'info' | 'good' | 'warn';
  created_at: string;
}

export type SortKey = 'hot' | 'easy' | 'rate' | 'picks';
