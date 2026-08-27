import type { Metadata } from 'next';
import { ContactPanel } from '@/components/ContactPanel';
import { Footer, Nav, PageHeader } from '@/components/Sections';
import { safeExternal } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'Contact Clipsy — run a campaign',
  description: 'Talk to us about running a clipping campaign, or get help as a clipper. Campaigns start at $10,000.',
};

const EMAIL = 'darsh.apexmedia@gmail.com';

const SIDE = [
  { title: 'Email', body: 'For anything commercial — campaigns, budgets, partnerships.', link: EMAIL, href: `mailto:${EMAIL}` },
  { title: 'Response time', body: 'One business day on brand enquiries. Clipper questions in the Discord are usually answered same-day.' },
  { title: 'Who you get', body: 'The two people who run Clipsy. No account manager, no ticket queue, no handoff.' },
];

const FAQ = [
  ['What does a campaign cost?', 'They start at $10,000 and scale from there. Larger budgets run the same way — more clippers on the roster, not a different process.'],
  ['Where does my money go?', '70% is the clipper payout pool. We keep 30% for recruiting, review, moderation, reporting and payment handling. That split is published on our brands page, and clippers can read it too.'],
  ['How fast can you start?', 'A roster can be assembled in a few days once we have the footage and the rules. We will tell you honestly if your timeline is not realistic.'],
  ['Who actually makes the clips?', 'Clippers from our Discord, approved by hand for your campaign. You see the roster before anything posts.'],
  ['How do I know the views are real?', 'We report per clip and per clipper, and we show you the rejects as well as the winners. If a number looks wrong to you, ask — we would rather explain it than have you quietly stop trusting the report.'],
  ['What if it does not work?', 'You will know early, because you see performance as it lands rather than in a deck at the end. We would rather stop a campaign that is not landing than run it out for the invoice.'],
];

export default function ContactPage() {
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');

  return (
    <>
      <Nav discord={discord} />
      <main>
        <PageHeader
          eyebrow="Contact"
          title="Talk to the people who'd actually run your campaign."
          blurb="No forms that vanish into a CRM, no account manager relaying messages. Tell us what you want clipped and you get a real answer within a business day — including when we're not the right fit."
        />

        <div className="wrap section" style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 1 300px', display: 'flex', flexDirection: 'column', gap: 14, minWidth: 260 }}>
            {SIDE.map((s) => (
              <div key={s.title} className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span className="eyebrow" style={{ fontSize: 11.5 }}>{s.title}</span>
                <p style={{ fontSize: 14.5, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55 }}>{s.body}</p>
                {s.link && s.href && (
                  <a href={s.href} style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--accent)', wordBreak: 'break-all' }}>
                    {s.link}
                  </a>
                )}
              </div>
            ))}

            <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--cream)' }}>
              <span className="eyebrow" style={{ fontSize: 11.5 }}>Clipper, not a brand?</span>
              <p style={{ fontSize: 14.5, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55 }}>
                Skip all this and go straight to the board.
              </p>
              <a className="btn btn-ghost" href="/" style={{ fontSize: 14, alignSelf: 'flex-start' }}>
                See campaigns
              </a>
            </div>
          </div>

          <div style={{ flex: '1 1 460px', minWidth: 0 }}>
            <ContactPanel discord={discord} />
          </div>
        </div>

        <div className="section" style={{ background: 'var(--cream-card)', borderTop: '1px solid var(--cream-line)' }}>
          <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <h2 style={{ fontSize: 30, fontWeight: 700 }}>Questions brands actually ask</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
              {FAQ.map(([q, a]) => (
                <div key={q} className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h3 style={{ fontSize: 16.5, fontWeight: 700 }}>{q}</h3>
                  <p style={{ fontSize: 14.5, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6 }}>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer discord={discord} />
    </>
  );
}
