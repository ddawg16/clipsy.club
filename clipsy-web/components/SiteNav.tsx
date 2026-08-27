'use client';

import { useEffect, useRef, useState } from 'react';
import { Logo } from './Logo';

/**
 * The Products menu is click-to-open rather than hover-to-open on purpose:
 * hover menus are unusable on touch screens, and a good share of clippers are
 * on a phone. Escape and outside-click both close it.
 */
const PRODUCTS: Array<{ href: string; title: string; blurb: string }> = [
  { href: '/clip', title: 'Clip', blurb: 'Get paid to clip, per view' },
  { href: '/brands', title: 'Brands', blurb: 'Run a managed campaign' },
  { href: '/enterprise', title: 'Enterprise', blurb: 'Agencies and labels, at scale' },
  { href: '/how-campaigns-work', title: 'Campaigns', blurb: 'How clipping campaigns work' },
];

export function SiteNav({ discord }: { discord: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
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
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 76, gap: 20 }}
      >
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Logo size={36} />
          <span className="display" style={{ fontSize: 21, fontWeight: 700 }}>
            Clipsy
          </span>
        </a>

        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            fontSize: 14.5,
            fontWeight: 500,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <div ref={box} style={{ position: 'relative' }}>
            <button
              type="button"
              aria-expanded={open}
              aria-haspopup="true"
              onClick={() => setOpen((v) => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                font: 'inherit',
                color: open ? 'var(--ink)' : 'inherit',
                padding: '8px 0',
                minHeight: 44,
              }}
            >
              Products
              <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
                <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {open && (
              <div
                className="card"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 320,
                  maxWidth: 'calc(100vw - 32px)',
                  padding: 8,
                  boxShadow: '0 18px 40px rgba(28,24,18,0.16)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {PRODUCTS.map((p) => (
                  <a
                    key={p.href}
                    href={p.href}
                    onClick={() => setOpen(false)}
                    style={{ padding: '11px 13px', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 3 }}
                  >
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{p.title}</span>
                    <span style={{ fontSize: 13, color: 'var(--ink-faint)', fontWeight: 400 }}>{p.blurb}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <a href="/campaigns">Campaigns</a>
          <a href="/wire">The Wire</a>
          <a href="/learn">Learn</a>
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
