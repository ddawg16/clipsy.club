'use client';

import { useMemo, useState } from 'react';
import type { Campaign, SortKey } from '@/lib/types';
import { NICHE_ORDER } from '@/lib/niche';
import { CampaignCard } from './CampaignCard';

const TABS: Array<{ id: SortKey; label: string; note: string }> = [
  {
    id: 'picks',
    label: 'Top team picks',
    note: 'Your hand-picked campaigns first, in the order you set them — then everything else by heat. This is the default view.',
  },
  {
    id: 'hot',
    label: 'Hottest',
    note: 'Heat = how hard a campaign is running right now: how its rate compares to the rest of the board (35%), how recently it launched (25%), how soon it closes (15%), how many platforms it runs on (10%), and — where we know it — how much of the budget is already claimed (15%). High heat means crowded and competitive, not easy.',
  },
  {
    id: 'easy',
    label: 'Easiest to get paid',
    note: 'Effort = how likely you are to actually get approved and paid: mostly how low the view minimum is versus the board (50%), plus how much budget is still unclaimed (25%), how fast the payout cycle is (15%), and platform reach (10%). Start here if you have never been paid for a clip.',
  },
  {
    id: 'rate',
    label: 'Best rate',
    note: 'Straight CPM — the highest dollar-per-100k-views first, with ties broken by which is easier to get paid. Worth saying: the top rate is rarely the easiest money, and usually carries the highest view minimum.',
  },
];

// Deterministic tie-breaker so the order is never arbitrary: heat, then rate,
// then effort, then name. Two cards only tie when every real input ties.
const tie = (a: Campaign, b: Campaign): number =>
  b.heat - a.heat ||
  (b.rateCpm ?? -1) - (a.rateCpm ?? -1) ||
  b.effortScore - a.effortScore ||
  a.name.localeCompare(b.name);

function sortCampaigns(list: Campaign[], key: SortKey): Campaign[] {
  const copy = [...list];
  switch (key) {
    case 'easy':
      return copy.sort((a, b) => b.effortScore - a.effortScore || tie(a, b));
    case 'rate':
      return copy.sort((a, b) => (b.rateCpm ?? -1) - (a.rateCpm ?? -1) || b.effortScore - a.effortScore || tie(a, b));
    case 'picks':
      return copy.sort((a, b) => {
        if (a.teamPick !== b.teamPick) return a.teamPick ? -1 : 1;
        if (a.teamPick && b.teamPick) return (a.teamRank ?? 99) - (b.teamRank ?? 99);
        return b.heat - a.heat || tie(a, b);
      });
    default: // 'hot'
      return copy.sort((a, b) => b.heat - a.heat || tie(a, b));
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

const PAGE = 25;

export function CampaignHub({ campaigns, freshness }: { campaigns: Campaign[]; freshness?: string }) {
  const [sort, setSort] = useState<SortKey>('picks');
  const [query, setQuery] = useState('');
  const [niche, setNiche] = useState<string>('');
  const [source, setSource] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Only offer niches that actually have campaigns, in canonical order, each
  // with its live count so a clipper can see how deep their lane is.
  const niches = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of campaigns) counts.set(c.niche, (counts.get(c.niche) ?? 0) + 1);
    return NICHE_ORDER.filter((n) => counts.has(n)).map((n) => ({ name: n, count: counts.get(n)! }));
  }, [campaigns]);

  const sources = useMemo(
    () => [...new Set(campaigns.map((c) => c.source))].filter(Boolean).sort(),
    [campaigns],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      if (niche && c.niche !== niche) return false;
      if (source && c.source !== source) return false;
      return true;
    });
  }, [campaigns, query, niche, source]);

  const rows = useMemo(() => sortCampaigns(filtered, sort), [filtered, sort]);
  const visible = showAll ? rows : rows.slice(0, PAGE);
  const active = TABS.find((t) => t.id === sort) ?? TABS[0];
  const filtersOn = Boolean(query || niche || source);
  const noPicks = sort === 'picks' && !campaigns.some((c) => c.teamPick);

  const selectStyle: React.CSSProperties = {
    padding: '9px 13px', borderRadius: 9, minHeight: 40,
    border: '1.5px solid var(--cream-line)', background: 'var(--cream-card)',
    color: 'var(--ink)', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-display), sans-serif', cursor: 'pointer',
  };

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

      {/* search + niche */}
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
        {niches.length > 1 && (
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="eyebrow" style={{ fontSize: 11 }}>Niche</span>
            <select
              value={niche}
              onChange={(e) => { setNiche(e.target.value); setShowAll(false); }}
              aria-label="Filter campaigns by niche"
              style={selectStyle}
            >
              <option value="">All niches ({campaigns.length})</option>
              {niches.map((n) => (
                <option key={n.name} value={n.name}>{n.name} ({n.count})</option>
              ))}
            </select>
          </label>
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
      <p style={{ fontSize: 13, color: 'var(--ink-faint)', margin: 0, maxWidth: 760, lineHeight: 1.5 }}>{active.note}</p>

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
            onClick={() => { setQuery(''); setNiche(''); setSource(null); setShowAll(false); }}
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
        Heat and Effort are our own scores, recomputed every time the board refreshes from each campaign&rsquo;s real
        stats — rate, view minimum, budget left, payout speed and platforms — and ranked against the rest of the board.
        They sharpen further as our clippers report what actually got approved and paid.
      </p>
    </div>
  );
}
