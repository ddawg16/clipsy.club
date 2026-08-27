import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Footer, Nav } from '@/components/Sections';
import { CATEGORIES, GUIDES, guideBySlug, guidesIn } from '@/lib/guides';
import { safeExternal } from '@/lib/safe';

export const revalidate = 3600;

/** Every guide is statically rendered — there are a fixed handful and they never change per request. */
export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return { title: 'Guide not found — Clipsy' };
  return {
    title: `${guide.title} | Clipsy`,
    description: guide.dek,
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  const discord = safeExternal(process.env.NEXT_PUBLIC_DISCORD_INVITE, '#');
  const category = CATEGORIES.find((c) => c.id === guide.category);
  const related = guidesIn(guide.category).filter((g) => g.slug !== guide.slug).slice(0, 3);

  return (
    <>
      <Nav discord={discord} />
      <main>
        {/* masthead */}
        <div style={{ borderBottom: '1px solid var(--cream-line)', background: 'var(--cream-card)' }}>
          <div className="wrap" style={{ padding: '48px 32px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <a href="/learn" style={{ fontSize: 13.5, color: 'var(--ink-faint)' }}>
              &larr; Learn &amp; Earn
            </a>
            <span className="eyebrow">
              {category?.title} &middot; {guide.minutes} minute read
            </span>
            <h1 style={{ fontSize: 'clamp(30px, 4.6vw, 44px)', fontWeight: 700, lineHeight: 1.08, maxWidth: 760 }}>
              {guide.title}
            </h1>
            <p style={{ fontSize: 17.5, color: 'var(--ink-soft)', margin: 0, maxWidth: 640, lineHeight: 1.55 }}>
              {guide.dek}
            </p>
          </div>
        </div>

        {/* body */}
        <article className="wrap" style={{ paddingTop: 48, paddingBottom: 56 }}>
          <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 40 }}>
            {guide.sections.map((s) => (
              <section key={s.h} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{s.h}</h2>
                {s.body.map((p, i) => (
                  <p key={i} style={{ fontSize: 17, lineHeight: 1.68, color: 'var(--ink-soft)', margin: 0 }}>
                    {p}
                  </p>
                ))}
                {s.list && (
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '4px 0 0', paddingLeft: 0, listStyle: 'none' }}>
                    {s.list.map((item) => (
                      <li key={item} style={{ display: 'flex', gap: 12, fontSize: 16.5, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
                        <span aria-hidden="true" style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>
                          &mdash;
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <div className="card" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="eyebrow">Now go use it</span>
              <p style={{ fontSize: 16, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.55 }}>
                The board shows every campaign we can see, ranked by how hot they run and how likely you are to actually
                get paid — including how full each pool already is.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a className="btn btn-primary" href="/campaigns" style={{ padding: '13px 22px', fontSize: 15 }}>
                  Browse campaigns
                </a>
                <a className="btn btn-ghost" href={discord} target="_blank" rel="noopener noreferrer" style={{ padding: '13px 20px', fontSize: 15 }}>
                  Ask in the Discord
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* related */}
        {related.length > 0 && (
          <div
            className="section"
            style={{ background: 'var(--cream-card)', borderTop: '1px solid var(--cream-line)' }}
          >
            <div className="wrap" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>More in {category?.title}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(268px, 1fr))', gap: 16 }}>
                {related.map((g) => (
                  <a key={g.slug} href={`/learn/${g.slug}`} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>{g.minutes} minute read</span>
                    <span className="display" style={{ fontSize: 16.5, fontWeight: 700, lineHeight: 1.25 }}>
                      {g.title}
                    </span>
                    <span style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{g.dek}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer discord={discord} />
    </>
  );
}
