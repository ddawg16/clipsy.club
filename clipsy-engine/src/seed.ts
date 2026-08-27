/**
 * Demo data, so the site can be seen working before any network cooperates.
 *
 *   npm run seed     insert 6 demo campaigns + a few Wire events
 *   npm run unseed   delete every one of them again
 *
 * Everything written here has an external_id starting `demo-`, so removal is
 * exact and nothing real can be caught in it. These are NOT real campaigns —
 * clear them before the site goes in front of clippers.
 */
import { readFileSync } from 'node:fs';
for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && m[2].trim() && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}
const { db, unwrap } = await import('./db.ts');

const day = 86_400_000;
const iso = (d: number) => new Date(Date.now() + d).toISOString();

const DEMO = [
  { external_id: 'demo-1', name: 'Nova Beverage — Launch Push',      source_id: 'direct', rate_cpm: 45, min_views: null,  ends_at: iso(13 * day), heat: 88, effort_score: 92, effort_label: 'Low',    payout_days: 7,  platforms: ['tiktok', 'reels'] },
  { external_id: 'demo-2', name: 'Northline Records — Artist Drop',  source_id: 'whop',   rate_cpm: 38, min_views: 5000,  ends_at: iso(6 * day),  heat: 94, effort_score: 58, effort_label: 'Medium', payout_days: 14, platforms: ['tiktok', 'shorts'] },
  { external_id: 'demo-3', name: 'Kickstart Energy — Bounty',        source_id: 'whop',   rate_cpm: 18, min_views: 10000, ends_at: iso(2 * day),  heat: 71, effort_score: 86, effort_label: 'Low',    payout_days: 30, platforms: ['tiktok'] },
  { external_id: 'demo-4', name: 'Vertex Gaming — Stream Clips',     source_id: 'whop',   rate_cpm: 26, min_views: 25000, ends_at: iso(18 * day), heat: 66, effort_score: 31, effort_label: 'High',   payout_days: 21, platforms: ['shorts', 'reels'] },
  { external_id: 'demo-5', name: 'Halo Apparel — Drop Week',         source_id: 'direct', rate_cpm: 22, min_views: 5000,  ends_at: iso(4 * day),  heat: 58, effort_score: 64, effort_label: 'Medium', payout_days: 14, platforms: ['reels'] },
  { external_id: 'demo-6', name: 'Riverbend Podcast — Shorts',       source_id: 'direct', rate_cpm: 30, min_views: null,  ends_at: iso(25 * day), heat: 41, effort_score: 81, effort_label: 'Low',    payout_days: 10, platforms: ['shorts', 'tiktok'] },
].map((c) => ({ ...c, url: 'https://clipsy.club/campaigns/' + c.external_id, status: 'active' }));

const WIRE = [
  { type: 'rate_up',      headline: 'Rate bump — Northline Records up to $38/100k (was $30)',                  severity: 'good', old_value: '$30/100k', new_value: '$38/100k' },
  { type: 'new_drop',     headline: 'New drop — Kickstart Energy campaign live via Whop',                      severity: 'good', old_value: null, new_value: '$18/100k' },
  { type: 'min_views_up', headline: 'Qualifier raised — Vertex Gaming now needs 25,000 views (was 10,000)',     severity: 'warn', old_value: '10,000 views', new_value: '25,000 views' },
  { type: 'pulled',       headline: 'Pulled without notice — a campaign vanished from its network with no closing announcement', severity: 'warn', old_value: 'active', new_value: 'pulled' },
];

const mode = process.argv[2] === 'unseed' ? 'unseed' : 'seed';

if (mode === 'unseed') {
  const ids = unwrap(await db().from('campaigns').select('id').like('external_id', 'demo-%'), 'find demo') as { id: string }[];
  if (ids.length) {
    await db().from('wire_events').delete().in('campaign_id', ids.map((r) => r.id));
    unwrap(await db().from('campaigns').delete().like('external_id', 'demo-%').select('id'), 'delete demo');
  }
  console.log(`removed ${ids.length} demo campaigns and their Wire events`);
} else {
  const rows = unwrap(await db().from('campaigns').upsert(DEMO, { onConflict: 'source_id,external_id' }).select('id, external_id'), 'seed campaigns') as { id: string; external_id: string }[];
  const byId = new Map(rows.map((r) => [r.external_id, r.id]));
  const events = WIRE.map((e, i) => ({ ...e, campaign_id: byId.get(`demo-${i + 1}`) ?? null, source_id: 'direct', published: true }));
  await db().from('wire_events').upsert(events, { ignoreDuplicates: true });
  console.log(`seeded ${rows.length} demo campaigns + ${events.length} Wire events`);
  console.log('run `npm run unseed` to remove every one of them before launch');
}
