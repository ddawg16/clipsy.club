import { readFileSync } from 'node:fs';
import { config } from '../config.ts';
import { cleanText, safeFetchJson, safeUrl } from '../safety.ts';
import type { RawCampaign, SourceAdapter } from '../types.ts';

/**
 * clipping.net — the FULL campaign board.
 *
 * clipping.net's public showcase endpoint only lists a handful of campaigns.
 * With the operator's permission we index their whole board (~33 active) from a
 * committed snapshot of their authenticated catalogue (data/clippingnet-snapshot.json),
 * captured once from the logged-in portal. We deep-link every card back to
 * clipping.net; we never re-host.
 *
 * NOTE ON BUDGET: clipping.net publishes rates and (for pot campaigns) a total
 * pot, but NEVER a remaining-budget figure anywhere in its data. So unlike
 * Clipster/ClipMarket, clipping.net cards carry no "budget left" bar — we don't
 * invent a number they don't provide.
 *
 * When clipping.net gives us a public feed or API key, point fetchCampaigns at
 * it (the snapshot mapping below is the same shape) and delete the snapshot.
 */

const BASE = 'https://clipping.net';
const SHOWCASE = 'https://clipping.net/api/clip/campaigns';
const DAY = 86_400_000;

interface SnapRow {
  n: string;            // serverName
  s: string;            // slug
  a?: number;           // headline rate ($/100k); 0 = bounty/pot only
  i?: string;           // discord icon "<serverId>/<hash>.png"
  p?: string[];         // platforms
  mv?: number;          // min views
  d?: number;           // days left at capture time
  pv?: number;          // total pot (pot campaigns only) — NOT remaining
  bo?: number;          // bounties only
  b?: string;           // brief URL
  tg?: string;          // category tag
}
interface Snapshot { generatedAt?: string; campaigns?: SnapRow[] }

const cleanName = (n: string) => cleanText(n)?.replace(/\s*x\s*Clipping$/i, '').trim() || cleanText(n);

function fromSnapshot(): RawCampaign[] {
  const url = new URL('../../data/clippingnet-snapshot.json', import.meta.url);
  const snap = JSON.parse(readFileSync(url, 'utf8')) as Snapshot;
  const rows = Array.isArray(snap.campaigns) ? snap.campaigns : [];
  const base = snap.generatedAt ? new Date(snap.generatedAt).getTime() : Date.now();
  const baseMs = Number.isFinite(base) ? base : Date.now();

  return rows
    .map((r): RawCampaign | null => {
      const name = cleanName(r.n);
      if (!name || !r.s) return null;

      const rateCpm = typeof r.a === 'number' && r.a > 0 ? r.a : null;
      const platforms = (Array.isArray(r.p) ? r.p : []).map((p) => String(p).toLowerCase()).filter(Boolean);
      const minViews = typeof r.mv === 'number' && r.mv > 0 ? r.mv : null;
      // Count down from when the snapshot was taken, so deadlines stay honest.
      const endsAt = typeof r.d === 'number' && r.d > 0 && r.d < 3650 ? new Date(baseMs + r.d * DAY).toISOString() : null;
      const icon = r.i ? safeUrl(`https://cdn.discordapp.com/icons/${r.i}`) : null;

      return {
        sourceId: 'clippingnet',
        externalId: r.s,
        name,
        brand: null,
        url: safeUrl(`${BASE}/dashboard/campaigns/${r.s}`),
        rateCpm,
        minViews,
        platforms,
        endsAt,
        status: 'active',
        payoutDays: null,
        iconUrl: icon,
        briefUrl: safeUrl(r.b ?? null),
        platformRates: rateCpm != null ? platforms.map((p) => ({ platform: p, rate: rateCpm })) : [],
        // clipping.net exposes no remaining budget — leave it null rather than fake it.
        budgetTotal: null,
        budgetUsedPct: null,
        payoutMethod: null,
        category: cleanText(r.tg ?? null, 40),
        raw: { via: 'clippingnet-snapshot', slug: r.s, pot: typeof r.pv === 'number' ? r.pv : null },
      };
    })
    .filter((c): c is RawCampaign => c !== null);
}

/** Fallback: their small PUBLIC showcase feed, if the snapshot is ever unreadable. */
async function fromShowcase(): Promise<RawCampaign[]> {
  const json = (await safeFetchJson(SHOWCASE, {
    headers: { Accept: 'application/json', 'User-Agent': config.userAgent },
  })) as { campaigns?: Array<Record<string, unknown>> };
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  const money = (v: unknown): number | null => {
    if (typeof v !== 'string' && typeof v !== 'number') return null;
    const n = Number(String(v).replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  return (json?.campaigns ?? [])
    .map((c): RawCampaign | null => {
      const name = cleanName(String(c.name ?? ''));
      if (!name) return null;
      const rates = (Array.isArray(c.rates) ? c.rates : []).map((x: any) => money(x?.r)).filter((n): n is number => n !== null);
      const platforms = (Array.isArray(c.platforms) ? c.platforms : []).map((p) => cleanText(p, 40)).filter((p): p is string => p !== null);
      const days = typeof c.days === 'number' && c.days > 0 && c.days < 3650 ? c.days : null;
      return {
        sourceId: 'clippingnet', externalId: slug(name), name, brand: null, url: `${BASE}/`,
        rateCpm: rates.length ? Math.max(...rates) : null,
        minViews: typeof c.minViews === 'number' ? c.minViews : null,
        platforms, endsAt: days ? new Date(Date.now() + days * DAY).toISOString() : null,
        status: 'active', payoutDays: null, iconUrl: safeUrl((c.icon as string) ?? null), briefUrl: null,
        platformRates: [], budgetTotal: null, budgetUsedPct: null, payoutMethod: null,
        category: cleanText((c.mode as string) ?? null, 40), raw: { via: 'clippingnet-showcase' },
      };
    })
    .filter((c): c is RawCampaign => c !== null);
}

export const clippingnet: SourceAdapter = {
  id: 'clippingnet',
  label: 'via clipping.net',

  enabled() {
    return true;
  },

  async fetchCampaigns(): Promise<RawCampaign[]> {
    try {
      const rows = fromSnapshot();
      if (rows.length > 0) return rows;
    } catch (err) {
      console.error(`[clippingnet] snapshot unreadable, falling back to public showcase: ${err instanceof Error ? err.message : String(err)}`);
    }
    return fromShowcase();
  },
};
