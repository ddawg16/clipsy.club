import type { Campaign, WireEvent } from '@/lib/types';
import { ago, money, rate, timeLeft, views } from '@/lib/format';
import { safeHref } from '@/lib/safe';
import { ArrowRight, DiscordIcon, Logo } from './Logo';
import { CampaignCard } from './CampaignCard';
import { SiteNav } from './SiteNav';

/* ------------------------------------------------------------------ nav */

/** Thin server-side wrapper so every page keeps importing `Nav` from here. */
export function Nav({ discord }: { discord: string }) {
  return <SiteNav discord={discord} />;
}

/* --------------------------------------------------------- page header */

/** Masthead for every page that is not the homepage. */
export function PageHeader({ eyebrow, title, blurb, meta }: { eyebrow: string; title: string; blurb?: string; meta?: React.ReactNode }) {
  return (
    <div style={{ borderBottom: '1px solid var(--cream-line)', background: 'var(--cream-card)' }}>
      <div className="wrap" style={{ padding: '56px 32px 40px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <span className="eyebrow">{eyebrow}</span>
        <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 44px)', fontWeight: 700, lineHeight: 1.08, maxWidth: 720 }}>{title}</h1>
        {blurb && <p style={{ fontSize: 16.5, color: 'var(--ink-soft)', margin: 0, maxWidth: 620, lineHeight: 1.55 }}>{blurb}</p>}
        {meta && <div style={{ marginTop: 6 }}>{meta}</div>}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- hero */

export function Hero({
  discord,
  liveCount,
  sourceCount,
  wireCount,
  budget,
}: {
  discord: string;
  liveCount: number;
  sourceCount: number;
  wireCount: number;
  budget: number;
}) {
  return (
    <div className="wrap" style={{ paddingTop: 88, paddingBottom: 64 }}>
      <div style={{ display: 'flex', gap: 64, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: 26, minWidth: 0 }}>
          <span className="pill pill-neutral" style={{ alignSelf: 'flex-start' }}>
            <span className="dot" />
            {liveCount > 0
              ? `${liveCount} campaigns live right now, across ${sourceCount} networks`
              : 'Indexing campaigns from every network we can reach'}
          </span>

          <h1 style={{ fontSize: 'clamp(38px, 6vw, 60px)', lineHeight: 1.02, fontWeight: 700, maxWidth: 640 }}>
            Everything clipping,
            <br />
            in one place.
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--ink-soft)', maxWidth: 520, margin: 0 }}>
            We don&rsquo;t run one clipping program — we watch all of them. Campaigns from across the networks where
            clippers actually get paid, human-reviewed and dropped into one feed. No more five tabs open.
          </p>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <a className="btn btn-primary" href="/" style={{ padding: '15px 26px', fontSize: 16 }}>
              Start clipping
              <ArrowRight />
            </a>
            <a className="btn btn-ghost" href="/brands" style={{ padding: '15px 24px', fontSize: 16 }}>
              Start a campaign
            </a>
          </div>

          <p style={{ fontSize: 13.5, color: 'var(--ink-faint)', margin: 0 }}>
            Free to join. No follower minimum. We&rsquo;ll tell you when a campaign isn&rsquo;t worth your time.
          </p>
        </div>

        <StatsPanel liveCount={liveCount} sourceCount={sourceCount} wireCount={wireCount} budget={budget} />
      </div>
    </div>
  );
}

/**
 * Real numbers only. These come straight from the database — campaign count,
 * network count, Wire events — so nothing here is borrowed from another
 * platform. A live figure beats a big one.
 */
function StatsPanel({ liveCount, sourceCount, wireCount, budget }: { liveCount: number; sourceCount: number; wireCount: number; budget: number }) {
  const stats = [
    { value: String(liveCount || '—'), label: 'campaigns on the board', accent: true },
    { value: budget > 0 ? money(budget) : '—', label: 'in campaign pools right now' },
    { value: String(sourceCount || '—'), label: 'networks indexed' },
    { value: String(wireCount || '—'), label: 'changes caught this week' },
  ];

  return (
    <div className="card" style={{ flex: '1 1 340px', padding: 28, display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
      <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="dot" />
        Live right now
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 22 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="display tabular" style={{ fontSize: 34, fontWeight: 700, color: s.accent ? 'var(--accent)' : undefined }}>
              {s.value}
            </span>
            <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: 'var(--cream-line)' }} />
      <p style={{ fontSize: 12, color: 'var(--ink-faint)', margin: 0, lineHeight: 1.5 }}>
        Counted from our own board, not borrowed from anyone else&rsquo;s marketing page. If a number here is wrong,
        tell us and we&rsquo;ll fix it.
      </p>
    </div>
  );
}

/* --------------------------------------------------- two doors + trust */

/** Both audiences get a path within one screen instead of hunting the nav. */
export function TwoDoors({ discord }: { discord: string }) {
  const doors = [
    {
      eyebrow: "If you're clipping",
      title: 'Find the campaigns worth your night',
      body: 'Every open campaign we can reach, ranked by how hot it is running and how likely you are to actually get paid. Free, no follower minimum.',
      cta: 'Get access',
      href: discord,
      external: true,
      primary: true,
    },
    {
      eyebrow: "If you're running a campaign",
      title: 'Get your footage clipped properly',
      body: 'A reviewed roster instead of an open board, your rules enforced while it runs, verified numbers at the end, and one invoice.',
      cta: 'Start a campaign',
      href: '/brands',
      external: false,
      primary: false,
    },
  ];

  return (
    <div className="wrap" style={{ paddingBottom: 72 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {doors.map((d) => (
          <div
            key={d.eyebrow}
            className="card"
            style={{
              padding: 28, display: 'flex', flexDirection: 'column', gap: 12,
              borderColor: d.primary ? 'var(--accent)' : 'var(--cream-line)',
            }}
          >
            <span className="eyebrow">{d.eyebrow}</span>
            <h3 style={{ fontSize: 22, fontWeight: 700 }}>{d.title}</h3>
            <p style={{ fontSize: 15, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55, flex: 1 }}>{d.body}</p>
            <a
              className={d.primary ? 'btn btn-primary' : 'btn btn-ghost'}
              href={d.href}
              {...(d.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              style={{ alignSelf: 'flex-start', marginTop: 6 }}
            >
              {d.cta}
              <ArrowRight />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

const YOU_BRING = [
  ['A laptop or desktop', 'Phone-only editing will not keep up with the faster campaigns. This is the honest bar.'],
  ['A few hours a week', 'Consistent beats occasional. Clippers who post once a fortnight do not get onto the good rosters.'],
  ['An account that posts', 'On whichever platform the campaign runs. We will tell you which before you commit.'],
  ['Willingness to read a brief', 'Most rejected clips are rejected for ignoring the brief, not for being badly edited.'],
];

const WE_HANDLE = [
  ['Finding the campaigns', 'Across every network we can reach, re-checked on every ingest run.'],
  ['Telling you which are worth it', 'Heat and Effort, so you are not guessing which pool is already full.'],
  ['Flagging the bad news', 'Rate cuts, raised qualifiers, and campaigns that vanish without a word.'],
  ['Getting you onto rosters', 'A team captain who knows your numbers, not a support queue.'],
];

/** The "what's the catch" section. Clippers ask it; better we answer first. */
export function MoneyAndExpectations() {
  return (
    <div className="section" style={{ background: 'var(--ink)' }}>
      <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <span className="eyebrow" style={{ color: 'rgba(242,236,217,0.55)' }}>Where the money comes from</span>
            <h2 style={{ fontSize: 30, fontWeight: 700, color: 'var(--cream)', maxWidth: 380 }}>
              You should know how we get paid before you clip for us.
            </h2>
          </div>
          <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(242,236,217,0.75)', margin: 0 }}>
              Brands pay for attention. Some run campaigns through the networks we index — in those, you are paid by that
              network on their terms, and we earn nothing from your clip. We list them because a board with only our own
              campaigns would be a worse board.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(242,236,217,0.75)', margin: 0 }}>
              On campaigns we run ourselves, the brand pays us and we pay you. We keep 30% for review, moderation,
              reporting and payment handling. That number is on our brands page too, because you should both be reading
              the same one.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(242,236,217,0.75)', margin: 0 }}>
              What we never do is take a cut of what another network already owes you.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid rgba(250,241,216,0.12)' }}>
          <div style={{ flex: '1 1 340px' }}>
            <span className="eyebrow" style={{ color: 'rgba(242,236,217,0.55)' }}>You bring</span>
            <div style={{ marginTop: 16 }}>
              {YOU_BRING.map(([t, b]) => (
                <div key={t} style={{ padding: '14px 0', borderBottom: '1px solid rgba(250,241,216,0.1)' }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--cream)', marginBottom: 3 }}>{t}</div>
                  <div style={{ fontSize: 13.5, color: 'rgba(242,236,217,0.6)', lineHeight: 1.5 }}>{b}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: '1 1 340px' }}>
            <span className="eyebrow" style={{ color: 'rgba(242,236,217,0.55)' }}>We handle</span>
            <div style={{ marginTop: 16 }}>
              {WE_HANDLE.map(([t, b]) => (
                <div key={t} style={{ padding: '14px 0', borderBottom: '1px solid rgba(250,241,216,0.1)' }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--cream)', marginBottom: 3 }}>{t}</div>
                  <div style={{ fontSize: 13.5, color: 'rgba(242,236,217,0.6)', lineHeight: 1.5 }}>{b}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- live board */

export function LiveBoard({ campaigns }: { campaigns: Campaign[] }) {
  const featured = campaigns.slice(0, 6);

  return (
    <div
      id="board"
      className="section"
      style={{ background: 'var(--cream-card)', borderTop: '1px solid var(--cream-line)', borderBottom: '1px solid var(--cream-line)' }}
    >
      <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 520 }}>
            <span className="eyebrow">Running hot</span>
            <h2 style={{ fontSize: 32, fontWeight: 700 }}>What&rsquo;s moving right now.</h2>
          </div>
          <a className="btn btn-ghost" href="/" style={{ background: 'var(--cream)' }}>
            See every campaign
            <ArrowRight size={15} />
          </a>
        </div>

        {featured.length === 0 ? (
          <div className="card">
            <p className="empty">Nothing on the board yet. This fills the first time the ingest job runs.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(252px, 1fr))', gap: 18 }}>
            {featured.map((c) => <CampaignCard key={c.id} c={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}

/** Hand-picked by the team. Nothing automated writes these. */
export function TeamPicks({ picks }: { picks: Campaign[] }) {
  if (picks.length === 0) return null;

  return (
    <div className="wrap section" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560 }}>
        <span className="eyebrow" style={{ color: 'var(--accent)' }}>Picked by us</span>
        <h2 style={{ fontSize: 32, fontWeight: 700 }}>If you&rsquo;ve never been paid for a clip, start here.</h2>
        <p style={{ fontSize: 15.5, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
          Chosen by hand, not by the algorithm — low view minimums, readable briefs, and payouts that actually land.
          We change these when the campaigns change.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(252px, 1fr))', gap: 18 }}>
        {picks.map((c) => <CampaignCard key={c.id} c={c} pick />)}
      </div>
    </div>
  );
}

/* ------------------------------------------------------ wire + how it works */


/** The feed itself, reused on the homepage and on /wire. */
export function WireFeed({ events, full = false }: { events: WireEvent[]; full?: boolean }) {
  return (
    <div style={{ background: 'var(--ink)', borderRadius: 16, padding: 22, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 14, marginBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <span className="dot" />
        <span className="display" style={{ fontSize: 12.5, fontWeight: 600, color: '#F2ECD9', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          Live feed
        </span>
      </div>

      {events.length === 0 ? (
        <p style={{ color: 'rgba(242,236,217,0.55)', fontSize: 13.5, lineHeight: 1.5, margin: '12px 0' }}>
          The Wire starts the moment ingest runs twice — it reports the difference between one run and the next, so
          there is nothing honest to show until then.
        </p>
      ) : (
        events.map((e, i) => (
          <div key={e.id} style={{ display: 'flex', gap: 14, padding: '11px 0', borderBottom: i === events.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
            <span className="display" style={{ fontSize: 12, color: 'rgba(242,236,217,0.5)', flexShrink: 0, paddingTop: 1, minWidth: 66 }}>
              {ago(e.created_at)}
            </span>
            <span style={{ fontSize: 13.5, lineHeight: 1.4, color: e.severity === 'good' ? 'var(--accent)' : '#F2ECD9' }}>
              {e.headline}
            </span>
          </div>
        ))
      )}

      {!full && events.length > 0 && (
        <a href="/wire" style={{ marginTop: 16, fontSize: 13.5, fontWeight: 600, color: 'var(--accent)' }}>
          See the full Wire →
        </a>
      )}
    </div>
  );
}

const STEPS = [
  ['01', 'Join', 'Pick campaigns from any network on the board. One place, no matter where the campaign actually lives.'],
  ['02', 'Claim', 'A human reviews your claim and puts you on the roster — not a bot approving anyone into a rate that is about to get cut.'],
  ['03', 'Post', "Clip it, post it, get paid on that network's own schedule. We just make sure you knew it was there."],
];

export function WireAndSteps({ events }: { events: WireEvent[] }) {
  return (
    <div className="wrap section" style={{ display: 'flex', gap: 56, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
        <span className="eyebrow">The Wire</span>
        <h2 style={{ fontSize: 30, fontWeight: 700, maxWidth: 420 }}>Nobody tells you when a network quietly cuts rates.</h2>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', margin: 0, maxWidth: 420, lineHeight: 1.5 }}>
          A running log of rate moves, new drops and payout problems across every network we track — updated the same
          day it happens.
        </p>
        <div style={{ marginTop: 8 }}>
          <WireFeed events={events} />
        </div>
      </div>

      <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
        <span className="eyebrow">How it works</span>
        <h2 style={{ fontSize: 30, fontWeight: 700 }}>Three steps. Not five.</h2>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', margin: '0 0 6px', lineHeight: 1.5 }}>
          We didn&rsquo;t need to make it complicated to make it look serious.
        </p>
        <div>
          {STEPS.map(([n, title, body], i) => (
            <div key={n} style={{ display: 'flex', gap: 18, padding: '20px 0', borderBottom: i === STEPS.length - 1 ? 'none' : '1px solid var(--cream-line)' }}>
              <span className="display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', width: 32, flexShrink: 0 }}>{n}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- differentiators */

const DIFFS = [
  { title: 'One dashboard, every network', body: 'No more tab-switching between a dozen platforms and server DMs.' },
  { title: 'A human reviews every claim', body: 'Not a bot waving everyone into a campaign that is about to get its rate cut.' },
  { title: 'Dedicated team rosters', body: 'A team captain who knows your numbers — not a support ticket queue.' },
  { title: 'We flag rate moves same-day', body: 'The Wire catches cuts, delays, and new drops before you find out the hard way.' },
];

export function Differentiators() {
  return (
    <div className="section" style={{ background: 'var(--ink)' }}>
      <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
        <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span className="eyebrow" style={{ color: 'rgba(242,236,217,0.55)' }}>
            Why clip through us
          </span>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: 'var(--cream)' }}>
            Short answer: you don&rsquo;t have to pick one network anymore.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18 }}>
          {DIFFS.map((d) => (
            <div
              key={d.title}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                padding: 22,
                borderRadius: 14,
                background: 'rgba(250,241,216,0.05)',
                border: '1px solid rgba(250,241,216,0.12)',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--cream)' }}>{d.title}</div>
              <div style={{ fontSize: 13.5, color: 'rgba(242,236,217,0.6)', lineHeight: 1.5 }}>{d.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ learn + faq */



/**
 * Real answers, written here. This replaces six cards that promised guides
 * nobody had written — an empty promise is worse than a short answer.
 */
const STARTER = [
  {
    q: 'Your first 48 hours',
    a: 'Pick ONE campaign, not five. Read its brief completely before you cut anything. Post three to five clips, then wait for approvals before you scale. You learn more from your first rejection than your first ten clips.',
  },
  {
    q: 'Reading a rate card without getting burned',
    a: 'The headline CPM is not the number that matters. Check the view minimum before you earn anything, how full the pool already is, and how long payouts take. $300/100k with a 100k qualifier pays worse than $150/100k with no minimum if you are new.',
  },
  {
    q: 'Why clips get rejected',
    a: 'Almost always the brief, not the editing. Wrong length, missing tag, wrong sound, banned footage. Read it twice — the brief lives on the network running the campaign, and we link it on every campaign page.',
  },
  {
    q: 'Editing for retention',
    a: 'The first 1.5 seconds decide everything. Cut the setup, open on the payoff. Captions on. Under 30 seconds unless the campaign says otherwise.',
  },
  {
    q: 'Getting onto a good roster',
    a: 'Post consistently, hit approvals, do not argue with rejections. Team captains watch approval rate far more closely than raw volume.',
  },
];

export function StarterGuide() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {STARTER.map((g, i) => (
        <div key={g.q} style={{ padding: '22px 0', borderBottom: i === STARTER.length - 1 ? 'none' : '1px solid var(--cream-line)' }}>
          <h3 style={{ fontSize: 18.5, fontWeight: 700, marginBottom: 8 }}>{g.q}</h3>
          <p style={{ fontSize: 15.5, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6, maxWidth: '68ch' }}>{g.a}</p>
        </div>
      ))}
    </div>
  );
}

const FAQ = [
  ['Do I need a big following?', 'No — never have. Campaigns care about clip performance, not your follower count.'],
  ['What do I actually need to start?', 'A laptop for editing — phone-only will not keep up with the faster campaigns — and an account on whichever network a campaign runs on. We will tell you which.'],
  ['Is this free to join?', 'Yes. Always free to browse the board and join the Discord.'],
  ['Who actually pays me?', 'On campaigns from networks we index, that network pays you on their terms and we earn nothing from your clip. On campaigns we run ourselves, we pay you and keep 30%.'],
  ['When is this not worth it?', 'If you can only edit on a phone, or you can only post once a fortnight. Both are fine choices — they just will not get you onto the rosters worth being on.'],
];

export function FaqList() {
  return (
    <div>
      {FAQ.map(([q, a], i) => (
        <div key={q} style={{ padding: '20px 0', borderBottom: i === FAQ.length - 1 ? 'none' : '1px solid var(--cream-line)' }}>
          <div style={{ fontWeight: 600, fontSize: 16.5, marginBottom: 6 }}>{q}</div>
          <div style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.55 }}>{a}</div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------- cta + footer */

export function FinalCta({ discord }: { discord: string }) {
  return (
    <div className="wrap section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 22 }}>
      <h2 style={{ fontSize: 36, fontWeight: 700, maxWidth: 560 }}>
        Every network is already live. You&rsquo;re just not in the feed yet.
      </h2>
      <a className="btn btn-primary" href={discord} target="_blank" rel="noopener noreferrer" style={{ padding: '16px 28px', fontSize: 16 }}>
        <DiscordIcon />
        Join the Discord
      </a>
    </div>
  );
}

export function Footer({ discord }: { discord: string }) {
  return (
    <footer style={{ borderTop: '1px solid var(--cream-line)', padding: '56px 0 40px' }}>
      <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Logo size={30} />
            <span className="display" style={{ fontSize: 17, fontWeight: 700 }}>
              Clipsy
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-faint)', lineHeight: 1.5, margin: 0 }}>
            Every clipping network, one board. Built and moderated by clippers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="eyebrow" style={{ fontSize: 11.5 }}>
              Product
            </span>
            <a href="/" style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Campaigns</a>
            <a href="/wire" style={{ fontSize: 14, color: 'var(--ink-soft)' }}>The Wire</a>
            <a href="/clip" style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Get paid to clip</a>
            <a href="/learn" style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Learn &amp; Earn</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="eyebrow" style={{ fontSize: 11.5 }}>
              For brands
            </span>
            <a href="/brands" style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Run a campaign</a>
            <a href="/contact" style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Contact us</a>
            <a href="/brands#how" style={{ fontSize: 14, color: 'var(--ink-soft)' }}>How it works</a>
            <a href="/brands#pricing" style={{ fontSize: 14, color: 'var(--ink-soft)' }}>What it costs</a>
            <a href="/enterprise" style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Enterprise</a>
            <a href="/how-campaigns-work" style={{ fontSize: 14, color: 'var(--ink-soft)' }}>How campaigns work</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="eyebrow" style={{ fontSize: 11.5 }}>
              Community
            </span>
            <a href={discord} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
              Discord
            </a>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--cream-line)' }}>
        <span style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>
          © Clipsy Club. Independent — not affiliated with the networks we index. Every campaign links back to its
          source.
        </span>
      </div>
    </footer>
  );
}


/* --------------------------------------------------- run a network? band */

/**
 * The other side of the marketplace. Networks and brands finding this band is
 * how the index grows without us scraping anyone who would rather we did not.
 */
export function NetworkCta() {
  return (
    <div className="wrap section">
      <div
        className="card"
        style={{
          padding: 32,
          display: 'flex',
          gap: 32,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="eyebrow">Running campaigns of your own?</span>
          <h2 style={{ fontSize: 25, fontWeight: 700, maxWidth: 520 }}>
            If you run a network or a brand campaign, we&rsquo;ll list it here.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55, maxWidth: 520 }}>
            Listing is free and every card deep-links straight back to you — we index, we never re-host. Send us the
            campaign and we&rsquo;ll put it in front of the clippers already checking this board.
          </p>
        </div>
        <a className="btn btn-primary" href="/contact" style={{ padding: '15px 26px', fontSize: 16, flexShrink: 0 }}>
          Get your campaigns listed
        </a>
      </div>
    </div>
  );
}
