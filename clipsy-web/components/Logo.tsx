export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Clipsy"
      style={{ flexShrink: 0 }}
    >
      <rect width="48" height="48" rx="12" fill="#F5CE4C" />
      <path d="M43 21v15a12 12 0 0 1-12 12H16L43 21z" fill="#EDBE33" />
      <circle cx="18" cy="15" r="8.5" fill="#7E8794" />
      <circle cx="32" cy="15" r="8.5" fill="#7E8794" />
      <g fill="#F5CE4C">
        <circle cx="18" cy="10.6" r="2.1" />
        <circle cx="21.8" cy="16.7" r="2.1" />
        <circle cx="14.2" cy="16.7" r="2.1" />
        <circle cx="32" cy="10.6" r="2.1" />
        <circle cx="35.8" cy="16.7" r="2.1" />
        <circle cx="28.2" cy="16.7" r="2.1" />
      </g>
      <circle cx="18" cy="15" r="1.4" fill="#2E353F" />
      <circle cx="32" cy="15" r="1.4" fill="#2E353F" />
      <rect x="8" y="19" width="28" height="17" rx="3" fill="#3B424D" />
      <path d="M36 25l7-4v14l-7-4z" fill="#2E353F" />
      <rect x="20" y="36" width="6" height="4" fill="#2E353F" />
      <rect x="15" y="39" width="16" height="3.5" rx="1.7" fill="#242A33" />
      <g fill="#2E353F">
        <rect x="11" y="23" width="10" height="2" rx="1" />
        <rect x="11" y="27" width="10" height="2" rx="1" />
      </g>
    </svg>
  );
}

export function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function DiscordIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export function ClockIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}

const PLATFORM_PATHS: Record<string, { d: string; label: string }> = {
  tiktok:    { label: 'TikTok',    d: 'M16.5 2c.3 2.1 1.6 3.7 3.5 4v2.6c-1.3 0-2.5-.4-3.5-1.1v6.6c0 3.4-2.7 6.1-6.1 6.1S4.3 17.5 4.3 14.1 7 8 10.4 8c.3 0 .6 0 .9.1v2.8a3.3 3.3 0 1 0 2.3 3.2V2h2.9z' },
  youtube:   { label: 'YouTube',   d: 'M21.6 7.2s-.2-1.4-.8-2c-.7-.8-1.6-.8-2-.9C16 4.1 12 4.1 12 4.1s-4 0-6.8.2c-.4.1-1.3.1-2 .9-.6.6-.8 2-.8 2S2.2 8.8 2.2 10.5v1.6c0 1.6.2 3.3.2 3.3s.2 1.4.8 2c.7.8 1.7.8 2.1.9 1.6.1 6.7.2 6.7.2s4 0 6.8-.2c.4-.1 1.3-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.3v-1.6c0-1.7-.2-3.3-.2-3.3zM9.9 14.2V8.6l5.2 2.8-5.2 2.8z' },
  instagram: { label: 'Instagram', d: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zM12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zm6.1-8.1a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0z' },
  x:         { label: 'X',         d: 'M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.1L4.7 21H1.5l7.5-8.6L1.2 3h6.6l4.5 5.6L17.5 3zm-1.1 16.1h1.8L7.7 4.8H5.8l10.6 14.3z' },
  twitter:   { label: 'X',         d: 'M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.1L4.7 21H1.5l7.5-8.6L1.2 3h6.6l4.5 5.6L17.5 3zm-1.1 16.1h1.8L7.7 4.8H5.8l10.6 14.3z' },
  reels:     { label: 'Reels',     d: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zM10 15.3l5-3.3-5-3.3v6.6z' },
  shorts:    { label: 'Shorts',    d: 'M21.6 7.2s-.2-1.4-.8-2c-.7-.8-1.6-.8-2-.9C16 4.1 12 4.1 12 4.1s-4 0-6.8.2c-.4.1-1.3.1-2 .9-.6.6-.8 2-.8 2S2.2 8.8 2.2 10.5v1.6c0 1.6.2 3.3.2 3.3s.2 1.4.8 2c.7.8 1.7.8 2.1.9 1.6.1 6.7.2 6.7.2s4 0 6.8-.2c.4-.1 1.3-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.3v-1.6c0-1.7-.2-3.3-.2-3.3zM9.9 14.2V8.6l5.2 2.8-5.2 2.8z' },
};

/** Platform glyph. Falls back to a text chip for anything we do not have a mark for. */
export function PlatformIcon({ name, size = 17 }: { name: string; size?: number }) {
  const key = name.toLowerCase().replace(/[^a-z]/g, '');
  const p = PLATFORM_PATHS[key];
  if (!p) {
    return (
      <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-faint)', textTransform: 'capitalize' }}>{name}</span>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" role="img" aria-label={p.label} style={{ color: 'var(--ink)', flexShrink: 0 }}>
      <title>{p.label}</title>
      <path d={p.d} />
    </svg>
  );
}
