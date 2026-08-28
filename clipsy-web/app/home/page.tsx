import type { Metadata } from 'next';
import { Footer, Hero, Nav, NetworkCta, TwoDoors, WireAndSteps } from '@/components/Sections';
import { getCounts, getWire } from '@/lib/data';
import { safeExternal } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'Home — Clipsy',
  description: 'Live clipping campaigns from every network, ranked by how hot they run and how likely you are to actually get paid.',
};

export const revalidate = 120;

export default async function AboutHomePage() {
  const [wire, counts] = await Promise.all([
    getWire(4),
    getCounts(),
  ]);
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');

  return (
    <>
      <Nav discord={discord} />
      <main>
        <Hero
          discord={discord}
          liveCount={counts.campaigns}
          sourceCount={counts.sources}
          wireCount={counts.wire}
          budget={counts.budget}
        />
        <TwoDoors discord={discord} />
        <WireAndSteps events={wire} />
        <NetworkCta />
      </main>
      <Footer discord={discord} />
    </>
  );
}
