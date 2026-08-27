import type { Metadata } from 'next';
import { Footer, Nav } from '@/components/Sections';
import { CATEGORIES, GUIDES, guidesIn } from '@/lib/guides';
import { safeExternal } from '@/lib/safe';

export const metadata: Metadata = {
  title: 'Learn & Earn — guides for clippers | Clipsy',
  description:
    'Everything you need to start making money as a clipper. Platform guides, honest earnings breakdowns, and step-by-step tutorials.',
};

export const revalidate = 3600;

/** Category tint, so a reader can tell sections apart while scanning. */
const TINT: Record<string, string> = {
  start: 'var(--accent)',
  platform: '#3d6f8e',
  earnings: '#4f9a68',
  resources: '#9a6b3d',
};

export default function LearnPage() {
  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');

  return (
    <>
      <Nav discord={discord} />
      <main>
        <div className="wrap" style={{ paddingTop: 76, paddingBottom: 44 }}>
          <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span className="eyebrow">Learn &amp; Earn</span>
            <h1 style={{ fontSize: 'clamp(34px, 5.5vw, 50px)', lineHeight: 1.05, fontWeight: 700 }}>
              Everything you need to start making money as a clipper.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--ink-soft)', margin: 0 }}>
              Platform guides, honest earnings breakdowns, and step-by-step tutorials. {GUIDES.length} guides, all
              written by us — including the parts the networks would rather not spell out.
            </p>
          </div>
        </div>

        {CATEGORIES.map((cat, ci) => {
          const guides = guidesIn(cat.id);
          if (guides.length === 0) return null;
          const shaded = ci % 2 === 1;
          return (
            <div
              key={cat.id}
              className="section"
              style={
                shaded
                  ? {
                      background: 'var(--cream-card)',
                      borderTop: '1px solid var(--cream-line)',
                      borderBottom: '1px solid var(--cream-line)',
                    }
                  : undefined
              }
            >
              <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 20,
                    flexWrap: 'wrap',
                  }}
                >
                  <h2 style={{ fontSize: 25, fontWeight: 700 }}>{cat.title}</h2>
                  <span style={{ fontSize: 13.5, color: 'var(--ink-faint)' }}>{cat.note}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(292px, 1fr))', gap: 18 }}>
                  {guides.map((g) => (
                    <a
                      key={g.slug}
                      href={`/learn/${g.slug}`}
                      className="card"
                      style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                    >
                      <div
                        style={{
                          height: 108,
                          background: TINT[g.category],
                          display: 'flex',
                          alignItems: 'flex-end',
                          padding: 16,
                        }}
                      >
                        <span
                          className="display"
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: '0.09em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.9)',
                          }}
                        >
                          {cat.title}
                        </span>
                      </div>
                      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                        <span style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>{g.minutes} minute read</span>
                        <span className="display" style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.25 }}>
                          {g.title}
                        </span>
                        <span style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{g.dek}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        <div
          className="wrap section"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18 }}
        >
          <h2 style={{ fontSize: 30, fontWeight: 700, maxWidth: 520 }}>
            Reading is the easy part. Go pick a campaign.
          </h2>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a className="btn btn-primary" href="/" style={{ padding: '15px 26px', fontSize: 16 }}>
              Browse the board
            </a>
            <a className="btn btn-ghost" href="/clip" style={{ padding: '15px 24px', fontSize: 16 }}>
              How getting paid works
            </a>
          </div>
        </div>
      </main>
      <Footer discord={discord} />
    </>
  );
}
