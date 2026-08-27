'use client';

import { useMemo, useState } from 'react';
import type { Campaign, SortKey } from '@/lib/types';
import { CampaignCard } from './CampaignCard';
import { safeHref } from '@/lib/safe';

const TABS: Array<{ id: SortKey; label: string; note: string }> = [
  {
    id: 'hot',
    label: 'Hottest',
    note: 'Heat = 45% where the rate sits against every other campaign on the board, 35% how recently it appeared, 20% how close it is to its deadline. High heat means competitive, not easy.',
  },
  {
    id: 'easy',
    label: 'Easiest to get paid',
    note: 'Effort = 55% how low the view minimum is, 45% how fast the payout cycle is. Best place to start if you have never been paid for a clip.',
  },
  {
    id: 'rate',
    label: 'Best rate',
    note: 'Straight CPM, highest first. Worth saying out loud: the highest rate is almost never the easiest money, and it is usually attached to the highest view minimum.',
  },
  {
    id: 'ending',
    label: 'Ending soon',
    note: 'Closing soonest. These pools cap out early more often than they run to the deadline — check the claimed bar before you commit a night.',
  },
];

const EFFORT_STYLE: Record<string, { background: string; color: string }> = {
  Low:    { background: 'rgba(79,154,104,0.20)', color: 'var(--green-ink)' },
  Medium: { background: 'var(--amber-bg)',       color: 'var(--amber-ink)' },
  High:   { background: 'var(--red-bg)',         color: 'var(--red-ink)' },
};

const GRID = '44px minmax(0,1fr) 84px 132px 96px 92px 104px';
const PAGE = 25;

function sortCampaigns(list: Campaign[], key: SortKey): Campaign[] {
  const copy = [...list];
  switch (key) {
    case 'easy': return copy.sort((a, b) => b.effortScore - a.effortScore);
    case 'rate': return copy.sort((a, b) => (b.rateCpm ?? -1) - (a.rateCpm ?? -1));
    case 'ending': return copy.sort((a, b) => {
      const at = a.endsAt ? new Date(a.endsAt).getTime() : Infinity;
      const bt = b.endsAt ? new Date(b.endsAt).getTime() : Infinity;
      return at - bt;
    });
    default: return copy.sort((a, b) => b.heat - a.heat);
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

  return (
    <div id="hub" className="wrap section" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
          <span className="eyebrow">Campaign hub</span>
          <h2 style={{ fontSize: 34, fontWeight: 700 }}>Not every campaign is worth your night.</h2>
          <p style={{ fontSize: 15.5, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
            The board shows you what&rsquo;s open. The hub tells you which ones are actually running hot — and which
            ones will actually pay you without a fight.
          </p>
        </div>
        {freshness && (
          <span className="pill pill-neutral">
            <span className="dot" />
            Board updated {freshness}
          </span>
        )}
      </div>

      {/* sort */}
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
                padding: '10px 18px', borderRadius: 999, fontFamily: 'var(--font-display), sans-serif',
                fontWeight: 600, fontSize: 14, cursor: 'pointer', minHeight: 44,
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 680 }}>
        <p style={{ fontSize: 13.5, color: 'var(--ink-faint)', margin: 0, lineHeight: 1.5 }}>{active.note}</p>
        <p style={{ fontSize: 12.5, color: 'var(--ink-faint)', margin: 0, lineHeight: 1.5, opacity: 0.85 }}>
          Both scores are built to sharpen using approval and payout data from our own clippers. We haven&rsquo;t
          collected enough of that yet, so today they run on public signals only — we&rsquo;d rather say so than imply
          we know more than we do.
        </p>
      </div>

      {/* filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowAll(false); }}
            placeholder="Search campaigns"
            aria-label="Search campaigns by name"
            style={{
              padding: '10px 14px', borderRadius: 10, minHeight: 44, minWidth: 240, flex: '0 1 280px',
              border: '1.5px solid var(--cream-line)', background: 'var(--cream-card)',
              color: 'var(--ink)', fontSize: 14.5, fontFamily: 'inherit',
            }}
          />
          {platforms.length > 0 && (
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="eyebrow" style={{ fontSize: 11 }}>Platform</span>
              {platforms.map((p) => (
                <Chip key={p} label={p} on={platform === p} onClick={() => { setPlatform(platform === p ? null : p); setShowAll(false); }} />
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {sources.length > 1 && (
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="eyebrow" style={{ fontSize: 11 }}>Network</span>
              {sources.map((s) => (
                <Chip key={s} label={s} on={source === s} onClick={() => { setSource(source === s ? null : s); setShowAll(false); }} />
              ))}
            </div>
          )}
          <span style={{ fontSize: 13.5, color: 'var(--ink-faint)' }}>
            Showing {visible.length} of {rows.length}
            {rows.length !== campaigns.length ? ` (${campaigns.length} total)` : ''}
          </span>
          {filtersOn && (
            <button
              onClick={() => { setQuery(''); setPlatform(null); setSource(null); setShowAll(false); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
                fontSize: 13.5, fontWeight: 600, color: 'var(--accent)', fontFamily: 'inherit',
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* results */}
      {visible.length === 0 ? (
        <div className="card">
          <p className="empty">
            {campaigns.length === 0
              ? 'No live campaigns yet. The board fills the first time the ingest job runs — until then this is honestly empty rather than padded with placeholders.'
              : 'Nothing matches those filters. Clear them and try a wider search.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(252px, 1fr))', gap: 16 }}>
          {visible.map((c) => (
            <CampaignCard key={c.id} c={c} />
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
        Heat is our own score — clips posted, views landed, and how fast the pool is filling. Effort is how hard it is
        to actually get approved and paid. Both live on each campaign&rsquo;s own page.
      </p>
    </div>
  );
}
