import { config } from '../config.ts';
import { db, unwrap } from '../db.ts';
import { enabledAdapters } from '../sources/index.ts';
import type { CampaignRow, RawCampaign, WireEvent } from '../types.ts';
import { clampPayload } from '../safety.ts';
import { diffCampaign, pulledEvent } from './diff.ts';

export interface IngestReport {
  source: string;
  fetched: number;
  created: number;
  updated: number;
  pulled: number;
  events: number;
  error?: string;
}

export async function ingestAll(): Promise<IngestReport[]> {
  const reports: IngestReport[] = [];

  for (const adapter of enabledAdapters()) {
    const report: IngestReport = {
      source: adapter.id,
      fetched: 0,
      created: 0,
      updated: 0,
      pulled: 0,
      events: 0,
    };

    try {
      // Ensure this adapter's source row exists, so campaigns never fail the
      // foreign key. This replaces the old manual "run 005_partners.sql" step —
      // any new source self-registers on first run. Never overwrites a source
      // that's already there (ignoreDuplicates), so hand-set names stay.
      unwrap(
        await db()
          .from('sources')
          .upsert({ id: adapter.id, name: adapter.label, kind: 'manual' }, { onConflict: 'id', ignoreDuplicates: true })
          .select('id'),
        `${adapter.id}: ensure source`,
      );

      const fresh = await adapter.fetchCampaigns();
      report.fetched = fresh.length;

      const existing = unwrap(
        await db().from('campaigns').select('*').eq('source_id', adapter.id),
        `${adapter.id}: load existing`,
      ) as CampaignRow[];

      const byExternalId = new Map(existing.map((c) => [c.external_id, c]));
      const seen = new Set<string>();
      const events: WireEvent[] = [];
      const snapshots: Record<string, unknown>[] = [];

      for (const raw of fresh) {
        seen.add(raw.externalId);
        const before = byExternalId.get(raw.externalId) ?? null;
        const row = await upsertCampaign(raw, before);
        if (before) report.updated += 1;
        else report.created += 1;

        events.push(...diffCampaign(before, raw, { campaignId: row.id, sourceLabel: adapter.label }));

        snapshots.push({
          campaign_id: row.id,
          rate_cpm: raw.rateCpm ?? null,
          min_views: raw.minViews ?? null,
          status: raw.status ?? 'active',
          ends_at: raw.endsAt ?? null,
          payload: clampPayload(raw.raw ?? null),
        });
      }

      // Anything active we did NOT see this run. Nobody else reports these.
      const staleCutoff = Date.now() - config.missingRunsBeforePulled * 15 * 60 * 1000;
      for (const c of existing) {
        if (seen.has(c.external_id) || c.status !== 'active') continue;
        if (new Date(c.last_seen_at).getTime() > staleCutoff) continue;

        unwrap(
          await db().from('campaigns').update({ status: 'pulled' }).eq('id', c.id).select('id'),
          'mark pulled',
        );
        events.push(pulledEvent(c, adapter.label));
        report.pulled += 1;
      }

      if (snapshots.length > 0) {
        unwrap(await db().from('campaign_snapshots').insert(snapshots).select('id'), 'insert snapshots');
      }
      if (events.length > 0) {
        // The unique index on (campaign, type, value, hour) absorbs duplicates
        // from a re-run, so a retried cron never double-posts to the Wire.
        const { error } = await db().from('wire_events').upsert(events, { ignoreDuplicates: true });
        if (error && !/duplicate key/i.test(error.message)) throw new Error(`insert wire: ${error.message}`);
        report.events = events.length;
      }

      await db().from('sources').update({ last_run_at: new Date().toISOString(), last_error: null }).eq('id', adapter.id);
    } catch (err) {
      report.error = err instanceof Error ? err.message : String(err);
      await db().from('sources').update({ last_run_at: new Date().toISOString(), last_error: report.error }).eq('id', adapter.id);
    }

    reports.push(report);
  }

  return reports;
}

async function upsertCampaign(raw: RawCampaign, before: CampaignRow | null): Promise<CampaignRow> {
  const payload = {
    source_id: raw.sourceId,
    external_id: raw.externalId,
    name: raw.name,
    brand: raw.brand ?? null,
    url: raw.url ?? null,
    rate_cpm: raw.rateCpm ?? null,
    min_views: raw.minViews ?? null,
    platforms: raw.platforms ?? [],
    ends_at: raw.endsAt ?? null,
    status: raw.status ?? 'active',
    payout_days: raw.payoutDays ?? null,
    icon_url: raw.iconUrl ?? null,
    brief_url: raw.briefUrl ?? null,
    platform_rates: raw.platformRates ?? null,
    budget_total: raw.budgetTotal ?? null,
    budget_used_pct: raw.budgetUsedPct ?? null,
    payout_method: raw.payoutMethod ?? null,
    category: raw.category ?? null,
    last_seen_at: new Date().toISOString(),
    // team_pick / team_note / team_rank are set by hand and deliberately
    // absent here — an upsert must never overwrite a human's curation.
    ...(before ? {} : { first_seen_at: new Date().toISOString() }),
  };

  const rows = unwrap(
    await db().from('campaigns').upsert(payload, { onConflict: 'source_id,external_id' }).select('*'),
    'upsert campaign',
  ) as CampaignRow[];

  return rows[0];
}
