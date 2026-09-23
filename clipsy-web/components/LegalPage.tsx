import { Footer, Nav, PageHeader } from './Sections';
import { safeExternal } from '@/lib/safe';

export function LegalPage({ eyebrow, title, updated, children }: { eyebrow: string; title: string; updated: string; children: React.ReactNode }) {
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');
  return <>
    <Nav discord={discord} />
    <main>
      <PageHeader eyebrow={eyebrow} title={title} blurb={`Last updated ${updated}`} />
      <article className="legal-document wrap">{children}</article>
    </main>
    <Footer discord={discord} />
  </>;
}
