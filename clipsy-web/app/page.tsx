import type { Metadata } from 'next';
import { CampaignHub } from '@/components/CampaignHub';
import { Nav, Footer, PageHeader } from '@/components/Sections';
import { getCampaigns, getCounts, getLastRun } from '@/lib/data';
import { freshness } from '@/lib/format';
import { safeExternal } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'Clipsy — active campaigns',
  description:
    'Active Clipsy campaigns managed through our Discord bot.',
};

// Always render fresh from the database. This is a live board — a cached
// snapshot on a low-traffic domain is worse than a fast DB read each visit.
export const dynamic = 'force-dynamic';

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
          title="Active Clipsy campaigns."
          meta={
            <span className="pill pill-neutral">
              <span className="dot" />
              {counts.campaigns} active campaign{counts.campaigns === 1 ? '' : 's'}
            </span>
          }
        />
        <CampaignHub campaigns={campaigns} freshness={freshness(lastRun)} />
      </main>
      <Footer discord={discord} />
    </>
  );
}
