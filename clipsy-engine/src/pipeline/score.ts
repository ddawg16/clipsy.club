import { db, unwrap } from '../db.ts';
import type { CampaignRow } from '../types.ts';

/**
 * Heat and Effort are the only things on the site a competitor cannot scrape,
 * because they are computed from YOUR clippers' outcomes. Everything else on
 * the board is public data anyone could re-index.
 *
 *   Heat   0..100  how hard this campaign is running right now (high = competitive)
 *   Effort 0..100  how likely you are to actually get approved and paid (high = easy)
 *
 * Both degrade gracefully: with no outcome data yet they fall back to public
 * signals, and get sharper every week your Discord reports back.
 */

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

/** Where `value` sits in `all`, 0..1. Used so scores stay relative to the board. */
function percentile(value: number, all: number[]): number {
  if (all.length === 0) return 0.5;
  const below = all.filter((v) => v < value).length;
  return below / all.length;
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

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
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
  const hot48 = now - 48 * 60 * 60 * 1000;

  const allRates = campaigns.map((c) => c.rate_cpm ?? 0);
  const allClipCounts = campaigns.map(
    (c) => (byCampaign.get(c.id) ?? []).filter((o) => new Date(o.submitted_at).getTime() > hot48).length,
  );
  const allViews = campaigns.map((c) =>
    (byCampaign.get(c.id) ?? [])
      .filter((o) => new Date(o.submitted_at).getTime() > hot48)
      .reduce((sum, o) => sum + (o.views ?? 0), 0),
  );

  const haveOutcomes = allClipCounts.some((n) => n > 0);
  const updates: Array<Pick<CampaignRow, 'id' | 'heat' | 'effort_score' | 'effort_label'>> = [];

  for (const c of campaigns) {
    const mine = byCampaign.get(c.id) ?? [];
    const recent = mine.filter((o) => new Date(o.submitted_at).getTime() > hot48);
    const recentViews = recent.reduce((sum, o) => sum + (o.views ?? 0), 0);

    // ---------------------------------------------------------------- heat
    const freshnessDays = (now - new Date(c.first_seen_at).getTime()) / 86_400_000;
    const freshness = clamp(100 - freshnessDays * 12); // brand new = hot, month old = cold

    const hoursLeft = c.ends_at ? (new Date(c.ends_at).getTime() - now) / 3_600_000 : Infinity;
    const urgency = hoursLeft === Infinity ? 30 : clamp(100 - hoursLeft / 3);

    const ratePct = percentile(c.rate_cpm ?? 0, allRates) * 100;

    let heat: number;
    if (haveOutcomes) {
      heat =
        percentile(recent.length, allClipCounts) * 35 +
        percentile(recentViews, allViews) * 25 +
        (ratePct / 100) * 15 +
        (freshness / 100) * 15 +
        (urgency / 100) * 10;
    } else {
      // No outcome data yet — lean on public signals until the Discord feeds us.
      heat = (ratePct / 100) * 45 + (freshness / 100) * 35 + (urgency / 100) * 20;
    }

    // -------------------------------------------------------------- effort
    const decided = mine.filter((o) => o.approved !== null);
    const approvalRate = decided.length >= 5 ? decided.filter((o) => o.approved).length / decided.length : null;

    const paid = mine.filter((o) => o.paid_at);
    const avgPayDays =
      paid.length >= 3
        ? paid.reduce((sum, o) => sum + (new Date(o.paid_at!).getTime() - new Date(o.submitted_at).getTime()), 0) /
          paid.length /
          86_400_000
        : (c.payout_days ?? null);

    const minViewsEase = c.min_views == null ? 100 : clamp(100 - (c.min_views / 25_000) * 100);
    const payoutEase = avgPayDays == null ? 55 : clamp(100 - (avgPayDays / 45) * 100);

    let effort: number;
    if (approvalRate !== null) {
      effort = approvalRate * 100 * 0.4 + payoutEase * 0.3 + minViewsEase * 0.3;
    } else {
      effort = payoutEase * 0.45 + minViewsEase * 0.55;
    }

    updates.push({
      id: c.id,
      heat: Math.round(clamp(heat)),
      effort_score: Math.round(clamp(effort)),
      effort_label: effort >= 70 ? 'Low' : effort >= 45 ? 'Medium' : 'High',
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
