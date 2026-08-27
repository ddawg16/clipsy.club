# clipsy-engine

The backend behind clipsy.club: pulls campaigns from every network, diffs them
every 15 minutes to auto-generate The Wire, and scores each one for Heat and
Effort so the Campaign Hub can rank "hottest" against "easiest to get paid".

## The idea in one paragraph

Every source gets an **adapter** that returns a normalized campaign list. Each
run upserts those campaigns, writes a **snapshot**, and compares the snapshot to
the previous one. Every meaningful field change — a rate move, a raised
qualifier, a campaign that vanished without notice — becomes a **Wire event**
automatically. Nobody writes the Wire by hand. Separately, a scoring pass turns
your own clippers' outcomes into Heat and Effort, which is the part no
competitor can copy, because that data only exists inside your Discord.

## Setup

```bash
npm install
npx playwright install chromium     # only needed for the scraper fallback + discover
cp .env.example .env                # fill in Supabase + any source credentials
```

Run `sql/001_schema.sql` **and then `sql/002_security.sql`** against your
Supabase project (SQL Editor → paste → run). The second file is not optional —
without it every table is world-readable. See `SECURITY.md`. Then:

```bash
npm run discover -- <a campaigns page>    # find the real JSON endpoint
npm run ingest                                        # fetch, diff, write Wire events
npm run wire                                          # see what it generated
npm run serve                                         # read API on :8787
```

## Adding a network

One file. Return `RawCampaign[]`, add it to `src/sources/index.ts`, done —
snapshots, diffing, Wire events and scoring all come free.

```ts
export const newNetwork: SourceAdapter = {
  id: 'newnetwork',
  label: 'via New Network',
  enabled: () => Boolean(process.env.NEWNETWORK_KEY),
  async fetchCampaigns() { /* ... */ },
};
```

Add a matching row to the `sources` table so the badge renders on the card.

## The four ingestion tiers, cheapest first

1. **Official API.** Whop has one. Always try this first — it is the only tier
   that does not break when someone redesigns a page.
2. **Undocumented JSON endpoint.** Most modern sites hydrate the campaigns page
   from JSON. `npm run discover -- <url>` finds it for you by watching network
   traffic. Far more stable than parsing HTML, and it is how essentially every
   aggregator actually works.
3. **Headless browser.** Playwright renders the page and we read the DOM. Slow,
   brittle, breaks on redesigns. Backstop only.
4. **Manual + community submissions.** Your own direct brand deals and campaigns
   clippers submit. This tier is small at first and becomes the most valuable
   one, because it is the only data nobody can scrape off you.

## clipping.net is parked

The adapter is written and tested but **not wired in** (`src/sources/index.ts`,
`parked`). Nothing hits their site. Decide the partner-feed question first; see
the note below.

## Two things to get right before you point this at production

**Check each site's Terms of Service.** You plan to earn clipping.net's
team-captain override on clippers you add to your teams — so an aggressive
scraper that gets your account banned costs you the monetization on day one.
The better opening move with them specifically is asking for a partner or
affiliate feed: you are sending them clippers, that is a real conversation.
Same for Whop; use the API they publish.

**Index metadata, never re-host.** Store the name, rate, deadline and a link.
Always deep-link out to the source. That is the line between an aggregator and
a mirror, legally and reputationally — and your footer already promises it
("we just index them"). Keep the product honest to that.

Be a polite client too: the default 15-minute interval and the descriptive
`USER_AGENT` with a contact address exist so you look like an indexer rather
than an attack. Don't lower the interval to chase freshness.

## The Wire: what fires an event

| Change on the source | Event | Severity |
|---|---|---|
| Campaign appears for the first time | `new_drop` | good |
| `rate_cpm` increased | `rate_up` | good |
| `rate_cpm` decreased | `rate_down` | warn |
| `min_views` raised / lowered | `min_views_up` / `min_views_down` | warn / good |
| Status flips to closed | `closed` | warn |
| Deadline pulled forward >1h | `closing` | warn |
| Row disappears, never marked closed | `pulled` | warn |
| Reported by a clipper (manual) | `payout_issue` | warn |

`pulled` is the one nobody else reports and the one clippers will trust you
for. Payout problems can't be scraped — pipe those in from a Discord channel
via `POST /api/wire/manual` with you approving before they publish.

Re-running the cron is safe: a unique index on
`(campaign, type, value, hour)` absorbs duplicates, so a retry never
double-posts.

## Heat and Effort

Both are 0–100 and both degrade gracefully — with no outcome data they fall
back to public signals, and sharpen every week your Discord reports back.

**Heat** (high = running hot, and therefore competitive): clips posted in the
last 48h (35%), views landed (25%), rate percentile (15%), freshness (15%),
urgency (10%). With no outcomes yet: rate percentile 45%, freshness 35%,
urgency 20%.

**Effort** (high = easy to actually get paid): approval rate (40%), payout speed
(30%), view minimum (30%). With fewer than five decided clips: payout speed 45%,
view minimum 55%. Labels: ≥70 Low, ≥45 Medium, else High.

Feed it by having your Discord bot POST to `/api/outcomes` whenever a clip is
approved, rejected, or paid. Within a couple of months you will be the only
site that can say "this one pays $45 but rejects 40% of clips" — which is the
thing brands eventually pay you for, and the reason the Hub matters more than
the board.

## API

| Route | Purpose |
|---|---|
| `GET /api/campaigns?sort=hot\|easy\|rate\|ending` | Campaign Hub table |
| `GET /api/wire?limit=40` | The Wire feed |
| `POST /api/outcomes` | Discord bot reports a clip result |
| `POST /api/wire/manual` | Post a payout problem to the Wire |

## Deploy

Vercel: `api/cron.ts` is the entry point. Add to `vercel.json`:

```json
{ "crons": [{ "path": "/api/cron", "schedule": "*/15 * * * *" }] }
```

Set `CRON_SECRET` so nobody else can trigger your scrapers. Note that Vercel's
serverless runtime cannot run Playwright — if you rely on the browser fallback
or `discover`, run those from a small always-on box (Railway, Fly, a VPS)
instead and keep Vercel for the API-and-JSON-feed sources.
