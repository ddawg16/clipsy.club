import type { Metadata } from 'next';
import { Footer, Nav } from '@/components/Sections';
import { getCounts } from '@/lib/data';
import { money } from '@/lib/format';
import { safeExternal } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'How clipping campaigns work — Clipsy',
  description:
    'A clipping campaign turns your content into hundreds of short-form clips, posted by real creators and tracked back to you. Your spend follows verified views instead of follower counts.',
};

export const revalidate = 600;

const COMPARE: Array<[string, string, string]> = [
  ['What you pay for', 'A flat fee per post, win or lose', 'Only the views your clips actually earn'],
  ['Scale', 'One creator, one post', 'Many clippers posting at once'],
  ['Risk', 'Paid up front, hope it performs', 'Budget capped, spend follows results'],
  ['Tracking', 'Screenshots and a end-of-month deck', 'Per clip, per clipper, with the rejects shown'],
];

const MECHANICS: Array<[string, string]> = [
  ['A rate and a hard cap', 'Campaigns are priced as a rate per 100,000 views, with a ceiling on total spend. A clip going unexpectedly viral does not blow past your budget — it just fills the pool faster.'],
  ['Views, then verification', 'Views are read from the platforms, then checked before anything is paid. Inflated numbers and recycled uploads get rejected, and you see the rejections rather than just the total.'],
  ['A pool that empties', 'Once the pool is claimed the campaign is done, whether or not the end date has arrived. This is the single most misunderstood thing about clipping campaigns, and it cuts both ways: it protects your budget, and it is why clippers should check how full a pool is before spending a night on a clip.'],
  ['Rules enforced while it runs', 'Anything clippers must not do — claims you cannot make, competitors, footage that is off limits — is moderated during the campaign, not audited after it.'],
];

export default async function HowCampaignsWorkPage() {
  const counts = await getCounts();
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');

  return (
    <>
      <Nav discord={discord} />
      <main>
        <div className="wrap" style={{ paddingTop: 84, paddingBottom: 56 }}>
          <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 22 }}>
            <span className="eyebrow">Clipping campaigns</span>
            <h1 style={{ fontSize: 'clamp(36px, 5.8vw, 56px)', lineHeight: 1.03, fontWeight: 700 }}>
              Pay per view,
              <br />
              not per post.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--ink-soft)', margin: 0, maxWidth: 600 }}>
              A clipping campaign turns your content into hundreds of short-form clips, posted by real creators and
              tracked back to you. You set a budget, we set a rate, and your spend follows verified views instead of
              follower counts.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a className="btn btn-primary" href="/brands" style={{ padding: '15px 26px', fontSize: 16 }}>
                Start a campaign
              </a>
              <a className="btn btn-ghost" href="#mechanics" style={{ padding: '15px 24px', fontSize: 16 }}>
                How it works
              </a>
            </div>
          </div>
        </div>

        {/* comparison */}
        <div
          className="section"
          style={{ background: 'var(--cream-card)', borderTop: '1px solid var(--cream-line)', borderBottom: '1px solid var(--cream-line)' }}
        >
          <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="eyebrow">Campaigns vs influencer deals</span>
              <h2 style={{ fontSize: 32, fontWeight: 700 }}>Your budget follows reach, not followers.</h2>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
              <div className="scroll-x">
                <div style={{ minWidth: 680 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '180px 1fr 1fr',
                      gap: 16,
                      padding: '14px 22px',
                      background: 'var(--cream)',
                      borderBottom: '1px solid var(--cream-line)',
                    }}
                  >
                    <span />
                    <span className="eyebrow" style={{ fontSize: 11 }}>
                      Influencer deal
                    </span>
                    <span className="eyebrow" style={{ fontSize: 11 }}>
                      Clipping campaign
                    </span>
                  </div>
                  {COMPARE.map(([row, a, b]) => (
                    <div
                      key={row}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '180px 1fr 1fr',
                        gap: 16,
                        padding: '18px 22px',
                        borderBottom: '1px solid var(--cream-line)',
                        alignItems: 'start',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14.5 }}>{row}</span>
                      <span style={{ fontSize: 14.5, color: 'var(--ink-faint)', lineHeight: 1.45 }}>{a}</span>
                      <span style={{ fontSize: 14.5, lineHeight: 1.45 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13.5, color: 'var(--ink-faint)', margin: 0, maxWidth: '68ch', lineHeight: 1.55 }}>
              Neither model is strictly better. An influencer deal buys one trusted voice saying your thing on purpose.
              A clipping campaign buys volume and lets the algorithm sort it. If what you need is a single credible
              endorsement, run the influencer deal.
            </p>
          </div>
        </div>

        {/* mechanics */}
        <div id="mechanics" className="wrap section" style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          <div style={{ maxWidth: 580, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="eyebrow">The mechanics</span>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>Full control, none of the busywork.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
            {MECHANICS.map(([title, body]) => (
              <div key={title} className="card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontWeight: 600, fontSize: 17.5 }}>{title}</span>
                <span style={{ fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.55 }}>{body}</span>
              </div>
            ))}
          </div>
        </div>

        {/* live proof */}
        <div className="section" style={{ background: 'var(--ink)' }}>
          <div className="wrap" style={{ display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span className="eyebrow" style={{ color: 'rgba(242,236,217,0.55)' }}>
                Not theory
              </span>
              <h2 style={{ fontSize: 30, fontWeight: 700, color: 'var(--cream)', maxWidth: 420 }}>
                This is what the market looks like today.
              </h2>
              <p style={{ fontSize: 15.5, color: 'rgba(242,236,217,0.65)', margin: 0, lineHeight: 1.55, maxWidth: 420 }}>
                Every figure below is read live from the campaigns we index. Nothing here is a rounded-up marketing
                number, which is also why it moves.
              </p>
            </div>
            <div style={{ flex: '1 1 340px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 20 }}>
              {[
                [String(counts.campaigns || '—'), 'campaigns open'],
                [counts.budget > 0 ? money(counts.budget) : '—', 'in open pools'],
                [String(counts.sources || '—'), 'networks indexed'],
              ].map(([v, l]) => (
                <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <span className="display tabular" style={{ fontSize: 32, fontWeight: 700, color: 'var(--cream)' }}>
                    {v}
                  </span>
                  <span style={{ fontSize: 13, color: 'rgba(242,236,217,0.6)' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="wrap section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}>
          <h2 style={{ fontSize: 34, fontWeight: 700, maxWidth: 560 }}>Tell us what you want clipped.</h2>
          <p style={{ fontSize: 15.5, color: 'var(--ink-soft)', margin: 0, maxWidth: 460 }}>
            A real answer within a day, including &ldquo;this isn&rsquo;t a fit&rdquo; when it isn&rsquo;t.
          </p>
          <a className="btn btn-primary" href="/brands" style={{ padding: '16px 28px', fontSize: 16 }}>
            Start a campaign
          </a>
        </div>
      </main>
      <Footer discord={discord} />
    </>
  );
}
