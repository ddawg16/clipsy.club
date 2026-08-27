'use client';

import { useEffect, useRef, useState } from 'react';
import { Logo } from './Logo';

type Item = { href: string; title: string; blurb: string };
type Menu = { id: string; label: string; items: Item[] };

/**
 * Two menus rather than a flat row of seven links. Products is the commercial
 * side, Resources is everything a clipper reads before they commit a night.
 * Campaigns stays top-level and unnested on purpose — the live board is the one
 * thing here nobody else has, so it should never be a click deep.
 */
const MENUS: Menu[] = [
  {
    id: 'products',
    label: 'Products',
    items: [
      { href: '/clip', title: 'Clip', blurb: 'Get paid to clip, per view' },
      { href: '/brands', title: 'Brands', blurb: 'Run a managed campaign' },
      { href: '/enterprise', title: 'Enterprise', blurb: 'Agencies and labels, at scale' },
      { href: '/how-campaigns-work', title: 'Campaigns', blurb: 'How clipping campaigns work' },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    items: [
      { href: '/learn', title: 'Learn & Earn', blurb: '13 guides, beginner to full-time' },
      { href: '/wire', title: 'The Wire', blurb: 'Every rate change we catch' },
      { href: '/why-us', title: 'Why us', blurb: 'What we do differently' },
      { href: '/faq', title: 'FAQ', blurb: 'The questions we actually get' },
    ],
  },
];

export function SiteNav({ discord }: { discord: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    const onClick = (e: MouseEvent) => {
      if (bar.current && !bar.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(250,241,216,0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--cream-line)',
      }}
    >
      <div
        className="wrap"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 76, gap: 20, flexWrap: 'wrap' }}
      >
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Logo size={36} />
          <span className="display" style={{ fontSize: 21, fontWeight: 700 }}>
            Clipsy
          </span>
        </a>

        <nav
          ref={bar}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            fontSize: 14.5,
            fontWeight: 500,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {MENUS.map((menu) => {
            const on = open === menu.id;
            return (
              <div key={menu.id} style={{ position: 'relative' }}>
                <button
                  type="button"
                  aria-expanded={on}
                  aria-haspopup="true"
                  onClick={() => setOpen(on ? null : menu.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    font: 'inherit',
                    color: on ? 'var(--ink)' : 'inherit',
                    padding: '8px 0',
                    minHeight: 44,
                  }}
                >
                  {menu.label}
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 12 12"
                    aria-hidden="true"
                    style={{ transform: on ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
                  >
                    <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {on && (
                  <div
                    className="card"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 322,
                      maxWidth: 'calc(100vw - 32px)',
                      padding: 8,
                      boxShadow: '0 18px 40px rgba(28,24,18,0.16)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    {menu.items.map((it) => (
                      <a
                        key={it.href}
                        href={it.href}
                        onClick={() => setOpen(null)}
                        style={{ padding: '11px 13px', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 3 }}
                      >
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{it.title}</span>
                        <span style={{ fontSize: 13, color: 'var(--ink-faint)', fontWeight: 400 }}>{it.blurb}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <a href="/campaigns">Campaigns</a>
          <a href="/contact">Contact</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <a className="btn btn-ghost" href="/brands" style={{ padding: '11px 16px', fontSize: 14 }}>
            Start a campaign
          </a>
          <a
            className="btn btn-primary"
            href={discord}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '11px 18px', fontSize: 14 }}
          >
            Start clipping
          </a>
        </div>
      </div>
    </div>
  );
}
