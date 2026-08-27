import type { Metadata } from 'next';
import { EarningsCalculator } from '@/components/EarningsCalculator';
import { Footer, Nav } from '@/components/Sections';
import { CampaignCard } from '@/components/CampaignCard';
import { getCampaigns, getCounts } from '@/lib/data';
import { money } from '@/lib/format';
import { safeExternal } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'Clip — get paid per view | Clipsy',
  description:
    'No following required. Real brand campaigns, automatic view tracking, and one board that shows every campaign worth your night.',
};

export const revalidate = 300;

const STEPS: Array<[string, string, string]> = [
  ['Pick a campaign', 'JOIN', 'Browse campaigns from real brands. Rate, platforms and view minimum are on the card before you click. No application, no follower minimum.'],
  ['Read the brief first', 'PREP', 'Every campaign has rules — footage you can use, claims you cannot make, where it has to be posted. Two minutes here is the difference between paid and rejected.'],
  ['Post your clips', 'POST', 'Cut it, post it on the platforms that campaign accepts, and submit the link the way that campaign asks for it.'],
  ['Get paid per view', 'EARN', 'Views are tracked back to your submission. Clear the minimum, pass review, get paid at the campaign’s rate.'],
];

export default async function ClipPage() {
  const [campaigns, counts] = await Promise.all([getCampaigns('easy', 4), getCounts()]);
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');

  return (
    <>
      <Nav discord={discord} />
      <main>
        {/* hero */}
        <div className="wrap" style={{ paddingTop: 84, paddingBottom: 56 }}>
          <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 22 }}>
            <span className="eyebrow">Clip &middot; Post &middot; Get paid</span>
            <h1 style={{ fontSize: 'clamp(38px, 6vw, 58px)', lineHeight: 1.02, fontWeight: 700 }}>
              Get paid to clip.
              <br />
              Per view.
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--ink-soft)', margin: 0, maxWidth: 560 }}>
              No following required. Real brand campaigns, automatic view tracking, and honest ranking of which ones
              actually pay. Your edits, your money.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a className="btn btn-primary" href={discord} target="_blank" rel="noopener noreferrer" style={{ padding: '15px 26px', fontSize: 16 }}>
                Start clipping
              </a>
              <a className="btn btn-ghost" href="/campaigns" style={{ padding: '15px 24px', fontSize: 16 }}>
                Browse {counts.campaigns > 0 ? `${counts.campaigns} campaigns` : 'the board'}
              </a>
            </div>
            {counts.budget > 0 && (
              <p style={{ fontSize: 13.5, color: 'var(--ink-faint)', margin: 0 }}>
                {money(counts.budget)} sitting in open campaign pools right now, across {counts.sources} networks.
              </p>
            )}
          </div>
        </div>

        {/* how it works */}
        <div
          className="section"
          style={{ background: 'var(--cream-card)', borderTop: '1px solid var(--cream-line)', borderBottom: '1px solid var(--cream-line)' }}
        >
          <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
            <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="eyebrow">How it works</span>
              <h2 style={{ fontSize: 34, fontWeight: 700 }}>From first clip to first payout.</h2>
              <p style={{ fontSize: 16, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55 }}>
                No following, no application, no catch. Pick a campaign, post your clips, and watch the views turn into
                earnings.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(238px, 1fr))', gap: 18 }}>
              {STEPS.map(([title, tag, body], i) => (
                <div key={title} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="display tabular" style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="pill pill-neutral" style={{ fontSize: 11, padding: '3px 9px' }}>
                      {tag}
                    </span>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 17 }}>{title}</span>
                  <span style={{ fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{body}</span>
                </div>
              ))}
            </div>

            <a className="btn btn-primary" href={discord} target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start', padding: '15px 26px', fontSize: 16 }}>
              Start earning
            </a>
          </div>
        </div>

        {/* easiest campaigns right now */}
        {campaigns.length > 0 && (
          <div className="wrap section" style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
            <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="eyebrow">Open right now</span>
              <h2 style={{ fontSize: 30, fontWeight: 700 }}>The lowest-friction campaigns on the board today.</h2>
              <p style={{ fontSize: 15.5, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
                Ranked by low view minimums and fast payout cycles, straight from live data. If you have never been paid
                for a clip, start with one of these.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(252px, 1fr))', gap: 18 }}>
              {campaigns.map((c) => (
                <CampaignCard key={c.id} c={c} />
              ))}
            </div>
          </div>
        )}

        {/* calculator */}
        <div
          className="section"
          style={{ background: 'var(--cream-card)', borderTop: '1px solid var(--cream-line)', borderBottom: '1px solid var(--cream-line)' }}
        >
          <div className="wrap" style={{ display: 'flex', gap: 52, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 100 }}>
              <span className="eyebrow">Earnings calculator</span>
              <h2 style={{ fontSize: 32, fontWeight: 700, maxWidth: 340 }}>See what your clips are worth.</h2>
              <p style={{ fontSize: 15.5, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55, maxWidth: 340 }}>
                Drag the sliders to estimate your payout. Every campaign sets its own rate — these are example ranges,
                not promises.
              </p>
            </div>
            <div style={{ flex: '1 1 420px', minWidth: 0 }}>
              <EarningsCalculator />
            </div>
          </div>
        </div>

        {/* cta */}
        <div className="wrap section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20 }}>
          <h2 style={{ fontSize: 34, fontWeight: 700, maxWidth: 560 }}>Everything open, in one place.</h2>
          <p style={{ fontSize: 15.5, color: 'var(--ink-soft)', margin: 0, maxWidth: 460 }}>
            Free to join. No follower minimum. We tell you when a campaign is not worth your time.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a className="btn btn-primary" href={discord} target="_blank" rel="noopener noreferrer" style={{ padding: '16px 28px', fontSize: 16 }}>
              Start clipping
            </a>
            <a className="btn btn-ghost" href="/learn" style={{ padding: '16px 26px', fontSize: 16 }}>
              Read the guides
            </a>
          </div>
        </div>
      </main>
      <Footer discord={discord} />
    </>
  );
}
