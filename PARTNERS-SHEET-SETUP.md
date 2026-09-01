# Add & manage partner campaigns from a Google Sheet (no code, ever)

How you add campaigns from OTHER people — clipping sites, Whop sellers, and Discord-only
servers — once they say yes. You keep ONE Google Sheet. Add a row → the campaign shows on
clipsy.club within the hour. Delete the row → it's gone. Works for anyone, including
Discord servers with no website (paste their Discord invite as the link).

## One-time setup (~5 minutes)

### 1. Make the sheet
Create a Google Sheet with these **exact** column headers in row 1 (order doesn't
matter, blank cells fine):

`name` · `url` · `partner` · `rate_per_100k` · `platforms` · `min_views` · `category` · `icon_url` · `status`

- **name** — campaign name on the card *(required)*
- **url** — where the clipper is sent: their site, Whop, or a Discord invite *(required)*
- **partner** — who runs it; the badge on the card (e.g. `ClipMarket`)
- **rate_per_100k** — a number, dollars per 100,000 views (e.g. `250`)
- **platforms** — comma list: `tiktok, instagram, youtube, x`
- **min_views** — a number (e.g. `2000`)
- **category** — free text (e.g. `gambling`)
- **icon_url** — link to a logo image (optional)
- **status** — `active` to show, `closed` to hide

Example row:
`Rainbet x BrandRisk | https://discord.gg/xxxx | ClipMarket | 250 | tiktok, instagram | 2000 | gambling | | active`

### 2. Publish it as a link
Sheet → **File → Share → Publish to web** → choose the tab → format **Comma-separated
values (.csv)** → **Publish**. Copy the URL (ends in `output=csv`).

### 3. Give the link to the site (one time)
- Local: add to `clipsy-engine/.env`: `CLIPSY_PARTNERS_CSV_URL=<the csv url>`
- GitHub (so the hourly job uses it): repo **Settings → Secrets and variables → Actions
  → New repository secret**, name `CLIPSY_PARTNERS_CSV_URL`, value = the same URL.
- Run `clipsy-engine/sql/005_partners.sql` once in the Supabase SQL editor (adds the
  "Partner" source). Safe to re-run.

That's it. From now on you only touch the Google Sheet.

## Daily use
- **Add a campaign** → add a row. Live within the hour.
- **Discord-only partner** → put their Discord invite in `url`. Same as any other.
- **Take one down** → set `status` to `closed`, or delete the row.
- **Let a partner self-manage** → give them edit access to their own tab.
