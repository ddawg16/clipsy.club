import { db, unwrap } from '../db.ts';
import type { CampaignRow } from '../types.ts';

/**
 * Heat and Effort — the two scores the whole board sorts on. Both are REAL,
 * computed every run from each campaign's own stats, and expressed relative to
 * the rest of the live board so the numbers actually mean something:
 *
 *   Heat   0..100  how hard this campaign is running right now (high = crowded/hot)
 *   Effort 0..100  how likely you are to actually get approved and paid (high = easy)
 *
 * There is no "default 50". A campaign missing a signal (e.g. no payout cycle
 * published) simply has that component dropped and the remaining weights
 * re-normalised — the score reflects only what we actually know about it, and
 * two campaigns are only tied when their real inputs are tied.
 *
 * When clippers start reporting outcomes, those blend in and sharpen the score.
 */

const DAY = 86_400_000;
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

/** Fraction of the board strictly below `value` (0..1). Ties share a rank. */
function percentile(value: number, all: number[]): number {
  if (all.length === 0) return 0.5;
  const below = all.filter((v) => v < value).length;
  return below / all.length;
}

/** Weighted average of [value0..1, weight] parts, re-normalised over the parts present. */
function blend(parts: Array<[number, number]>): number {
  const w = parts.reduce((s, [, weight]) => s + weight, 0);
  if (w === 0) return 0;
  return parts.reduce((s, [v, weight]) => s + v * weight, 0) / w;
}

interface Outcome {
  campaign_id: string;
  submitted_at: string;
  approved: boolean | null;
  views: number | null;
  paid_at: string | null;
}

export async function scoreAll(): Promise<{ scored: number }> {
  const campaigns = unwrap(
    await db().from('campaigns').select('*').in('status', ['active']),
    'score: load campaigns',
  ) as CampaignRow[];

  if (campaigns.length === 0) return { scored: 0 };

  const since = new Date(Date.now() - 14 * DAY).toISOString();
  const outcomes = unwrap(
    await db()
      .from('clip_outcomes')
      .select('campaign_id, submitted_at, approved, views, paid_at')
      .gte('submitted_at', since),
    'score: load outcomes',
  ) as Outcome[];

  const byCampaign = new Map<string, Outcome[]>();
  for (const o of outcomes) {
    const list = byCampaign.get(o.campaign_id) ?? [];
    list.push(o);
    byCampaign.set(o.campaign_id, list);
  }

  const now = Date.now();
  const hot48 = now - 2 * DAY;

  // Board-relative reference arrays. null rate -> 0 (bottom); null min-views ->
  // 0 which correctly reads as "no minimum = easiest".
  const allRates = campaigns.map((c) => c.rate_cpm ?? 0);
  const allMins = campaigns.map((c) => c.min_views ?? 0);
  const recentClips = (id: string) => (byCampaign.get(id) ?? []).filter((o) => new Date(o.submitted_at).getTime() > hot48);
  const allClipCounts = campaigns.map((c) => recentClips(c.id).length);
  const haveOutcomes = allClipCounts.some((n) => n > 0);

  const updates: Array<Pick<CampaignRow, 'id' | 'heat' | 'effort_score' | 'effort_label'>> = [];

  for (const c of campaigns) {
    const platformCount = Array.isArray(c.platforms) ? c.platforms.length : 0;
    const reach = clamp((platformCount / 4) * 100) / 100; // 0..1, capped at 4 platforms

    // ---------------------------------------------------------------- heat
    const ratePct = percentile(c.rate_cpm ?? 0, allRates); // hotter when the rate beats the board
    const freshDays = (now - new Date(c.first_seen_at).getTime()) / DAY;
    const fresh = clamp(100 - freshDays * 8) / 100; // brand new = hot, ~12 days = cold
    const hoursLeft = c.ends_at ? (new Date(c.ends_at).getTime() - now) / 3_600_000 : Infinity;
    const urgency = hoursLeft === Infinity ? 0.3 : clamp(100 - hoursLeft / 3) / 100; // closing soon = hot

    const heatParts: Array<[number, number]> = [
      [ratePct, 0.35],
      [fresh, 0.25],
      [urgency, 0.15],
      [reach, 0.1],
    ];
    // A pool people are piling into is, by definition, hot/crowded.
    if (c.budget_used_pct != null) heatParts.push([clamp(c.budget_used_pct) / 100, 0.15]);
    // Once clippers report in, recent clip volume is the truest heat signal.
    if (haveOutcomes) heatParts.push([percentile(recentClips(c.id).length, allClipCounts), 0.4]);

    const heat = Math.round(clamp(blend(heatParts) * 100));

    // -------------------------------------------------------------- effort
    // Easier when the view minimum is low relative to the board.
    const viewEase = 1 - percentile(c.min_views ?? 0, allMins);
    const effortParts: Array<[number, number]> = [
      [viewEase, 0.5],
      [reach, 0.1],
    ];
    // More budget still on the table = more likely you actually get paid.
    if (c.budget_used_pct != null) effortParts.push([1 - clamp(c.budget_used_pct) / 100, 0.25]);
    // A known, fast payout cycle is easier than an unknown one.
    if (c.payout_days != null) effortParts.push([clamp(100 - (c.payout_days / 45) * 100) / 100, 0.15]);

    // Real approval rate, once we have enough of it, dominates effort.
    const mine = byCampaign.get(c.id) ?? [];
    const decided = mine.filter((o) => o.approved !== null);
    if (decided.length >= 5) {
      const approvalRate = decided.filter((o) => o.approved).length / decided.length;
      effortParts.push([approvalRate, 0.5]);
    }

    const effort = Math.round(clamp(blend(effortParts) * 100));

    updates.push({
      id: c.id,
      heat,
      effort_score: effort,
      effort_label: effort >= 67 ? 'Low' : effort >= 40 ? 'Medium' : 'High',
    });
  }

  for (const u of updates) {
    unwrap(
      await db()
        .from('campaigns')
        .update({ heat: u.heat, effort_score: u.effort_score, effort_label: u.effort_label })
        .eq('id', u.id)
        .select('id'),
      'score: update',
    );
  }

  return { scored: updates.length };
}
