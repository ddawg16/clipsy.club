# Clipsy

Open campaign-discovery board for the clipping community, live at **https://clipsy.club**.
Indexes clipping campaigns from across the networks into one place, ranked by how hot
they run and how likely a clipper is to actually get paid. We index — we never re-host.

## What's in here

| Folder | What it is |
|---|---|
| `clipsy-web/` | The website (Next.js). Deployed on Vercel → clipsy.club. |
| `clipsy-engine/` | The ingest engine (Node/TypeScript). Pulls campaigns from every source each hour and writes them to the database. |
| `.github/workflows/` | The hourly job that runs the engine (GitHub Actions). |

## How campaigns get on the board

1. **Automatic sources** — the engine reads public campaign feeds (Clipster, clipping.net) every hour.
2. **Partner campaigns** — you add them via a Google Sheet, no code. See **PARTNERS-SHEET-SETUP.md**.
3. **Your own campaigns** — add directly in Supabase. See **ADD-A-CAMPAIGN.md**.

## The everyday guides (read these, not the code)

- **PARTNERS-SHEET-SETUP.md** — add/remove partner campaigns (incl. Discord-only) from a spreadsheet.
- **ADD-A-CAMPAIGN.md** — add or feature a single campaign by hand in Supabase.
- **INGEST-AUTORUN.md** — how the board keeps itself refreshed.

## Where things live (not in this repo)

- **Database & campaign data:** Supabase
- **Hosting & domain:** Vercel (clipsy.club)
- **Secrets** (database service key, etc.): GitHub Actions secrets + local `.env` files — never committed.

Your private business notes (brand profiles, campaign docs, competition tracker,
research) stay on your computer and are intentionally kept out of this public repo.
