'use client';

import { useMemo, useState } from 'react';
import type { Campaign, SortKey } from '@/lib/types';
import { CampaignCard } from './CampaignCard';

const TABS: Array<{ id: SortKey; label: string; note: string }> = [
  {
    id: 'hot',
    label: 'Hottest',
    note: 'Heat = 45% where the rate sits against the rest of the board, 35% how recently it appeared, 20% how close it is to closing. Hot means competitive, not easy.',
  },
  {
    id: 'easy',
    label: 'Easiest to get paid',
    note: 'Effort = 55% how low the view minimum is, 45% how fast the payout cycle is. Start here if you have never been paid for a clip.',
  },
  {
    id: 'rate',
    label: 'Best rate',
    note: 'Straight CPM, highest first. Worth saying: the highest rate is almost never the easiest money, and it usually carries the highest view minimum.',
  },
  {
    id: 'picks',
    label: 'Top team picks',
    note: 'Chosen by hand, not by the algorithm — low view minimums, readable briefs, and payouts that actually land. Our picks come first, then the rest by heat.',
  },
];

const PLATFORM_LABEL: Record<string, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  x: 'X',
  twitter: 'X',
};
const label = (p: string) => PLATFORM_LABEL[p.toLowerCase()] ?? p;

const PAGE = 25;

function sortCampaigns(list: Campaign[], key: SortKey): Campaign[] {
  const copy = [...list];
  switch (key) {
    case 'easy':
      return copy.sort((a, b) => b.effortScore - a.effortScore);
    case 'rate':
      return copy.sort((a, b) => (b.rateCpm ?? -1) - (a.rateCpm ?? -1));
    case 'picks':
      // Team picks first (by their hand-set rank), everything else by heat.
      return copy.sort((a, b) => {
        if (a.teamPick !== b.teamPick) return a.teamPick ? -1 : 1;
        if (a.teamPick && b.teamPick) return (a.teamRank ?? 99) - (b.teamRank ?? 99);
        return b.heat - a.heat;
      });
    default:
      return copy.sort((a, b) => b.heat - a.heat);
  }
}

function Chip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      style={{
        padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
        fontFamily: 'var(--font-display), sans-serif', cursor: 'pointer', minHeight: 36,
        border: `1.5px solid ${on ? 'var(--accent)' : 'var(--cream-line)'}`,
        background: on ? 'var(--accent)' : 'transparent',
        color: on ? 'var(--accent-ink)' : 'var(--ink-soft)',
      }}
    >
      {label}
    </button>
  );
}

export function CampaignHub({ campaigns, freshness }: { campaigns: Campaign[]; freshness?: string }) {
  const [sort, setSort] = useState<SortKey>('hot');
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const platforms = useMemo(
    () => [...new Set(campaigns.flatMap((c) => c.platforms))].filter(Boolean).sort(),
    [campaigns],
  );
  const sources = useMemo(
    () => [...new Set(campaigns.map((c) => c.source))].filter(Boolean).sort(),
    [campaigns],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (platform && !c.platforms.includes(platform)) return false;
      if (source && c.source !== source) return false;
      return true;
    });
  }, [campaigns, query, platform, source]);

  const rows = useMemo(() => sortCampaigns(filtered, sort), [filtered, sort]);
  const visible = showAll ? rows : rows.slice(0, PAGE);
  const active = TABS.find((t) => t.id === sort) ?? TABS[0];
  const filtersOn = Boolean(query || platform || source);
  const noPicks = sort === 'picks' && !campaigns.some((c) => c.teamPick);

  return (
    <div id="hub" className="wrap" style={{ paddingTop: 18, paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 20, flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 19, fontWeight: 700 }}>Campaign Hub</h2>
        {freshness && (
          <span className="pill pill-neutral">
            <span className="dot" />
            Board updated {freshness}
          </span>
        )}
      </div>

      {/* search + platform */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowAll(false); }}
          placeholder="Search campaigns"
          aria-label="Search campaigns by name"
          style={{
            padding: '9px 13px', borderRadius: 9, minHeight: 40, minWidth: 210, flex: '0 1 260px',
            border: '1.5px solid var(--cream-line)', background: 'var(--cream-card)',
            color: 'var(--ink)', fontSize: 14, fontFamily: 'inherit',
          }}
        />
        {platforms.length > 0 && (
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="eyebrow" style={{ fontSize: 11 }}>Platform</span>
            {platforms.map((p) => (
              <Chip key={p} label={label(p)} on={platform === p} onClick={() => { setPlatform(platform === p ? null : p); setShowAll(false); }} />
            ))}
          </div>
        )}
      </div>

      {/* sort */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="eyebrow" style={{ fontSize: 11 }}>Sort by</span>
        <div role="tablist" aria-label="Sort campaigns" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TABS.map((tab) => {
            const on = tab.id === sort;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={on}
                onClick={() => setSort(tab.id)}
                style={{
                  padding: '9px 16px', borderRadius: 999, fontFamily: 'var(--font-display), sans-serif',
                  fontWeight: 600, fontSize: 13.5, cursor: 'pointer', minHeight: 40,
                  border: `1.5px solid ${on ? 'var(--ink)' : 'var(--cream-line)'}`,
                  background: on ? 'var(--ink)' : 'transparent',
                  color: on ? 'var(--cream)' : 'var(--ink-soft)',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* one-line explanation of the active sort */}
      <p style={{ fontSize: 13, color: 'var(--ink-faint)', margin: 0, maxWidth: 700, lineHeight: 1.5 }}>{active.note}</p>

      {/* count + network + clear, on one quiet row */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13.5, color: 'var(--ink-faint)' }}>
          Showing {visible.length} of {rows.length}
          {rows.length !== campaigns.length ? ` (${campaigns.length} total)` : ''}
        </span>
        {sources.length > 1 && (
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="eyebrow" style={{ fontSize: 11 }}>Network</span>
            {sources.map((s) => (
              <Chip key={s} label={s} on={source === s} onClick={() => { setSource(source === s ? null : s); setShowAll(false); }} />
            ))}
          </div>
        )}
        {filtersOn && (
          <button
            onClick={() => { setQuery(''); setPlatform(null); setSource(null); setShowAll(false); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px', fontSize: 13.5, fontWeight: 600, color: 'var(--accent)', fontFamily: 'inherit' }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* results */}
      {visible.length === 0 ? (
        <div className="card">
          <p className="empty">
            {campaigns.length === 0
              ? 'No live campaigns yet. The board fills the first time the ingest job runs — until then this is honestly empty rather than padded with placeholders.'
              : noPicks
                ? 'No team picks are set right now. Switch to Hottest or Easiest to get paid to see the full board.'
                : 'Nothing matches those filters. Clear them and try a wider search.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(252px, 1fr))', gap: 16 }}>
          {visible.map((c) => (
            <CampaignCard key={c.id} c={c} pick={sort === 'picks' && c.teamPick} />
          ))}
        </div>
      )}

      {!showAll && rows.length > PAGE && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
          <button onClick={() => setShowAll(true)} className="btn btn-ghost" style={{ background: 'var(--cream-card)', fontSize: 15, padding: '13px 26px' }}>
            Show all {rows.length} campaigns
          </button>
        </div>
      )}

      <p style={{ fontSize: 13, color: 'var(--ink-faint)', margin: 0, maxWidth: '68ch', lineHeight: 1.55 }}>
        Heat is our own score — how hard a campaign is running. Effort is how easy it is to actually get approved and
        paid. Both scores sharpen as our clippers report outcomes back; for now they run on public signals.
      </p>
    </div>
  );
}
