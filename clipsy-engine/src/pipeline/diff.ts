import type { CampaignRow, RawCampaign, WireEvent } from '../types.ts';

const money = (n: number | null | undefined) => (n === null || n === undefined ? '—' : `$${n}/100k`);
const views = (n: number | null | undefined) =>
  n === null || n === undefined ? 'no minimum' : `${Intl.NumberFormat('en-US').format(n)} views`;

/**
 * The whole Wire is this function. Compare what a source says now against what
 * it said last run; every meaningful field change becomes an event.
 *
 * Pure and side-effect free on purpose — it is the piece worth unit testing.
 */
export function diffCampaign(
  before: Pick<CampaignRow, 'rate_cpm' | 'min_views' | 'status' | 'ends_at'> | null,
  after: RawCampaign,
  ctx: { campaignId: string; sourceLabel: string },
): WireEvent[] {
  const base = { campaign_id: ctx.campaignId, source_id: after.sourceId };
  const events: WireEvent[] = [];

  // First time we have ever seen this campaign.
  if (!before) {
    return [
      {
        ...base,
        type: 'new_drop',
        headline: `New drop — ${after.name} live ${ctx.sourceLabel}${
          after.rateCpm ? ` at ${money(after.rateCpm)}` : ''
        }`,
        old_value: null,
        new_value: after.rateCpm != null ? money(after.rateCpm) : null,
        severity: 'good',
      },
    ];
  }

  // Rate moves — the reason anyone reads the Wire.
  const oldRate = before.rate_cpm;
  const newRate = after.rateCpm ?? null;
  if (oldRate != null && newRate != null && Math.abs(newRate - oldRate) >= 0.01) {
    const up = newRate > oldRate;
    events.push({
      ...base,
      type: up ? 'rate_up' : 'rate_down',
      headline: `Rate ${up ? 'bump' : 'cut'} — ${after.name} ${up ? 'up' : 'down'} to ${money(
        newRate,
      )} (was ${money(oldRate)})`,
      old_value: money(oldRate),
      new_value: money(newRate),
      severity: up ? 'good' : 'warn',
    });
  }

  // Minimums moving is a rate cut wearing a hat.
  const oldMin = before.min_views;
  const newMin = after.minViews ?? null;
  if (oldMin !== newMin && (oldMin != null || newMin != null)) {
    const harder = (newMin ?? 0) > (oldMin ?? 0);
    events.push({
      ...base,
      type: harder ? 'min_views_up' : 'min_views_down',
      headline: `Qualifier ${harder ? 'raised' : 'lowered'} — ${after.name} now needs ${views(newMin)} (was ${views(
        oldMin,
      )})`,
      old_value: views(oldMin),
      new_value: views(newMin),
      severity: harder ? 'warn' : 'good',
    });
  }

  // Closed on the source's own say-so.
  if (before.status === 'active' && after.status === 'closed') {
    events.push({
      ...base,
      type: 'closed',
      headline: `Closed — ${after.name} is no longer accepting clips`,
      old_value: 'active',
      new_value: 'closed',
      severity: 'warn',
    });
  }

  // Deadline pulled forward = the pool is capping out early.
  if (before.ends_at && after.endsAt) {
    const prev = new Date(before.ends_at).getTime();
    const next = new Date(after.endsAt).getTime();
    if (next < prev - 60 * 60 * 1000) {
      events.push({
        ...base,
        type: 'closing',
        headline: `Closing early — ${after.name} moved its deadline up`,
        old_value: before.ends_at,
        new_value: after.endsAt,
        severity: 'warn',
      });
    }
  }

  return events;
}

/** A campaign that vanished from the source feed without being marked closed. */
export function pulledEvent(campaign: CampaignRow, sourceLabel: string): WireEvent {
  return {
    campaign_id: campaign.id,
    source_id: campaign.source_id,
    type: 'pulled',
    headline: `Pulled without notice — ${campaign.name} disappeared from ${sourceLabel} with no closing announcement`,
    old_value: 'active',
    new_value: 'pulled',
    severity: 'warn',
  };
}
