'use client';

import { usePathname } from 'next/navigation';
import { Logo } from './Logo';

/**
 * Product shell for the pages a clipper uses repeatedly. Clicking the mark
 * goes to the marketing home, the same way an app logo drops you back to the
 * public site.
 *
 * Note what is NOT here: Clips, Payments, Teams, Accounts. We could show them
 * greyed out like the bigger networks do, but they have those features and we
 * do not — four dead menu items would just advertise everything we are missing.
 * They go in the day they exist.
 */
const LINKS: Array<{ href: string; label: string; icon: string }> = [
  { href: '/', label: 'Campaigns', icon: 'grid' },
  { href: '/wire', label: 'The Wire', icon: 'pulse' },
  { href: '/learn', label: 'Learn & Earn', icon: 'book' },
  { href: '/home', label: 'About Clipsy', icon: 'home' },
  { href: '/contact', label: 'Contact', icon: 'mail' },
];

const PATHS: Record<string, string> = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  pulse: 'M3 12h4l3-8 4 16 3-8h4',
  book: 'M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z M9 3v18',
  home: 'M4 11 12 4l8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z',
  mail: 'M3 6h18v12H3z M3 7l9 6 9-6',
};

function Icon({ name }: { name: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d={PATHS[name]} />
    </svg>
  );
}

export function AppShell({ discord, children }: { discord: string; children: React.ReactNode }) {
  const path = usePathname();

  return (
    <div className="shell">
      <aside className="shell-rail">
        <a href="/home" style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '2px 4px', flexShrink: 0 }}>
          <Logo size={30} />
          <span className="display" style={{ fontSize: 18.5, fontWeight: 700 }}>
            Clipsy
          </span>
        </a>

        <nav className="rail-group" style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rail-link" aria-current={path === l.href ? 'page' : undefined}>
              <Icon name={l.icon} />
              {l.label}
            </a>
          ))}
        </nav>

        <div className="rail-hide-sm" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a className="btn btn-primary" href="/brands" style={{ padding: '11px 14px', fontSize: 13.5, justifyContent: 'center' }}>
            Start a campaign
          </a>
          <a
            href={discord}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12.5, color: 'var(--ink-faint)', textAlign: 'center' }}
          >
            Join the Discord
          </a>
        </div>
      </aside>

      <div className="shell-main">{children}</div>
    </div>
  );
}
