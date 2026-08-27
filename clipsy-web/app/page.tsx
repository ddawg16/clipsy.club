import type { Metadata } from 'next';
import { FinalCta, Footer, Hero, LiveBoard, Nav, TeamPicks, TwoDoors, WireAndSteps } from '@/components/Sections';
import { getCampaigns, getCounts, getTeamPicks, getWire } from '@/lib/data';
import { safeExternal } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'Clipsy — Everything clipping, in one place',
  description: 'Live clipping campaigns from every network, ranked by how hot they run and how likely you are to actually get paid.',
};

export const revalidate = 300;

export default async function HomePage() {
  const [campaigns, wire, counts, picks] = await Promise.all([
    getCampaigns('hot', 6),
    getWire(4),
    getCounts(),
    getTeamPicks(),
  ]);
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');

  return (
    <>
      <Nav discord={discord} />
      <main>
        <Hero discord={discord} liveCount={counts.campaigns} sourceCount={counts.sources} wireCount={counts.wire} />
        <TwoDoors discord={discord} />
        <TeamPicks picks={picks} />
        <LiveBoard campaigns={campaigns} />
        <WireAndSteps events={wire} />
        <FinalCta discord={discord} />
      </main>
      <Footer discord={discord} />
    </>
  );
}
