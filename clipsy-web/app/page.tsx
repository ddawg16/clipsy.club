import type { Metadata } from 'next';
import { CampaignHub } from '@/components/CampaignHub';
import { Nav, Footer, PageHeader } from '@/components/Sections';
import { getCampaigns, getCounts, getLastRun } from '@/lib/data';
import { freshness } from '@/lib/format';
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
  const [campaigns, counts, lastRun] = await Promise.all([
    getCampaigns('hot', 300),
    getCounts(),
    getLastRun(),
  ]);
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');

  return (
    <>
      <Nav discord={discord} />
      <main>
        <PageHeader
          compact
          eyebrow="The board"
          title="Every open campaign we can reach."
          meta={
            <span className="pill pill-neutral">
              <span className="dot" />
              {counts.campaigns} live across {counts.sources} networks · updated {freshness(lastRun)}
            </span>
          }
        />
        <CampaignHub campaigns={campaigns} freshness={freshness(lastRun)} />
      </main>
      <Footer discord={discord} />
    </>
  );
}
