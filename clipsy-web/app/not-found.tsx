import { Footer, Nav } from '@/components/Sections';
import { safeExternal } from '@/lib/safe';

export default function NotFound() {
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');
  return (
    <>
      <Nav discord={discord} />
      <main className="wrap section" style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: '48vh' }}>
        <span className="eyebrow">404</span>
        <h1 style={{ fontSize: 36, fontWeight: 700 }}>That page isn&rsquo;t here.</h1>
        <p style={{ fontSize: 16, color: 'var(--ink-soft)', margin: 0, maxWidth: 480, lineHeight: 1.55 }}>
          If it was a campaign, it probably closed or got pulled — that happens, and it&rsquo;s exactly the sort of
          thing The Wire records.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
          <a className="btn btn-primary" href="/">See open campaigns</a>
          <a className="btn btn-ghost" href="/wire">Check The Wire</a>
        </div>
      </main>
      <Footer discord={discord} />
    </>
  );
}
