import { cleanText, safeFetchText, safeUrl } from '../safety.ts';
import type { RawCampaign, SourceAdapter } from '../types.ts';

/**
 * ClipMarket — their PUBLIC campaigns page.
 *
 *   GET https://www.clipmarket.com/campaigns
 *
 * ClipMarket is a Next.js app that server-renders every live campaign straight
 * into the page (the data ships inside the HTML's RSC payload — no login, no
 * XHR). We read that payload and map each campaign INCLUDING its live remaining
 * budget, so the board shows "$X left" and refreshes it on every ingest run —
 * exactly the tracker clipmarket.com shows, mirrored onto clipsy.club. We index
 * and deep-link back to clipmarket.com/campaigns/<slug>; we never re-host.
 *
 * Money fields arrive in CENTS:
 *   budget_amount            total pool          (1000000 -> $10,000)
 *   budget_remaining_amount  what's left         (997194  -> $9,971.94)
 *   rpm_amount               cents per 1k views  (100     -> $1.00/1k = $100/100k)
 */
const PAGE = 'https://www.clipmarket.com/campaigns';
const BASE = 'https://www.clipmarket.com';
// A browser-like UA: ClipMarket server-renders the campaign data into the page,
// and some hosts only ship the full HTML to a browser UA. We read public data
// and deep-link back — same indexing model as every other source here.
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

/** Statuses that mean "not open to clippers right now". */
const CLOSED = new Set(['coming_soon', 'draft', 'ended', 'completed', 'archived', 'paused', 'closed']);

interface Parsed {
  id: string;
  title: string;
  slug: string;
  status: string | null;
  canWaitlist: boolean;
  rpmAmount: number | null;
  budgetAmount: number | null;
  budgetRemaining: number | null;
  platforms: string[];
  thumbnailUrl: string | null;
}

/**
 * Pull campaign objects out of the server-rendered RSC payload. The payload is
 * a JS string literal with escaped quotes; we unescape once, then read each
 * campaign by its stable "id","title","slug" head and grab the fields that sit
 * within the same object window.
 */
function parseCampaigns(html: string): Parsed[] {
  const un = html.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  const head = /"id":"([0-9a-f-]{36})","title":"((?:[^"\\]|\\.)*)","slug":"([a-z0-9-]+)"/g;

  const out: Parsed[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;

  while ((m = head.exec(un)) !== null && out.length < 200) {
    const id = m[1];
    if (seen.has(id)) continue;
    seen.add(id);

    const seg = un.slice(m.index, m.index + 1600);
    const num = (k: string): number | null => {
      const mm = seg.match(new RegExp('"' + k + '":(-?[0-9]+)'));
      return mm ? Number(mm[1]) : null;
    };
    const platRaw = (seg.match(/"permitted_platforms":\[([^\]]*)\]/) ?? [])[1] ?? '';
    const platforms = platRaw
      .split(',')
      .map((p) => p.replace(/"/g, '').trim().toLowerCase())
      .filter(Boolean);
    const statusM = seg.match(/"status":(?:"([a-z_]+)"|null)/);

    out.push({
      id,
      title: m[2].replace(/\\"/g, '"'),
      slug: m[3],
      status: statusM && statusM[1] ? statusM[1] : null,
      canWaitlist: /"can_waitlist":true/.test(seg),
      rpmAmount: num('rpm_amount'),
      budgetAmount: num('budget_amount'),
      budgetRemaining: num('budget_remaining_amount'),
      platforms,
      thumbnailUrl: (seg.match(/"thumbnail_url":"([^"]+)"/) ?? [])[1] ?? null,
    });
  }
  return out;
}

export const clipmarket: SourceAdapter = {
  id: 'clipmarket',
  label: 'via Clipmarket',

  enabled() {
    return true; // public page, nothing to configure
  },

  async fetchCampaigns(): Promise<RawCampaign[]> {
    const html = await safeFetchText(PAGE, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': BROWSER_UA,
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const parsed = parseCampaigns(html);

    // Fail LOUD rather than empty: if the page clearly carried campaign data but
    // we parsed none, their layout changed. Throwing keeps the last-known rows
    // instead of letting the pulled-sweep wipe every ClipMarket campaign.
    if (parsed.length === 0 && html.includes('budget_remaining_amount')) {
      throw new Error('clipmarket: page carried campaigns but parsed 0 (layout changed?)');
    }

    return parsed
      .map((c): RawCampaign | null => {
        const name = cleanText(c.title);
        if (!name || !c.slug) return null;
        // Skip anything not open to clippers yet (coming soon / waitlist).
        if (c.canWaitlist || (c.status && CLOSED.has(c.status))) return null;

        // rpm_amount is cents per 1,000 views -> we store $ per 100,000.
        const rateCpm =
          c.rpmAmount != null && c.rpmAmount > 0 ? Math.round((c.rpmAmount / 100) * 100 * 100) / 100 : null;

        const total = c.budgetAmount != null && c.budgetAmount > 0 ? c.budgetAmount / 100 : null;
        const remaining = c.budgetRemaining != null && c.budgetRemaining >= 0 ? c.budgetRemaining / 100 : null;
        const usedPct =
          total != null && remaining != null
            ? Math.max(0, Math.min(100, Math.round(((total - remaining) / total) * 100)))
            : null;

        const platforms = c.platforms.slice(0, 8);

        return {
          sourceId: 'clipmarket',
          externalId: c.slug || slug(name),
          name,
          brand: null,
          url: safeUrl(`${BASE}/campaigns/${c.slug}`),
          rateCpm,
          minViews: null,
          platforms,
          endsAt: null,
          status: 'active',
          payoutDays: null,
          iconUrl: safeUrl(c.thumbnailUrl),
          briefUrl: null,
          platformRates: rateCpm != null ? platforms.map((p) => ({ platform: p, rate: rateCpm })) : [],
          budgetTotal: total,
          budgetUsedPct: usedPct,
          payoutMethod: null,
          category: null,
          raw: { slug: c.slug, id: c.id, via: 'clipmarket-page' },
        };
      })
      .filter((c): c is RawCampaign => c !== null);
  },
};
