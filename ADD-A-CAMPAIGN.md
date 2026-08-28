# Adding & editing campaigns by hand (no code)

Your board fills automatically from Clipster + clipping.net. But you can also add
your OWN campaigns — ones you sold directly, or any you want on the board that the
APIs don't carry. You do it in Supabase, not in code. Nothing here needs a push,
a terminal, or Claude.

The engine is built to protect these: once you add a `direct` campaign, the hourly
ingest job re-reads it and keeps it alive — it will NOT get auto-removed the way a
scraped campaign does when it disappears from its source.

---

## Add a campaign

1. Go to **supabase.com** → your project → **Table Editor** (left side) → **campaigns** table.
2. Click **Insert** → **Insert row**.
3. Fill in these fields. Anything not listed, leave as its default.

| Field | What to put | Example |
|---|---|---|
| `source_id` | Always type `direct` for your own campaigns | `direct` |
| `external_id` | Any unique label, no spaces. Just make it up. | `my-first-campaign` |
| `name` | The campaign name shown on the card | `Rainbet Summer Clipping` |
| `url` | Where "Claim" sends the clipper | `https://discord.gg/yourinvite` |
| `min_views` | Views needed to qualify (a number) | `2000` |
| `status` | `active` to show it, `closed` to hide it | `active` |
| `platforms` | Which platforms, in the array box (see below) | `{tiktok,instagram}` |
| `platform_rates` | The per-platform pay, in the JSON box (see below) | see below |
| `budget_total` | Total pool size in dollars (optional) | `5000` |
| `budget_used_pct` | How much is claimed, 0–100 (optional) | `10` |
| `icon_url` | A link to a logo image (optional) | leave blank if none |

4. Click **Save**. It appears on the site within ~5 minutes.

### The two tricky boxes

**`platforms`** — this is a list. In Supabase it shows as an array editor.
Type the platform names lowercase, one per entry:
`tiktok`, `instagram`, `youtube`, `x`

**`platform_rates`** — this is what makes the dollar amount show on the card.
Paste this into the box and change the numbers. Rate is **dollars per 100,000 views**:

```json
[
  { "platform": "tiktok", "rate": 250 },
  { "platform": "instagram", "rate": 250 },
  { "platform": "youtube", "rate": 250 }
]
```

If every platform pays the same, the card automatically shows one "all platforms" rate.

---

## Edit a campaign (any campaign, not just yours)

Table Editor → **campaigns** → click the row → change any cell → **Save**.

Note: for Clipster/clipping.net campaigns, the hourly job will overwrite your edits
with fresh data from the source on its next run. Only `direct` campaigns keep your
edits permanently.

---

## Feature a campaign in "Top team picks"

Any campaign — yours or scraped — can be promoted. In its row, set:

| Field | Value |
|---|---|
| `team_pick` | `true` |
| `team_rank` | `1`, `2`, `3`… (1 shows first) |
| `team_note` | one sentence in your voice, e.g. `Low minimum, pays fast.` |

These three are never touched by the ingest job — a promotion you set by hand stays
until you change it. It shows up under the **Top team picks** sort tab.

---

## Hide a campaign

Set its `status` to `closed`. It drops off the board on the next refresh. Set it
back to `active` to bring it back. (Don't delete rows — closing is reversible,
deleting isn't.)
