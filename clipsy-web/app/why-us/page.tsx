import type { Metadata } from 'next';
import { Differentiators, Footer, MoneyAndExpectations, Nav, PageHeader } from '@/components/Sections';
import { safeExternal } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'Why us — Clipsy',
  description: 'How we make money, what we expect from you, and what you get in return. Written plainly.',
};

export default function WhyUsPage() {
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');
  return (
    <>
      <Nav discord={discord} />
      <main>
        <PageHeader
          eyebrow="Why us"
          title="You should know how we get paid before you clip for us."
          blurb="Most platforms in this space will not tell you where their cut comes from. Here is ours, in full."
        />
        <MoneyAndExpectations />
        <Differentiators />
      </main>
      <Footer discord={discord} />
    </>
  );
}
