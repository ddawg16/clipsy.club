import type { Metadata } from 'next';
import { Footer, Nav } from '@/components/Sections';
import { getCounts } from '@/lib/data';
import { safeExternal } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'Run a campaign — Clipsy',
  description:
    'Managed clipping campaigns. You bring the footage and the budget, we bring a reviewed roster and one invoice.',
};

export const revalidate = 600;

const YOU_BRING = [
  ['Source footage', 'A VOD, a podcast, an ad, a launch video — whatever you want cut up.'],
  ['A budget and a window', 'What you are willing to spend, and by when it needs to have run.'],
  ['Your rules', 'Anything clippers must not do: claims you cannot make, competitors, no-go footage.'],
];

const WE_HANDLE = [
  ['Recruiting the roster', 'From our Discord, not an open signup. People we have seen deliver before.'],
  ['Reviewing every clipper in', 'A human approves each one. Nobody joins your campaign because a bot let them.'],
  ['Briefing and moderation', 'Your rules enforced during the campaign, not audited after it.'],
  ['Verified reporting', 'Views tracked per clip, per clipper, with the rejects shown too.'],
  ['One invoice', 'You pay us. We pay the clippers. You are not reconciling forty payouts.'],
];

const STEPS = [
  ['Brief', 'A call and a one-pager. What the footage is, what a good clip looks like, what is off limits.'],
  ['Roster', 'We assemble and approve the clippers, and tell you who is on it before anything posts.'],
  ['Run', 'Clips go out. You see performance as it lands, not in a deck three weeks later.'],
  ['Report', 'Verified views, cost per thousand, what worked, and what we would change next time.'],
];

