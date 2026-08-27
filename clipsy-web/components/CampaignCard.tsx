import type { Campaign } from '@/lib/types';
import { rate, timeLeft } from '@/lib/format';
import { PlatformIcon } from './Logo';

/**
 * The campaign card. Deliberately visual: artwork, per-platform rates, platform
 * icons, budget fill. Every figure comes from the source's own feed.
 */
export function CampaignCard({ c, pick, compact }: { c: Campaign; pick?: boolean; compact?: boolean }) {
  // `compact` shrinks every axis by roughly a quarter so four picks fit above
  // the fold instead of pushing the board off screen.
  const S = compact
    ? { pad: 13, gap: 11, icon: 34, name: 14.5, sub: 11.5, chipPad: '4px 7px', chipText: 13, eyebrow: 10, plat: 14, meta: 11.5, note: 12 }
    : { pad: 16, gap: 16, icon: 42, name: 16, sub: 12.5, chipPad: '5px 9px', chipText: 14, eyebrow: 11, plat: 16, meta: 12.5, note: 13 };

  const rates = c.platformRates.filter((r) => r.rate !== null);
  const uniform = rates.length > 1 && rates.every((r) => r.rate === rates[0].rate);
  const initial = c.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <a
      href={`/campaigns/${c.id}`}
      className="card"
      style={{
        padding: S.pad,
        display: 'flex',
        flexDirection: 'column',
        gap: S.gap,
        borderColor: pick ? 'var(--accent)' : 'var(--cream-line)',
        borderWidth: pick ? 2 : 1,
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div
          style={{
            width: S.icon, height: S.icon, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
            background: 'var(--cream)', border: '1px solid var(--cream-line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {c.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.iconUrl} alt="" width={S.icon} height={S.icon} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
          ) : (
            <span className="display" style={{ fontSize: compact ? 15 : 17, fontWeight: 700, color: 'var(--ink-faint)' }}>{initial}</span>
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="display" style={{ fontSize: S.name, fontWeight: 700, lineHeight: 1.25, marginBottom: 4 }}>{c.name}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="pill pill-active" style={{ fontSize: compact ? 10.5 : 11.5, padding: compact ? '2px 7px' : '3px 9px' }}>
              <span className="dot" />
              Active
            </span>
            <span style={{ fontSize: S.sub, color: 'var(--ink-faint)' }}>{timeLeft(c.endsAt)}</span>
          </div>
        </div>
      </div>

      {rates.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 6 : 8 }}>
          <span className="eyebrow" style={{ fontSize: S.eyebrow }}>
            {uniform ? 'Rate per 100k · all platforms' : 'Rate per 100k'}
          </span>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {(uniform ? rates.slice(0, 1) : rates).map((r) => (
              <span
                key={r.platform}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: S.chipPad,
                  borderRadius: 9, background: 'var(--cream)', border: '1px solid var(--cream-line)',
                }}
              >
                {!uniform && <PlatformIcon name={r.platform} />}
                <span className="display tabular" style={{ fontSize: S.chipText, fontWeight: 700 }}>{rate(r.rate)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {c.platforms.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="eyebrow" style={{ fontSize: S.eyebrow }}>Platforms</span>
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            {c.platforms.map((p) => <PlatformIcon key={p} name={p} size={S.plat} />)}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 2, display: 'flex', flexDirection: 'column', gap: compact ? 8 : 10 }}>
        <span style={{ fontSize: S.meta, color: 'var(--ink-soft)' }}>
          {c.minViews == null ? 'No view minimum' : `Min ${new Intl.NumberFormat('en-US', { notation: 'compact' }).format(c.minViews)} views to qualify`}
        </span>

        {c.budgetUsedPct !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'var(--cream-line)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${c.budgetUsedPct}%`, background: 'var(--accent)', borderRadius: 999 }} />
            </div>
            <span className="tabular" style={{ fontSize: compact ? 11 : 11.5, color: 'var(--ink-faint)' }}>{c.budgetUsedPct}% claimed</span>
          </div>
        )}

        {pick && c.teamNote && (
          <p style={{ fontSize: S.note, color: 'var(--ink)', margin: 0, lineHeight: 1.45, paddingTop: 8, borderTop: '1px solid var(--cream-line)' }}>
            <strong>Why we picked it: </strong>{c.teamNote}
          </p>
        )}
      </div>
    </a>
  );
}
