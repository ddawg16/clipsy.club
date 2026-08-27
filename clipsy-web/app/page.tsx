import type { Metadata } from 'next';
import { CampaignHub } from '@/components/CampaignHub';
import { Footer, Nav, PageHeader, TeamPicks } from '@/components/Sections';
import { getCampaigns, getCounts, getLastRun, getTeamPicks } from '@/lib/data';
import { freshness, money } from '@/lib/format';
import { safeExternal } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'Clipsy — every open clipping campaign, in one place',
  description:
    'Every open clipping campaign we can reach, ranked by how hot it runs and how likely you are to actually get paid. We index — we never re-host.',
};

export const revalidate = 300;

/**
 * The board IS the landing page. Anyone arriving here wants campaigns, not a
 * pitch — so they get the list first and the argument for us second.
 */
export default async function BoardPage() {
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
              {counts.campaigns} live across {counts.sources} networks
              {counts.budget > 0 ? ` · ${money(counts.budget)} in open pools` : ''} · updated {freshness(lastRun)}
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