export default async function BrandsPage() {
  const counts = await getCounts();
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');
  const contact = '/contact';

  return (
    <>
      <Nav discord={discord} />
      <main>
        {/* hero */}
        <div className="wrap" style={{ paddingTop: 80, paddingBottom: 56 }}>
          <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <span className="eyebrow">For brands</span>
            <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 52px)', lineHeight: 1.05, fontWeight: 700 }}>
              You don&rsquo;t need another agency deck. You need clips that actually go out.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--ink-soft)', margin: 0, maxWidth: 580 }}>
              We run clipping campaigns end to end — a reviewed roster of clippers, your rules enforced while it runs,
              verified numbers at the end, and one invoice instead of forty payouts.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a className="btn btn-primary" href={contact} style={{ padding: '15px 26px', fontSize: 16 }}>
                Start a campaign
              </a>
              <a className="btn btn-ghost" href="#how" style={{ padding: '15px 24px', fontSize: 16 }}>
                See how it runs
              </a>
            </div>
          </div>
        </div>

        {/* honesty band — who we are */}
        <div
          className="section"
          style={{
            background: 'var(--cream-card)',
            borderTop: '1px solid var(--cream-line)',
            borderBottom: '1px solid var(--cream-line)',
          }}
        >
          <div className="wrap" style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span className="eyebrow">Straight answer first</span>
              <h2 style={{ fontSize: 28, fontWeight: 700, maxWidth: 380 }}>We are small, and that is the pitch.</h2>
            </div>
            <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-soft)', margin: 0 }}>
                A big network will put your campaign on an open board and let anyone claim it. You get volume, a lot of
                low-effort clips, and no one who can tell you which clipper is actually worth paying twice.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-soft)', margin: 0 }}>
                We run a roster we know by name, because we track how every clipper on it performs across{' '}
                {counts.sources > 0 ? `${counts.sources} networks` : 'every network we index'}. That is the whole
                advantage. If you need a hundred thousand clips by Friday, we are the wrong call and we will say so on
                the first email.
              </p>
            </div>
          </div>
        </div>

        {/* how it runs */}
        <div id="how" className="wrap section" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="eyebrow">How it runs</span>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>Four steps, and you see the roster before anything posts.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {STEPS.map(([title, body], i) => (
              <div key={title} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span className="display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontWeight: 600, fontSize: 17 }}>{title}</span>
                <span style={{ fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{body}</span>
              </div>
            ))}
          </div>
        </div>

        {/* you bring / we handle */}
        <div className="section" style={{ background: 'var(--ink)' }}>
          <div className="wrap" style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <span className="eyebrow" style={{ color: 'rgba(242,236,217,0.55)' }}>
                You bring
              </span>
              <div style={{ marginTop: 18 }}>
                {YOU_BRING.map(([t, b]) => (
                  <div key={t} style={{ padding: '16px 0', borderBottom: '1px solid rgba(250,241,216,0.12)' }}>
                    <div style={{ fontWeight: 600, fontSize: 15.5, color: 'var(--cream)', marginBottom: 4 }}>{t}</div>
                    <div style={{ fontSize: 14, color: 'rgba(242,236,217,0.6)', lineHeight: 1.5 }}>{b}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: '1 1 380px' }}>
              <span className="eyebrow" style={{ color: 'rgba(242,236,217,0.55)' }}>
                We handle
              </span>
              <div style={{ marginTop: 18 }}>
                {WE_HANDLE.map(([t, b]) => (
                  <div key={t} style={{ padding: '16px 0', borderBottom: '1px solid rgba(250,241,216,0.12)' }}>
                    <div style={{ fontWeight: 600, fontSize: 15.5, color: 'var(--cream)', marginBottom: 4 }}>{t}</div>
                    <div style={{ fontSize: 14, color: 'rgba(242,236,217,0.6)', lineHeight: 1.5 }}>{b}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* where the money goes */}
        <div className="wrap section" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="eyebrow">Where the money goes</span>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>Most of your budget reaches the people making the clips.</h2>
            <p style={{ fontSize: 15.5, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55 }}>
              We would rather show you this than have you find out from a clipper. Our margin is the difference, and it
              pays for the review, the moderation and the reporting.
            </p>
          </div>

          <div className="card" style={{ padding: 28, maxWidth: 620 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                ['Goes to the clippers', '70%', 'var(--accent)'],
                ['Clipsy — review, moderation, reporting, payments', '30%', 'var(--ink-soft)'],
              ].map(([label, pct, color]) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                    <span style={{ fontSize: 15, fontWeight: 500 }}>{label}</span>
                    <span className="display tabular" style={{ fontSize: 16, fontWeight: 700 }}>
                      {pct}
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: 'var(--cream-line)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: pct.replace(/[[\]]/g, ''), background: color, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--ink-faint)', margin: '20px 0 0', lineHeight: 1.5 }}>
              Every campaign, every time. If a clipper asks you what our cut is, the answer is on this page.
            </p>
          </div>
        </div>

        {/* pricing */}
        <div
          id="pricing"
          className="section"
          style={{
            background: 'var(--cream-card)',
            borderTop: '1px solid var(--cream-line)',
            borderBottom: '1px solid var(--cream-line)',
          }}
        >
          <div className="wrap" style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span className="eyebrow">What it costs</span>
              <h2 style={{ fontSize: 30, fontWeight: 700, maxWidth: 340 }}>Priced per campaign, not per month.</h2>
              <p style={{ fontSize: 15, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55, maxWidth: 340 }}>
                No retainer, no seat licence, no annual contract. You fund a campaign, it runs, you see what it did.
              </p>
            </div>
            <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span className="eyebrow" style={{ fontSize: 11.5 }}>
                  Minimum campaign
                </span>
                <span className="display tabular" style={{ fontSize: 36, fontWeight: 700 }}>
                  $10,000
                </span>
                <span style={{ fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  Covers the roster, the review, moderation for the full run, and a verified report at the end.
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-faint)', margin: 0, lineHeight: 1.5 }}>
                Larger budgets run the same way — more clippers on the roster, not a different process.
              </p>
            </div>
          </div>
        </div>

        {/* cta */}
        <div
          className="wrap section"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}
        >
          <h2 style={{ fontSize: 34, fontWeight: 700, maxWidth: 560 }}>
            Tell us what you want clipped and we&rsquo;ll tell you if we can do it.
          </h2>
          <p style={{ fontSize: 15.5, color: 'var(--ink-soft)', margin: 0, maxWidth: 480 }}>
            A real answer within a day, including &ldquo;this isn&rsquo;t a fit&rdquo; when it isn&rsquo;t.
          </p>
          <a className="btn btn-primary" href={contact} style={{ padding: '16px 28px', fontSize: 16 }}>
            Start a campaign
          </a>
        </div>
      </main>
      <Footer discord={discord} />
    </>
  );
}
