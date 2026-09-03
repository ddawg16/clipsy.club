import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Footer, Nav } from '@/components/Sections';
import { getCampaign, getRelated } from '@/lib/data';
import { payout, rate, timeLeft, views, dollars } from '@/lib/format';
import { safeExternal, safeHref } from '@/lib/safe';
import { PlatformIcon } from '@/components/Logo';

export const revalidate = 300;

// Next 15+ hands params in as a Promise.
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const c = await getCampaign(id);
  if (!c) return { title: 'Campaign not found — Clipsy' };
  return {
    title: `${c.name} — Clipsy`,
    description: `${rate(c.rateCpm)} per 100k views on ${c.source}. ${views(c.minViews)}.`,
  };
}

const EFFORT_NOTE: Record<string, string> = {
  Low: 'Low view minimums and a quick payout cycle. A reasonable first campaign.',
  Medium: 'Middle of the road — readable brief, ordinary qualifier, standard payout wait.',
  High: 'High bar. Steep view minimum or a slow cycle. Worth it only if you already land views on this kind of footage.',
};

export default async function CampaignPage({ params }: Props) {
  const { id } = await params;
  const [c, related] = await Promise.all([getCampaign(id), getRelated(id, 4)]);
  if (!c) notFound();

  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');
  const href = safeHref(c.url);

  const facts: Array<[string, string]> = [
    ['Bounty rate per 100k', rate(c.rateCpm)],
    ['Qualifier', views(c.minViews)],
    ['Payout', payout(c.payoutDays)],
    ['Closes', timeLeft(c.endsAt)],
    ['Network', c.source],
    ['Category', c.category ? c.category.replace(/_/g, ' ') : 'Not stated'],
  ];
  const rates = c.platformRates.filter((r) => r.rate !== null);
  const brief = safeHref(c.briefUrl);

  return (
    <>
      <Nav discord={discord} />
      <main>
        <div style={{ borderBottom: '1px solid var(--cream-line)', background: 'var(--cream-card)' }}>
          <div className="wrap" style={{ padding: '32px 32px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <a href="/" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-soft)' }}>
              ← All campaigns
            </a>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span className="pill pill-neutral">{c.source}</span>
              <span className="pill pill-active">
                <span className="dot" />
                Active
              </span>
            </div>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', flexShrink: 0, background: 'var(--cream)', border: '1px solid var(--cream-line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.iconUrl} alt="" width={64} height={64} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                ) : (
                  <span className="display" style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink-faint)' }}>
                    {c.name.trim().charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: 'clamp(26px, 4.2vw, 40px)', fontWeight: 700, lineHeight: 1.1, maxWidth: 700, margin: 0 }}>{c.name}</h1>
            </div>
          </div>
        </div>

        <div className="wrap section" style={{ display: 'flex', gap: 48, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: 28, minWidth: 0 }}>
            <div>
              <span className="eyebrow" style={{ display: 'block', marginBottom: 14 }}>The numbers</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 0 }}>
                {facts.map(([k, v]) => (
                  <div key={k} style={{ padding: '14px 0', borderBottom: '1px solid var(--cream-line)' }}>
                    <div className="eyebrow" style={{ fontSize: 11, marginBottom: 4 }}>{k}</div>
                    <div style={{ fontSize: 15.5, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {rates.length > 0 && (
              <div>
                <span className="eyebrow" style={{ display: 'block', marginBottom: 14 }}>Rate by platform</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                  {rates.map((r) => (
                    <div key={r.platform} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <PlatformIcon name={r.platform} size={22} />
                      <div>
                        <div className="display tabular" style={{ fontSize: 20, fontWeight: 700 }}>{rate(r.rate)}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--ink-faint)' }}>per 100k</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(c.budgetTotal != null || c.budgetUsedPct !== null) && (() => {
              const usedPct = Math.max(0, Math.min(100, c.budgetUsedPct ?? 0));
              const remainPct = 100 - usedPct;
              const remaining = c.budgetTotal != null ? c.budgetTotal * (remainPct / 100) : null;
              return (
              <div>
                <span className="eyebrow" style={{ display: 'block', marginBottom: 14 }}>Pool</span>
                <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontSize: 14.5, color: 'var(--ink-soft)' }}>Budget left</span>
                    <span className="display tabular" style={{ fontSize: 20, fontWeight: 700 }}>
                      {remaining != null ? dollars(remaining) : `${remainPct}%`}
                      {c.budgetTotal != null && (
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-faint)' }}> of {dollars(c.budgetTotal)}</span>
                      )}
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: 'var(--cream-line)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${remainPct}%`, background: 'var(--green)', borderRadius: 999 }} />
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ink-faint)', margin: 0, lineHeight: 1.5 }}>
                    {usedPct >= 80 ? 'This pool is nearly claimed - payouts slow and rejections rise near capacity.' : 'Money still on the table. The lower the claim, the more room to work.'}
                  </p>
                </div>
              </div>
              );
            })()}

            {(() => {
              const usedPct = c.budgetUsedPct;
              const remaining =
                c.budgetTotal != null && usedPct != null
                  ? c.budgetTotal * (1 - Math.max(0, Math.min(100, usedPct)) / 100)
                  : null;
              const compact = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(n);
              const plat = (p: string) => (p.toLowerCase() === 'x' ? 'X' : p.charAt(0).toUpperCase() + p.slice(1));
              // Every line here is a REAL stat pulled from this campaign — these are
              // exactly what the Heat and Effort scores above are computed from.
              const signals: Array<{ k: string; v: string }> = [
                { k: 'Niche', v: c.niche },
                { k: 'View minimum', v: c.minViews == null ? 'None — anyone qualifies' : `${compact(c.minViews)} views` },
                { k: 'Rate', v: c.rateCpm != null ? `${rate(c.rateCpm)} / 100k` : 'Bounty / pot based' },
                { k: 'Budget', v: usedPct != null ? `${usedPct}% claimed${remaining != null ? `, ${dollars(remaining)} left` : ''}` : `Not published by ${c.source}` },
                { k: 'Platforms', v: c.platforms.length ? c.platforms.map(plat).join(', ') : '—' },
                { k: 'Payout', v: c.payoutDays != null ? `${c.payoutDays} days` : 'Not published' },
              ];
              return (
                <div>
                  <span className="eyebrow" style={{ display: 'block', marginBottom: 14 }}>Our read</span>
                  <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'var(--cream-line)', overflow: 'hidden' }} role="img" aria-label={`Heat ${c.heat} out of 100`}>
                        <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, c.heat))}%`, background: 'var(--accent)', borderRadius: 999 }} />
                      </div>
                      <span className="display tabular" style={{ fontSize: 19, fontWeight: 700 }}>{c.heat}</span>
                      <span style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>heat</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'var(--cream-line)', overflow: 'hidden' }} role="img" aria-label={`Effort ${c.effortScore} out of 100`}>
                        <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, c.effortScore))}%`, background: 'var(--green)', borderRadius: 999 }} />
                      </div>
                      <span className="display tabular" style={{ fontSize: 19, fontWeight: 700 }}>{c.effortScore}</span>
                      <span style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>effort · {c.effort}</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55 }}>
                      {c.heat >= 70 ? 'Running hot and crowded — the pool fills fastest on campaigns like this. ' : c.heat >= 40 ? 'Steady heat — real interest, but not capped. ' : 'Quiet — less competition for the pool. '}
                      {EFFORT_NOTE[c.effort]}
                    </p>
                    <div style={{ height: 1, background: 'var(--cream-line)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                      <span className="eyebrow" style={{ fontSize: 11 }}>What we&rsquo;re reading</span>
                      {signals.map((sig) => (
                        <div key={sig.k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13.5 }}>
                          <span style={{ color: 'var(--ink-faint)' }}>{sig.k}</span>
                          <span className="tabular" style={{ color: 'var(--ink)', fontWeight: 600, textAlign: 'right' }}>{sig.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="card" style={{ padding: 22, background: 'var(--cream)' }}>
              <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55 }}>
                <strong>Read the brief first.</strong> The banned-footage list and the exact approval rules live on{' '}
                {c.source}, not here. Most rejections are brief violations, not bad edits.
              </p>
              {brief && (
                <a className="btn btn-ghost" href={brief} target="_blank" rel="noopener noreferrer nofollow" style={{ marginTop: 14, fontSize: 14 }}>
                  Open the brief
                </a>
              )}
            </div>
          </div>

          <div style={{ flex: '0 1 320px', display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 100 }}>
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <span className="display tabular" style={{ fontSize: 38, fontWeight: 700 }}>{rate(c.rateCpm)}</span>
                <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}> / 100k views</span>
              </div>
              {href ? (
                <a className="btn btn-primary" href={href} target="_blank" rel="noopener noreferrer nofollow" style={{ padding: '14px 22px', fontSize: 15.5 }}>
                  {c.source === 'Clipsy Direct' ? 'Submit your clips' : `Claim on ${c.source}`}
                </a>
              ) : (
                <span style={{ fontSize: 14, color: 'var(--ink-faint)' }}>{c.source === 'Clipsy Direct' ? 'Submissions open at the drop — join the Discord below to be first.' : 'No direct link published for this one.'}</span>
              )}
              <a className="btn btn-ghost" href={discord} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14.5 }}>
                Ask about it first
              </a>
              <p style={{ fontSize: 12.5, color: 'var(--ink-faint)', margin: 0, lineHeight: 1.5 }}>
                {c.source === 'Clipsy Direct'
                  ? 'This is a Clipsy campaign. Submit through the link above — your views are tracked and you’re paid out there.'
                  : `You’re paid by ${c.source} on their terms. We earn nothing from this clip — we just make sure you knew it existed.`}
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="section" style={{ background: 'var(--cream-card)', borderTop: '1px solid var(--cream-line)' }}>
            <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 style={{ fontSize: 26, fontWeight: 700 }}>Running hot right now</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                {related.map((r) => (
                  <a key={r.id} href={`/campaigns/${r.id}`} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span className="pill pill-neutral" style={{ alignSelf: 'flex-start', fontSize: 11.5, padding: '3px 9px' }}>{r.source}</span>
                    <span style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.35 }}>{r.name}</span>
                    <span className="display tabular" style={{ fontSize: 17, fontWeight: 700 }}>
                      {rate(r.rateCpm)}
                      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-soft)' }}>/100k</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer discord={discord} />
    </>
  );
}
