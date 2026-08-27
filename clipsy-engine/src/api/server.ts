import express from 'express';
import { config } from '../config.ts';
import { db, unwrap } from '../db.ts';
import type { CampaignRow } from '../types.ts';

/**
 * The shape the campaigns query actually returns — a subset of CampaignRow.
 * Supabase types embedded relations as arrays, so `sources` can arrive either
 * way depending on the join; handle both rather than casting the truth away.
 */
type CampaignListRow = Pick<
  CampaignRow,
  'id' | 'name' | 'url' | 'rate_cpm' | 'min_views' | 'platforms' | 'ends_at' | 'heat' | 'effort_label' | 'effort_score' | 'payout_days' | 'source_id'
> & { sources: { name: string } | { name: string }[] | null };
import { boundedDate, safeUrl } from '../safety.ts';
import { cors, fail, int, isUuid, rateLimit, requireWriteToken, securityHeaders, str } from './guard.ts';

const app = express();

// Behind Vercel/Railway/Fly there is exactly one proxy hop. Setting this to a
// number rather than `true` stops a client from spoofing X-Forwarded-For and
// walking around the rate limiter.
app.set('trust proxy', 1);

app.use(securityHeaders);
app.use(cors);
app.use(express.json({ limit: '32kb' })); // no reason to accept a large body

const readLimit = rateLimit({ windowMs: 60_000, max: 120 });
const writeLimit = rateLimit({ windowMs: 60_000, max: 30 });

/** GET /api/campaigns?sort=hot|easy|rate|ending — feeds the Campaign Hub. */
app.get('/api/campaigns', readLimit, async (req, res) => {
  const sortParam = String(req.query.sort ?? 'hot');
  const limit = int(req.query.limit ?? 50, 1, 200) ?? 50;

  // Allow-list the sort key. Never interpolate user input into an order clause.
  const order: Record<string, { column: string; ascending: boolean }> = {
    hot: { column: 'heat', ascending: false },
    easy: { column: 'effort_score', ascending: false },
    rate: { column: 'rate_cpm', ascending: false },
    ending: { column: 'ends_at', ascending: true },
  };
  const sort = Object.hasOwn(order, sortParam) ? sortParam : 'hot';
  const o = order[sort];

  try {
    const rows = unwrap(
      await db()
        .from('campaigns')
        .select(
          'id, name, url, rate_cpm, min_views, platforms, ends_at, heat, effort_label, effort_score, payout_days, source_id, sources(name)',
        )
        .eq('status', 'active')
        .order(o.column, { ascending: o.ascending, nullsFirst: false })
        .limit(limit),
      'api: campaigns',
    ) as unknown as CampaignListRow[];

    res.set('Cache-Control', 'public, max-age=60');
    res.json({
      sort,
      count: rows.length,
      campaigns: rows.map((c) => ({
        id: c.id,
        name: c.name,
        source: (Array.isArray(c.sources) ? c.sources[0]?.name : c.sources?.name) ?? c.source_id,
        url: c.url,
        rateCpm: c.rate_cpm,
        minViews: c.min_views,
        platforms: c.platforms,
        endsAt: c.ends_at,
        heat: c.heat,
        effort: c.effort_label,
        payoutDays: c.payout_days,
      })),
    });
  } catch (err) {
    fail(res, err, 'campaigns');
  }
});

/** GET /api/wire?limit=40 — the live feed. */
app.get('/api/wire', readLimit, async (req, res) => {
  const limit = int(req.query.limit ?? 40, 1, 200) ?? 40;
  try {
    const rows = unwrap(
      await db()
        .from('wire_events')
        .select('id, type, headline, severity, created_at, campaigns(name, url)')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(limit),
      'api: wire',
    );
    res.set('Cache-Control', 'public, max-age=30');
    res.json({ events: rows });
  } catch (err) {
    fail(res, err, 'wire');
  }
});

/**
 * POST /api/outcomes — your Discord bot reports a clip result.
 *
 * Authenticated because this table IS the scoring input: an open endpoint here
 * would let anyone rewrite which campaigns your site calls "easy money".
 */
app.post('/api/outcomes', writeLimit, requireWriteToken, async (req, res) => {
  const body = req.body ?? {};
  const campaignId = body.campaignId;
  if (!isUuid(campaignId)) {
    res.status(400).json({ error: 'campaignId must be a uuid' });
    return;
  }

  const approved = typeof body.approved === 'boolean' ? body.approved : null;
  const views = body.views == null ? null : int(body.views, 0, 100_000_000_000);
  const clipperId = body.clipperId == null ? null : str(body.clipperId, 64);
  const rejectedReason = body.rejectedReason == null ? null : str(body.rejectedReason, 280);

  // Bounded: an out-of-range date would silently skew payout-speed scoring.
  let paidAt: string | null = null;
  if (body.paidAt != null) {
    paidAt = boundedDate(body.paidAt, { pastDays: 730, futureDays: 1 });
    if (!paidAt) {
      res.status(400).json({ error: 'paidAt must be a date within the last 2 years' });
      return;
    }
  }

  try {
    unwrap(
      await db()
        .from('clip_outcomes')
        .insert({
          campaign_id: campaignId,
          clipper_id: clipperId,
          approved,
          views,
          paid_at: paidAt,
          rejected_reason: rejectedReason,
        })
        .select('id'),
      'api: outcomes',
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    fail(res, err, 'outcomes');
  }
});

/** POST /api/wire/manual — payout problems, the one category nothing can scrape. */
app.post('/api/wire/manual', writeLimit, requireWriteToken, async (req, res) => {
  const body = req.body ?? {};
  const headline = str(body.headline, 500);
  if (!headline) {
    res.status(400).json({ error: 'headline required (1-500 chars)' });
    return;
  }
  if (body.campaignId != null && !isUuid(body.campaignId)) {
    res.status(400).json({ error: 'campaignId must be a uuid' });
    return;
  }
  const severity = ['info', 'good', 'warn'].includes(body.severity) ? body.severity : 'warn';

  try {
    unwrap(
      await db()
        .from('wire_events')
        .insert({
          campaign_id: body.campaignId ?? null,
          type: 'payout_issue',
          headline,
          severity,
          published: true,
        })
        .select('id'),
      'api: manual wire',
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    fail(res, err, 'manual-wire');
  }
});

/**
 * POST /api/submissions — public campaign tip-off. Unauthenticated by design,
 * but heavily limited and it only ever lands in a moderation queue.
 */
app.post('/api/submissions', rateLimit({ windowMs: 3_600_000, max: 10 }), async (req, res) => {
  const body = req.body ?? {};
  // safeUrl rejects javascript:/data:/credentialed URLs, not just non-https.
  const rawUrl = safeUrl(str(body.url, 500));
  if (!rawUrl || !rawUrl.startsWith('https://')) {
    res.status(400).json({ error: 'https url required' });
    return;
  }
  try {
    unwrap(
      await db()
        .from('campaign_submissions')
        .insert({
          raw_url: rawUrl,
          submitted_by: body.submittedBy == null ? null : str(body.submittedBy, 64),
          notes: body.notes == null ? null : str(body.notes, 500),
          status: 'pending',
        })
        .select('id'),
      'api: submissions',
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    fail(res, err, 'submissions');
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

app.listen(config.port, () => {
  console.log(`clipsy-engine api on :${config.port}`);
  if (!config.apiWriteToken) console.warn('WARNING: API_WRITE_TOKEN unset — write routes will refuse everything.');
  if (config.allowedOrigins.length === 0) console.warn('WARNING: ALLOWED_ORIGINS unset — browser calls will be blocked.');
});
