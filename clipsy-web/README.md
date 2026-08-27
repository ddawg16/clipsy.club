# clipsy-web

The clipsy.club frontend. Next.js App Router, deploys to Vercel.

Reads campaigns and Wire events straight from Supabase in server components
using the **anon key**, which is safe to ship because Row Level Security decides
what it can see (`clipsy-engine/sql/002_security.sql`). The service-role key
must never appear in this app.

## Run it

```bash
npm install
cp .env.local.example .env.local     # fill in Supabase URL + ANON key
npm run dev                          # http://localhost:3000
```

The page renders correctly with an empty database — every section has an honest
empty state rather than placeholder campaigns. That is deliberate: you can put
this on a staging URL before the first ingest run and it will not look broken or
lie about having data.

## Security notes

- **Never use `dangerouslySetInnerHTML`.** React escapes text by default; that
  is what protects you from a hostile campaign name. The escape hatches are the
  only way to lose it.
- **Every href from the database goes through `safeHref()`** (`lib/safe.ts`).
  The ingest pipeline already blocks `javascript:` URLs; this is the second
  lock, and it must stay on any new link you add.
- External links carry `rel="noopener noreferrer nofollow"`.
- A Content-Security-Policy, HSTS and frame-denial are set in `next.config.mjs`.
- `NEXT_PUBLIC_*` variables are shipped to browsers. Only the anon key and the
  Discord invite belong there.

## The stats panel

The three headline figures are labelled as **totals across the networks we
index**, with a line underneath saying they are not Clipsy's own payouts. Do not
reword that to imply Clipsy paid out $60M — see the handover note. Replace them
with real Clipsy numbers once there are any.

## Deploy

Vercel → import the repo → set `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_DISCORD_INVITE`. Deploy to a
preview URL first and click through it before pointing the domain.
