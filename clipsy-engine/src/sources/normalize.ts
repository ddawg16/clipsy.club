import { cleanText, safeUrl, sanitizeObject } from '../safety.ts';
import type { RawCampaign, SourceId } from '../types.ts';

type Loose = Record<string, unknown>;

const RATE_KEYS = ['rate', 'cpm', 'rate_cpm', 'rateCpm', 'price_per_100k', 'pricePer100k', 'payout_rate', 'reward_rate'];
const NAME_KEYS = ['name', 'title', 'campaign_name', 'campaignName', 'headline'];
const ID_KEYS = ['id', 'uuid', 'slug', 'campaign_id', 'campaignId', 'external_id'];
const URL_KEYS = ['url', 'link', 'permalink', 'href', 'campaign_url'];
const MIN_KEYS = ['min_views', 'minViews', 'minimum_views', 'view_minimum', 'threshold'];
const END_KEYS = ['ends_at', 'endsAt', 'end_date', 'endDate', 'expires_at', 'deadline', 'closes_at'];
const BRAND_KEYS = ['brand', 'brand_name', 'company', 'advertiser', 'client'];
const STATUS_KEYS = ['status', 'state'];

function pick(obj: Loose, keys: string[]): unknown {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
  }
  return undefined;
}

function toNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = Number(v.replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toIso(v: unknown): string | null {
  if (!v) return null;
  const d = new Date(typeof v === 'number' && v < 1e12 ? v * 1000 : (v as string | number));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Rates arrive in wildly different units across sources: some quote per 1k
 * views, some per 1M, some as a raw dollar amount. `perViews` says what the
 * source's number is denominated in; we store everything as $ per 100k.
 */
export function normalizeRate(value: unknown, perViews = 100_000): number | null {
  const n = toNumber(value);
  if (n === null) return null;
  return Math.round((n * (100_000 / perViews)) * 100) / 100;
}

/** Best-effort mapping of one loose JSON object into a RawCampaign. */
export function normalizeCampaign(
  sourceId: SourceId,
  obj: Loose,
  opts: { perViews?: number; baseUrl?: string } = {},
): RawCampaign | null {
  const externalId = pick(obj, ID_KEYS);
  const name = pick(obj, NAME_KEYS);
  if (externalId === undefined || typeof name !== 'string') return null;

  // Third-party URL: only http(s) survives. See safety.ts for why this matters.
  const url = safeUrl(pick(obj, URL_KEYS), opts.baseUrl);

  const status = String(pick(obj, STATUS_KEYS) ?? 'active').toLowerCase();

  // Third-party text: control characters stripped, length clamped.
  const safeName = cleanText(name);
  if (!safeName) return null;

  const safeExternalId = cleanText(String(externalId), 200);
  if (!safeExternalId) return null;

  return {
    sourceId,
    externalId: safeExternalId,
    name: safeName,
    brand: cleanText(pick(obj, BRAND_KEYS)),
    url,
    rateCpm: normalizeRate(pick(obj, RATE_KEYS), opts.perViews ?? 100_000),
    minViews: toNumber(pick(obj, MIN_KEYS)),
    platforms: Array.isArray(obj.platforms) ? (obj.platforms as string[]).map(String) : [],
    endsAt: toIso(pick(obj, END_KEYS)),
    status: ['closed', 'ended', 'expired', 'complete', 'completed'].includes(status) ? 'closed' : 'active',
    payoutDays: toNumber(pick(obj, ['payout_days', 'payoutDays', 'payout_period_days'])),
    raw: sanitizeObject(obj) ?? undefined,
  };
}

/**
 * Walk an arbitrary JSON blob and return every array that looks like a list of
 * campaigns. Used by `npm run discover` and by adapters pointed at an
 * undocumented endpoint whose envelope shape you have not pinned down yet.
 */
export function findCampaignArrays(json: unknown, depth = 0): Loose[][] {
  if (depth > 6 || json === null || typeof json !== 'object') return [];
  const out: Loose[][] = [];

  if (Array.isArray(json)) {
    const objects = json.filter((x): x is Loose => !!x && typeof x === 'object' && !Array.isArray(x));
    if (objects.length > 0) {
      const scored = objects.filter(
        (o) => pick(o, NAME_KEYS) !== undefined && (pick(o, RATE_KEYS) !== undefined || pick(o, ID_KEYS) !== undefined),
      );
      if (scored.length >= Math.max(1, objects.length * 0.5)) out.push(objects);
    }
    for (const item of json) out.push(...findCampaignArrays(item, depth + 1));
    return out;
  }

  for (const value of Object.values(json as Loose)) {
    out.push(...findCampaignArrays(value, depth + 1));
  }
  return out;
}
