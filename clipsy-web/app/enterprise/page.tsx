import type { Metadata } from 'next';
import { Footer, Nav } from '@/components/Sections';
import { getCounts } from '@/lib/data';
import { safeExternal } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'Enterprise — agencies and labels | Clipsy',
  description:
    'Run clipping campaigns across many clients at once. Built for agencies, music labels and large brands, with one roster, one report and one invoice.',
};

export const revalidate = 600;

const CAPABILITIES: Array<[string, string]> = [
  ['Many campaigns at once', 'One client per campaign, each with its own rate, rules and cap, all coordinated by the same team rather than farmed out to a different board every time.'],
  ['One roster across clients', 'The clippers who deliver for one of your accounts are the ones we put on the next. Over time your agency gets a bench, not a fresh gamble each launch.'],
  ['Rules that survive contact', 'Labels and regulated brands have things clippers genuinely cannot say. Those go in the brief and get enforced while the campaign runs, with the offending clips pulled and the clipper told why.'],
  ['Anti-fraud on every clip', 'Views are verified before payout. Recycled uploads, bought views and re-posted clips get rejected and the rejections are in your report, not quietly absorbed.'],
  ['Reporting your client can read', 'Views, cost per thousand, top clips, and what got rejected — per campaign and across all of them. Formatted to forward, not to decode.'],
  ['One invoice per campaign', 'You pay us, we pay the clippers. Your finance team reconciles one line, not forty freelancer payments across three countries.'],
];

export default async function EnterprisePage() {
  const counts = await getCounts();
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');

  return (
    <>
      <Nav discord={discord} />
      <main>
        <div className="wrap" style={{ paddingTop: 84, paddingBottom: 56 }}>
          <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 22 }}>
            <span className="eyebrow">Enterprise &middot; agencies &amp; labels</span>
            <h1 style={{ fontSize: 'clamp(36px, 5.8vw, 56px)', lineHeight: 1.03, fontWeight: 700 }}>
              Clipping at scale,
              <br />
              fully managed.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--ink-soft)', margin: 0, maxWidth: 600 }}>
              Run high-volume clipping campaigns across many clients at once. Built for agencies, music labels and
              large brands that need the same roster, the same rules and the same reporting every time — not a new
              scramble per release.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a className="btn btn-primary" href="/contact" style={{ padding: '15px 26px', fontSize: 16 }}>
                Talk to us
              </a>
              <a className="btn btn-ghost" href="/how-campaigns-work" style={{ padding: '15px 24px', fontSize: 16 }}>
                How it works
              </a>
            </div>
          </div>
        </div>

        {/* honesty band */}
        <div
          className="section"
          style={{ background: 'var(--cream-card)', borderTop: '1px solid var(--cream-line)', borderBottom: '1px solid var(--cream-line)' }}
        >
          <div className="wrap" style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span className="eyebrow">Straight answer first</span>
              <h2 style={{ fontSize: 28, fontWeight: 700, maxWidth: 360 }}>
                Read this before you put us on a pitch deck.
              </h2>
            </div>
            <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-soft)', margin: 0 }}>
                We are a small operation running a roster we know by name, and we track how every clipper performs
                across the {counts.sources > 0 ? `${counts.sources} networks` : 'networks'} we index. For an agency
                that is the useful part: you get people who have delivered before rather than whoever claimed the job
                off an open board.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-soft)', margin: 0 }}>
                What we will not do is pretend to a scale we do not have. If your campaign needs thousands of clippers
                live next week, we are the wrong call and we will say so on the first email instead of taking the
                deposit and finding out together.
              </p>
            </div>
          </div>
        </div>

        {/* capabilities */}
        <div className="wrap section" style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="eyebrow">Enterprise capabilities</span>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>Built for repeat distribution.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(288px, 1fr))', gap: 18 }}>
            {CAPABILITIES.map(([title, body]) => (
              <div key={title} className="card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontWeight: 600, fontSize: 17 }}>{title}</span>
                <span style={{ fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.55 }}>{body}</span>
              </div>
            ))}
          </div>
        </div>

        {/* cta */}
        <div className="section" style={{ background: 'var(--ink)' }}>
          <div className="wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}>
            <h2 style={{ fontSize: 34, fontWeight: 700, color: 'var(--cream)', maxWidth: 560 }}>
              Bring us one client and one launch.
            </h2>
            <p style={{ fontSize: 15.5, color: 'rgba(242,236,217,0.65)', margin: 0, maxWidth: 480, lineHeight: 1.55 }}>
              Start with a single campaign, see the roster and the reporting, then decide whether the rest of the roster
              belongs here. That is a smaller ask for you and a fairer test of us.
            </p>
            <a className="btn btn-primary" href="/contact" style={{ padding: '16px 28px', fontSize: 16 }}>
              Talk to us
            </a>
          </div>
        </div>
      </main>
      <Footer discord={discord} />
    </>
  );
}
