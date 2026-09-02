import type { Metadata } from 'next';
import { Footer, Nav } from '@/components/Sections';
import { safeExternal } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'SGNL campaign — rules & brief · Clipsy',
  description:
    'Everything you need to clip the SGNL campaign. Read the whole thing before you post — this one has hard rules, and breaking one means no pay.',
};

// When SGNL gives us the Whop Content Rewards submission link, put it here.
// Empty = the button tells clippers submissions open at the drop.
const SUBMIT_URL = '';

const GUIDELINES: string[] = [
  'You need a dedicated page for SGNL on each platform you post to.',
  'No botted clips or engagement — ever.',
  'Every clip must be at least 10 seconds long.',
  'Post only on Instagram, TikTok, YouTube, and Facebook.',
  'Target a USA audience (50%+).',
  'AI-generated clips are not allowed. Phonk music is not allowed.',
  'First line of your description must be a CTA to the free SGNL news email — e.g. “Market news before it spreads. Free email newsletter, link in bio.”',
  'Put your assigned link in bio. On TikTok, tell viewers to copy-paste it into a browser (TikTok needs 1K followers for clickable links).',
  'Pin a comment telling viewers how to get the free newsletter — the method depends on the platform (below).',
];

const NEWSLETTER_CTA: Array<[string, string]> = [
  ['Instagram & Facebook', 'Tell viewers to comment “AI” on your clip. An automated message DMs them the newsletter link.'],
  ['TikTok', 'Tell viewers to DM the word “AI” to your account to get the newsletter link sent to them.'],
  ['YouTube', 'Use a standard CTA to the newsletter (e.g. “Market news before it spreads. Free email newsletter, link in bio.”).'],
];

const NEVERS: string[] = [
  'Never name any company or stock as “the play.” Talk about the category — physical AI — never a company. Not even in the comments.',
  'Never say “buy,” “invest in this,” or give any ticker.',
  'Never promise money. No “guaranteed,” no “you’ll get rich,” no profit screenshots.',
  'Never call it investment advice. It’s a news email.',
  'Never use anyone else’s link, and never post your link on the wrong app.',
  'Never skip the paid-partnership label if the app has one.',
];

export default function SgnlPage() {
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');
  const submit = SUBMIT_URL ? safeExternal(SUBMIT_URL, '') : '';

  return (
    <>
      <Nav discord={discord} />
      <main>
        {/* masthead */}
        <div style={{ borderBottom: '1px solid var(--cream-line)', background: 'var(--cream-card)' }}>
          <div className="wrap" style={{ padding: '40px 32px 32px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 860 }}>
            <span className="eyebrow" style={{ color: 'var(--accent)' }}>Campaign brief · SGNL [Test]</span>
            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.08 }}>
              Clip a free news email. Get paid per view.
            </h1>
            <p style={{ fontSize: 16, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55, maxWidth: 640 }}>
              This is our first paid campaign. Read the whole thing before you post — this one has hard rules, and
              breaking one means <strong>no pay</strong>. Rate, pool and deadline are announced on the board at the drop.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
              {submit ? (
                <a className="btn btn-primary" href={submit} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15 }}>
                  Submit your clips on Whop
                </a>
              ) : (
                <span className="btn btn-ghost" style={{ background: 'var(--cream)', fontSize: 15, cursor: 'default' }} aria-disabled="true">
                  Submissions open at the drop
                </span>
              )}
              <a className="btn btn-ghost" href={discord} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15 }}>
                Join the Discord
              </a>
              <a className="btn btn-ghost" href="/" style={{ fontSize: 15 }}>
                See it on the board
              </a>
            </div>
          </div>
        </div>

        <div className="wrap" style={{ maxWidth: 860, padding: '36px 32px 64px', display: 'flex', flexDirection: 'column', gap: 40 }}>
          {/* 1. Guidelines */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>1. Guidelines &amp; requirements</h2>
            <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {GUIDELINES.map((g) => (
                <li key={g} style={{ fontSize: 15.5, color: 'var(--ink-soft)', lineHeight: 1.55 }}>{g}</li>
              ))}
            </ul>

            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
              <span className="eyebrow" style={{ fontSize: 11 }}>How to send viewers the free newsletter</span>
              {NEWSLETTER_CTA.map(([platform, how]) => (
                <div key={platform} style={{ fontSize: 14.5, lineHeight: 1.5 }}>
                  <strong>{platform}:</strong> <span style={{ color: 'var(--ink-soft)' }}>{how}</span>
                </div>
              ))}
            </div>
          </section>

          {/* The 6 Nevers — the compliance core, impossible to miss */}
          <section
            style={{
              border: '2px solid var(--accent)',
              borderRadius: 16,
              padding: 24,
              background: 'var(--red-bg)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--red-ink)' }}>The 6 Nevers</h2>
              <span className="display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>Break one = no pay. No exceptions.</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
              SGNL is a news email — not stock advice. These aren&rsquo;t style notes, they&rsquo;re hard rules. If a clip
              breaks any of them it will not be approved and it will not be paid.
            </p>
            <ol style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {NEVERS.map((n) => (
                <li key={n} style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.5 }}>{n}</li>
              ))}
            </ol>
          </section>

          {/* 2. Report every day */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>2. Report every day</h2>
            <p style={{ fontSize: 15.5, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55 }}>
              Reporting takes 2 minutes. Send <strong>one message in your Discord ticket every day by 9 PM</strong>:
            </p>
            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 15, lineHeight: 1.6 }}>
                <strong>1)</strong> A link to every clip you posted today.<br />
                <strong>2)</strong> The current view count on each of your clips still under the cap.<br />
                Posted nothing today? Send <strong>&ldquo;no posts today.&rdquo;</strong> — still send it.
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--ink-faint)', margin: 0, lineHeight: 1.5 }}>
                No daily message = your views that day don&rsquo;t get counted. Counted views = paid views. Simple.
              </p>
            </div>
          </section>

          {/* Payout / compliance note */}
          <section className="card" style={{ padding: 20, background: 'var(--cream)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="eyebrow" style={{ fontSize: 11 }}>How payouts work</span>
            <p style={{ fontSize: 14.5, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55 }}>
              Payouts start once your clip hits the view minimum and is approved, and run hourly through Whop Content
              Rewards — so check the Content Rewards channel. Payouts are subject to available campaign funds at the time
              of approval: if the pool is exhausted before your submission is reviewed, compensation can&rsquo;t be
              guaranteed. Clip early, report daily.
            </p>
          </section>

          {/* bottom CTAs */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {submit ? (
              <a className="btn btn-primary" href={submit} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15 }}>
                Submit your clips on Whop
              </a>
            ) : (
              <span className="btn btn-ghost" style={{ background: 'var(--cream)', fontSize: 15, cursor: 'default' }} aria-disabled="true">
                Submissions open at the drop
              </span>
            )}
            <a className="btn btn-ghost" href={discord} target="_blank" rel="noopener noreferrer" style={{ fontSize: 15 }}>
              Join the Discord
            </a>
          </div>
        </div>
      </main>
      <Footer discord={discord} />
    </>
  );
}
