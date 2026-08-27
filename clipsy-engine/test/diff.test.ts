import { diffCampaign, pulledEvent } from '../src/pipeline/diff.ts';
import { normalizeCampaign, findCampaignArrays, normalizeRate } from '../src/sources/normalize.ts';

let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { console.log('FAIL ' + m); fail++; } else console.log('ok   ' + m); };

const ctx = { campaignId: 'c1', sourceLabel: 'via clipping.net' };
const base = { rate_cpm: 30, min_views: 5000, status: 'active', ends_at: '2026-09-10T00:00:00Z' };
const raw = { sourceId: 'clippingnet', externalId: 'x', name: 'Northline Records', rateCpm: 38, minViews: 5000, status: 'active' as const, endsAt: '2026-09-10T00:00:00Z' };

ok(diffCampaign(null, raw, ctx)[0].type === 'new_drop', 'first sighting -> new_drop');
const up = diffCampaign(base, raw, ctx);
ok(up.length === 1 && up[0].type === 'rate_up' && up[0].severity === 'good', 'rate increase -> rate_up/good');
ok(up[0].headline.includes('$38/100k') && up[0].headline.includes('was $30'), 'headline carries both rates');
ok(diffCampaign(base, { ...raw, rateCpm: 22 }, ctx)[0].type === 'rate_down', 'rate cut -> rate_down');
ok(diffCampaign(base, { ...raw, rateCpm: 30 }, ctx).length === 0, 'no change -> no events');
ok(diffCampaign(base, { ...raw, rateCpm: 30, minViews: 25000 }, ctx)[0].type === 'min_views_up', 'qualifier raised');
ok(diffCampaign(base, { ...raw, rateCpm: 30, status: 'closed' }, ctx)[0].type === 'closed', 'status closed');
ok(diffCampaign(base, { ...raw, rateCpm: 30, endsAt: '2026-08-28T00:00:00Z' }, ctx)[0].type === 'closing', 'deadline pulled forward');
ok(pulledEvent({ id: 'c1', source_id: 'clippingnet', name: 'Halo' } as any, 'via clipping.net').type === 'pulled', 'vanished -> pulled');

ok(normalizeRate(3.8, 1000) === 380, 'per-1k rate scales to per-100k');
ok(normalizeRate('$45') === 45, 'strips currency symbol');
const n = normalizeCampaign('whop', { id: 7, title: 'Kickstart', cpm: 18, minimum_views: '10000', link: '/c/7', status: 'ACTIVE' }, { baseUrl: 'https://whop.com' });
ok(n?.name === 'Kickstart' && n?.rateCpm === 18 && n?.minViews === 10000, 'loose json -> normalized');
ok(n?.url === 'https://whop.com/c/7', 'relative url absolutized');
ok(normalizeCampaign('whop', { foo: 1 }) === null, 'junk rejected');
const arrs = findCampaignArrays({ data: { page: 1, results: [{ id: 1, title: 'A', rate: 10 }, { id: 2, title: 'B', rate: 20 }] } });
ok(arrs.length === 1 && arrs[0].length === 2, 'finds nested campaign array');

console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILED`);
process.exit(fail ? 1 : 0);
