import { config } from '../config.ts';
import { cleanText, safeUrl } from '../safety.ts';
import type { RawCampaign, SourceAdapter } from '../types.ts';

/**
 * Partner campaigns — fed by a Google Sheet you control.
 *
 * WHY THIS EXISTS: partners (other clipping sites, Whop sellers, and Discord-only
 * servers that have no website or API) can't be scraped. So instead of touching
 * code every time one says yes, you keep a Google Sheet. Add a row -> the campaign
 * appears on the board within the hour. Delete the row -> it's gone. Set status to
 * `closed` -> it hides. No code, no database, no AI. It also survives the ingest's
 * "pulled" sweep because it is re-read from the sheet every run.
 *
 * SETUP (one time): publish your sheet as CSV (File -> Share -> Publish to web ->
 * pick the tab -> Comma-separated values), then put that URL in the env var
 * CLIPSY_PARTNERS_CSV_URL (locally in .env, and as a GitHub Actions secret).
 *
 * SHEET COLUMNS (header row, exact names, any order; blank cells fine):
 *   name  url  partner  rate_per_100k  platforms  min_views  category  icon_url  status
 */
const CSV_URL = config.partnersCsvUrl;

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === ',' && !inQ) {
      out.push(cur); cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

export const partners: SourceAdapter = {
  id: 'partners',
  label: 'Partner',

  enabled() {
    return Boolean(CSV_URL);
  },

  async fetchCampaigns(): Promise<RawCampaign[]> {
    if (!CSV_URL) return [];

    const res = await fetch(CSV_URL, {
      headers: { Accept: 'text/csv', 'User-Agent': config.userAgent },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`partners sheet: HTTP ${res.status}`);
    const text = (await res.text()).slice(0, 2_000_000);

    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'));
    const col = (row: string[], name: string): string => {
      const i = header.indexOf(name);
      return i >= 0 && i < row.length ? row[i] : '';
    };

    const out: RawCampaign[] = [];
    for (let r = 1; r < lines.length; r++) {
      const row = parseCsvLine(lines[r]);
      const name = cleanText(col(row, 'name'));
      const url = safeUrl(col(row, 'url'));
      if (!name || !url) continue;

      const status = (col(row, 'status') || 'active').toLowerCase();
      if (status !== 'active') continue;

      const rate = Number(col(row, 'rate_per_100k'));
      const rateCpm = Number.isFinite(rate) && rate > 0 ? rate : null;

      const platforms = col(row, 'platforms')
        .split(',')
        .map((p) => p.trim().toLowerCase())
        .filter(Boolean);

      const minRaw = Number(col(row, 'min_views'));
      const minViews = Number.isFinite(minRaw) && minRaw > 0 ? Math.round(minRaw) : null;

      const partner = cleanText(col(row, 'partner'));

      out.push({
        sourceId: 'partners',
        externalId: slug(partner ? `${partner}-${name}` : name) || slug(url),
        name,
        brand: partner,
        url,
        rateCpm,
        minViews,
        platforms,
        endsAt: null,
        status: 'active',
        payoutDays: null,
        iconUrl: safeUrl(col(row, 'icon_url') || null),
        briefUrl: null,
        platformRates: rateCpm != null ? platforms.map((p) => ({ platform: p, rate: rateCpm })) : [],
        budgetTotal: null,
        budgetUsedPct: null,
        payoutMethod: null,
        category: cleanText(col(row, 'category')),
        raw: { partner, via: 'google-sheet' },
      });
    }
    return out;
  },
};
