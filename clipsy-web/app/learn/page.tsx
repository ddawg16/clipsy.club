import type { Metadata } from 'next';
import { Footer, Nav, PageHeader, StarterGuide } from '@/components/Sections';
import { safeExternal } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'Learn to clip — Clipsy',
  description: 'From your first claim to getting picked for the good rosters. Nobody is born knowing this.',
};

export default function LearnPage() {
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');
  return (
    <>
      <Nav discord={discord} />
      <main>
        <PageHeader
          eyebrow="Learn to clip"
          title="Nobody is born knowing this."
          blurb="Everything below is what we actually tell a new clipper. It is short on purpose — the rest is answered live in the Discord, by people who have been paid on the campaign you are asking about."
        />
        <div className="wrap section">
          <StarterGuide />
          <div className="card" style={{ marginTop: 28, padding: 28, display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 620 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Faster than any guide</h2>
            <p style={{ fontSize: 15, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55 }}>
              Post the question in <strong>#getting-started</strong>. Somebody who has actually been paid on that
              campaign will answer, usually the same day.
            </p>
            <a className="btn btn-primary" href={discord} target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start' }}>
              Get access
            </a>
          </div>
        </div>
      </main>
      <Footer discord={discord} />
    </>
  );
}
