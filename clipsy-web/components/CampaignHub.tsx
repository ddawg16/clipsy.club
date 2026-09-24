'use client';

import { useMemo, useState } from 'react';
import type { Campaign, SortKey } from '@/lib/types';
import { NICHE_ORDER } from '@/lib/niche';
import { CampaignCard } from './CampaignCard';

const TABS: Array<{ id: SortKey; label: string; note: string }> = [
  { id: 'hot', label: 'Campaigns', note: 'Active campaigns from the Clipsy Discord manager.' },
  { id: 'rate', label: 'Best rate', note: 'Highest payout per 1,000 views first.' },
];

function sortCampaigns(list: Campaign[], key: SortKey): Campaign[] {
  const copy = [...list];
  if (key === 'rate') return copy.sort((a, b) => (b.ratePer1k ?? 0) - (a.ratePer1k ?? 0) || a.name.localeCompare(b.name));
  return copy.sort((a, b) => a.name.localeCompare(b.name));
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
  const [sort, setSort] = useState<SortKey>('hot');
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
            Synced with Discord campaigns
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
              ? 'No active campaigns are available right now.'
              : 'Nothing matches those filters. Clear them and try a wider search.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(252px, 1fr))', gap: 16 }}>
          {visible.map((c) => (
            <CampaignCard key={c.id} c={c} pick={false} />
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

      <p style={{ fontSize: 13, color: 'var(--ink-faint)', margin: 0 }}>
        Campaign names, rates, platforms and availability come from the Clipsy Discord manager.
      </p>
    </div>
  );
}
