import type { Metadata } from 'next';
import { FaqList, Footer, Nav, PageHeader } from '@/components/Sections';
import { safeExternal } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'Before you join — Clipsy',
  description: 'Straight answers about what you need, what it costs, and when this is not worth your time.',
};

export default function FaqPage() {
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');
  return (
    <>
      <Nav discord={discord} />
      <main>
        <PageHeader
          eyebrow="Before you join"
          title="We'd rather lose you here than have you waste a week."
          blurb="Straight answers, including the ones that talk you out of it."
        />
        <div className="wrap section" style={{ maxWidth: 760 }}>
          <FaqList />
        </div>
      </main>
      <Footer discord={discord} />
    </>
  );
}
