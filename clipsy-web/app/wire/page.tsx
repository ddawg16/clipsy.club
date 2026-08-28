import type { Metadata } from 'next';
import { Nav, Footer, PageHeader, WireFeed } from '@/components/Sections';
import { getWire } from '@/lib/data';
import { safeExternal } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'The Wire — Clipsy',
  description: 'Rate moves, new drops, raised qualifiers and campaigns that vanish without notice. Every change we catch, as we catch it.',
};

// Always render fresh from the database. This is a live board — a cached
// snapshot on a low-traffic domain is worse than a fast DB read each visit.
export const dynamic = 'force-dynamic';

export default async function WirePage() {
  const events = await getWire(80);
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');

  return (
    <>
      <Nav discord={discord} />
      <main>
        <PageHeader
          eyebrow="The Wire"
          title="Nobody tells you when a network quietly cuts rates."
          blurb="Every time our ingest runs, it snapshots each campaign and compares it to the run before. Anything that moved shows up here — including campaigns that vanish without a closing announcement, which nobody else reports."
        />
        <div className="wrap section">
          <WireFeed events={events} full />
        </div>
      </main>
      <Footer discord={discord} />
    </>
  );
}
