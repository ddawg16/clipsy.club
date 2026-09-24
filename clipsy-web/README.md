# clipsy-web

The clipsy.club frontend. Next.js App Router, deploys to Vercel.

The public campaign board reads active campaigns from the Discord manager's limited read-only feed at `/api/v1/public/campaigns`. Draft, paused, ended, and out-of-window campaigns are omitted. The older Supabase campaign catalog is no longer shown; Supabase still supplies Wire events. New campaigns appear once activated in the manager, without a separate website entry. The manager is the source for campaign names, rates per 1,000 views, platforms, and availability. Detailed financial and review data stay in the authenticated manager dashboard.

The feed defaults to the current Render backend URL. Set `CLIPSY_API_BASE_URL` to move it to another HTTPS origin. `CLIPSY_API_KEY` is needed only for future authenticated server-to-server calls, never for the public board.

## Run it

```bash
npm install
cp .env.local.example .env.local     # optional Wire and Discord settings
npm run dev                          # http://localhost:3000
```

The board shows an honest empty state if no campaign is active or the backend is unavailable. It never falls back to the retired scraped catalog.

## Security notes

- **Never use `dangerouslySetInnerHTML`.** React escapes text by default; that
  is what protects you from a hostile campaign name. The escape hatches are the
  only way to lose it.
- **Every href from the database goes through `safeHref()`** (`lib/safe.ts`).
  The ingest pipeline already blocks `javascript:` URLs; this is the second
  lock, and it must stay on any new link you add.
- External links carry `rel="noopener noreferrer nofollow"`.
- A Content-Security-Policy, HSTS and frame-denial are set in `next.config.mjs`.
- `NEXT_PUBLIC_*` variables are shipped to browsers. Only the anon key, Discord
  invite, and public dashboard URL belong there.

## The stats panel

The three headline figures are labelled as **totals across the networks we
index**, with a line underneath saying they are not Clipsy's own payouts. Do not
reword that to imply Clipsy paid out $60M — see the handover note. Replace them
with real Clipsy numbers once there are any.

## Deploy

Vercel → import the repo → set the desired variables from `.env.local.example`.
Keep any future `CLIPSY_API_KEY` server-only. Deploy to a preview URL first and complete
`docs/DEPLOY_CHECKLIST.md` before pointing the domain.
