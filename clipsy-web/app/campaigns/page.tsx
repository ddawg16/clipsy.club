import type { Metadata } from 'next';
import { CampaignHub } from '@/components/CampaignHub';
import { Footer, Nav, PageHeader, TeamPicks } from '@/components/Sections';
import { getCampaigns, getCounts, getLastRun, getTeamPicks } from '@/lib/data';
import { freshness } from '@/lib/format';
import { safeExternal } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'Campaigns — Clipsy',
  description: 'Every open clipping campaign we can reach, ranked by heat and by how likely you are to actually get paid.',
};

export const revalidate = 300;

export default async function CampaignsPage() {
  const [campaigns, counts, picks, lastRun] = await Promise.all([
    getCampaigns('hot', 300),
    getCounts(),
    getTeamPicks(),
    getLastRun(),
  ]);
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');

  return (
    <>
      <Nav discord={discord} />
      <main>
        <PageHeader
          eyebrow="The board"
          title="Every open campaign we can reach."
          blurb="Tagged with the network it actually lives on, ranked by our own scoring, and linked straight back to the source. We index — we never re-host."
          meta={
            <span className="pill pill-neutral">
              <span className="dot" />
              {counts.campaigns} live across {counts.sources} networks · updated {freshness(lastRun)}
            </span>
          }
        />
        <TeamPicks picks={picks} />
        <CampaignHub campaigns={campaigns} freshness={freshness(lastRun)} />
      </main>
      <Footer discord={discord} />
    </>
  );
}
