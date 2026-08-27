'use client';

import { useState } from 'react';

/**
 * Brand-facing enquiry panel.
 *
 * The partnership form composes a structured email rather than posting to a
 * server. That is deliberate for launch: no database of prospect contact
 * details to secure, no third-party form processor, nothing to leak — and it
 * works the day the site goes live. Swap it for a real endpoint when volume
 * justifies handling that data properly.
 */
const EMAIL = 'darsh.apexmedia@gmail.com';

type Tab = 'general' | 'support' | 'partnership';

const TABS: Array<{ id: Tab; title: string; sub: string }> = [
  { id: 'general', title: 'General enquiry', sub: 'Quickest answer is Discord' },
  { id: 'support', title: 'Clipper support', sub: 'Ask in the server' },
  { id: 'partnership', title: 'Run a campaign', sub: 'Brands and agencies' },
];

const CONTENT_TYPES = ['Livestream / VOD', 'Podcast', 'Music release', 'Product or app', 'Existing ad creative', 'Something else'];
const TIMELINES = ['ASAP — within 2 weeks', 'This month', 'Next quarter', 'Just exploring'];
const BUDGETS = ['$10,000 – $25,000', '$25,000 – $50,000', '$50,000 – $100,000', '$100,000+', 'Not sure yet'];

const field: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10, minHeight: 44,
  border: '1.5px solid var(--cream-line)', background: 'var(--cream-card)',
  color: 'var(--ink)', fontSize: 15, fontFamily: 'inherit',
};

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span style={{ fontSize: 13.5, fontWeight: 600, display: 'block', marginBottom: 6 }}>
      {children}
      {required && <span style={{ color: 'var(--accent)' }}> *</span>}
    </span>
  );
}

export function ContactPanel({ discord }: { discord: string }) {
  const [tab, setTab] = useState<Tab>('partnership');
  const [f, setF] = useState({
    name: '', email: '', company: '', promoting: '', links: '',
    contentType: '', timeline: '', budget: '', notes: '',
  });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  const ready = f.name.trim() && f.email.trim() && f.promoting.trim() && f.budget;

  const mailto = () => {
    const body = [
      `Name: ${f.name}`,
      `Email: ${f.email}`,
      f.company && `Company: ${f.company}`,
      '',
      `Promoting: ${f.promoting}`,
      f.links && `Links: ${f.links}`,
      f.contentType && `Content to clip: ${f.contentType}`,
      f.timeline && `Timeline: ${f.timeline}`,
      `Budget: ${f.budget}`,
      f.notes && `\nNotes:\n${f.notes}`,
    ].filter(Boolean).join('\n');
    return `mailto:${EMAIL}?subject=${encodeURIComponent(`Campaign enquiry — ${f.company || f.name}`)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 16.5, fontWeight: 600, marginBottom: 4 }}>What do you need?</div>
          <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Pick one and we&rsquo;ll route you to the fastest answer.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {TABS.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-pressed={on}
                style={{
                  textAlign: 'left', padding: '14px 16px', borderRadius: 12, cursor: 'pointer', minHeight: 44,
                  border: `1.5px solid ${on ? 'var(--accent)' : 'var(--cream-line)'}`,
                  background: on ? 'var(--cream)' : 'transparent', fontFamily: 'inherit',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{t.title}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>{t.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {tab !== 'partnership' ? (
        <div className="card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ fontSize: 21, fontWeight: 700 }}>
            {tab === 'general' ? 'Ask in the Discord' : 'Clipper support lives in the Discord'}
          </h2>
          <p style={{ fontSize: 15, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6 }}>
            {tab === 'general'
              ? 'It is where we actually are. Questions about campaigns, rates, or how any of this works get answered there faster than by email — usually the same day, often by a clipper who has already been paid on the campaign you are asking about.'
              : 'Post in #getting-started. Somebody who has run the campaign you are stuck on will answer, and we read every channel.'}
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.9 }}>
            <li>Answers from people actually doing it</li>
            <li>Rate changes posted as they happen</li>
            <li>Free — no application, no follower minimum</li>
          </ul>
          <a className="btn btn-primary" href={discord} target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
            Join the Discord
          </a>
          <p style={{ fontSize: 13, color: 'var(--ink-faint)', margin: 0 }}>
            Prefer email? <a href={`mailto:${EMAIL}`} style={{ color: 'var(--accent)' }}>{EMAIL}</a>
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 700, marginBottom: 6 }}>Run a campaign with us</h2>
            <p style={{ fontSize: 15, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.6 }}>
              Tell us what you want clipped and roughly what you have to spend. You get a real answer within one
              business day — including &ldquo;we&rsquo;re not the right fit&rdquo; when we&rsquo;re not.
              Campaigns start at <strong>$10,000</strong>.
            </p>
          </div>

          <div>
            <span className="eyebrow" style={{ fontSize: 11, display: 'block', marginBottom: 12 }}>Your details</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <Label required>Name</Label>
                <input style={field} value={f.name} onChange={set('name')} placeholder="Who are we talking to?" />
              </div>
              <div>
                <Label required>Email</Label>
                <input style={field} type="email" value={f.email} onChange={set('email')} placeholder="you@company.com" />
              </div>
              <div>
                <Label>Company</Label>
                <input style={field} value={f.company} onChange={set('company')} placeholder="Optional" />
              </div>
              <div>
                <Label>Timeline</Label>
                <select style={field} value={f.timeline} onChange={set('timeline')}>
                  <option value="">Select</option>
                  {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <span className="eyebrow" style={{ fontSize: 11, display: 'block', marginBottom: 12 }}>What you want clipped</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <Label required>What are you promoting?</Label>
                <input style={field} value={f.promoting} onChange={set('promoting')} placeholder="A product, an artist, a podcast, an app…" />
              </div>
              <div>
                <Label>Links</Label>
                <input style={field} value={f.links} onChange={set('links')} placeholder="Site, socials, or the footage itself" />
                <span style={{ fontSize: 12.5, color: 'var(--ink-faint)', display: 'block', marginTop: 5 }}>
                  A link means we can answer properly instead of asking three follow-up questions.
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                <div>
                  <Label>Content type</Label>
                  <select style={field} value={f.contentType} onChange={set('contentType')}>
                    <option value="">Select</option>
                    {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label required>Budget</Label>
                  <select style={field} value={f.budget} onChange={set('budget')}>
                    <option value="">Select</option>
                    {BUDGETS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span style={{ fontSize: 12.5, color: 'var(--ink-faint)', display: 'block', marginTop: 5 }}>$10,000 minimum</span>
                </div>
              </div>
              <div>
                <Label>Anything else?</Label>
                <textarea style={{ ...field, minHeight: 96, resize: 'vertical' }} value={f.notes} onChange={set('notes')} placeholder="Goals, past clipping, constraints, questions…" />
              </div>
            </div>
          </div>

          <div>
            <a
              className="btn btn-primary"
              href={ready ? mailto() : undefined}
              aria-disabled={!ready}
              style={{
                width: '100%', padding: '15px 24px', fontSize: 16,
                opacity: ready ? 1 : 0.45, pointerEvents: ready ? 'auto' : 'none',
              }}
            >
              Send enquiry
            </a>
            <p style={{ fontSize: 12.5, color: 'var(--ink-faint)', margin: '12px 0 0', lineHeight: 1.55, textAlign: 'center' }}>
              This opens your email app with the details filled in — nothing is stored on our servers.
              Or write to <a href={`mailto:${EMAIL}`} style={{ color: 'var(--accent)' }}>{EMAIL}</a> directly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
