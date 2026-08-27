import type { Campaign } from '@/lib/types';
import { rate, timeLeft } from '@/lib/format';
import { PlatformIcon } from './Logo';

/**
 * The campaign card. Deliberately visual: artwork, per-platform rates, platform
 * icons, budget fill. Every figure comes from the source's own feed.
 */
export function CampaignCard({ c, pick }: { c: Campaign; pick?: boolean }) {
  const rates = c.platformRates.filter((r) => r.rate !== null);
  const uniform = rates.length > 1 && rates.every((r) => r.rate === rates[0].rate);
  const initial = c.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <a
      href={`/campaigns/${c.id}`}
      className="card"
      style={{
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        borderColor: pick ? 'var(--accent)' : 'var(--cream-line)',
        borderWidth: pick ? 2 : 1,
      }}
    >
      <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
        <div
          style={{
            width: 42, height: 42, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
            background: 'var(--cream)', border: '1px solid var(--cream-line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {c.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.iconUrl} alt="" width={42} height={42} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
          ) : (
            <span className="display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink-faint)' }}>{initial}</span>
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="display" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.25, marginBottom: 5 }}>{c.name}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="pill pill-active" style={{ fontSize: 11.5, padding: '3px 9px' }}>
              <span className="dot" />
              Active
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>{timeLeft(c.endsAt)}</span>
          </div>
        </div>
      </div>

      {rates.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="eyebrow" style={{ fontSize: 11 }}>
            {uniform ? 'Up to per 100k · all platforms' : 'Up to per 100k'}
          </span>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {(uniform ? rates.slice(0, 1) : rates).map((r) => (
              <span
                key={r.platform}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 9px',
                  borderRadius: 9, background: 'var(--cream)', border: '1px solid var(--cream-line)',
                }}
              >
                {!uniform && <PlatformIcon name={r.platform} />}
                <span className="display tabular" style={{ fontSize: 14, fontWeight: 700 }}>{rate(r.rate)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {c.platforms.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span className="eyebrow" style={{ fontSize: 11 }}>Platforms</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {c.platforms.map((p) => <PlatformIcon key={p} name={p} size={16} />)}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
          {c.minViews == null ? 'No view minimum' : `Min ${new Intl.NumberFormat('en-US', { notation: 'compact' }).format(c.minViews)} views to qualify`}
        </span>

        {c.budgetUsedPct !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'var(--cream-line)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${c.budgetUsedPct}%`, background: 'var(--accent)', borderRadius: 999 }} />
            </div>
            <span className="tabular" style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>{c.budgetUsedPct}% of pool claimed</span>
          </div>
        )}

        {pick && c.teamNote && (
          <p style={{ fontSize: 13, color: 'var(--ink)', margin: 0, lineHeight: 1.5, paddingTop: 8, borderTop: '1px solid var(--cream-line)' }}>
            <strong>Why we picked it: </strong>{c.teamNote}
          </p>
        )}
      </div>
    </a>
  );
}
