# Security

Written for a small team shipping fast. The goal is not a perfect system — it is
that a bored person running an automated scanner against clipsy.club finds
nothing worth their time.

## What was wrong in the first cut, and is now fixed

Being blunt about it, because these are the exact holes that get small sites
owned and every one of them was in the code I handed over first:

| Hole | Why it mattered | Fix |
|---|---|---|
| `POST /api/outcomes` had no auth | Anyone could inject fake clip results and rewrite which campaigns your site calls "easy money" — your entire moat, editable by strangers | Bearer token, constant-time compare, fails closed |
| `POST /api/wire/manual` had no auth | Anyone could publish anything to your homepage feed | Same |
| No RLS policies | Supabase exposes every table over a public URL. Your anon key ships in frontend JS. Without RLS that means the world can read `clip_outcomes` — every clipper's earnings — and write to any table | `sql/002_security.sql`, default-deny + narrow column grants |
| No `.gitignore` | First `git push` would publish `.env` with your service-role key. That key bypasses RLS entirely | Added, `.env` ignored |
| Raw DB errors returned to the client | Postgres error text leaks table names, columns, constraints. Free recon | Logged server-side, opaque `internal_error` to client |
| No rate limiting | Cheap scraping of your board, cheap brute-forcing of tokens | 120 reads/min, 30 writes/min, 10 submissions/hr per IP |
| No CORS policy | Any site could call your API from a visitor's browser | Exact-origin allow-list, no wildcard |
| No input validation | Junk and oversized payloads straight into the DB | uuid/length/range checks on every field |

## The two keys, and the rule that matters most

**`SUPABASE_SERVICE_KEY` bypasses Row Level Security completely.** It is a
skeleton key to your entire database.

- It goes in server environment variables only. Vercel/Railway project settings.
- It NEVER appears in frontend code, a `NEXT_PUBLIC_*` variable, a client
  bundle, a git commit, a screenshot, or a Discord message.
- If it ever leaks, rotate it in the Supabase dashboard immediately. Assume
  anything it could reach has been read.

**`SUPABASE_ANON_KEY`** is public by design — it ships in your frontend. That is
fine *only* because RLS is on. Which is why `002_security.sql` is not optional.

## Table exposure, decided deliberately

| Table | Public read | Reasoning |
|---|---|---|
| `campaigns` | Active rows, selected columns | It is the product |
| `wire_events` | Published rows only | It is the product |
| `sources` | Name/homepage only | `last_error` can carry internal URLs |
| `campaign_submissions` | Insert only, no read | Contains submitter contact details |
| `campaign_snapshots` | Never | Reveals your scrape cadence and raw payloads |
| `clip_outcomes` | **Never** | Your clippers' income and approval history. The most sensitive table you own, and the one a competitor would most like to have |

## Before you go live

- [ ] Run `sql/002_security.sql`, then verify: open the Supabase table editor,
      switch the role selector to `anon`, and confirm you cannot see
      `clip_outcomes`. Do not skip this check.
- [ ] `API_WRITE_TOKEN` set to 32 random bytes (`openssl rand -hex 32`)
- [ ] `ALLOWED_ORIGINS` set to your real domains, no wildcard
- [ ] `CRON_SECRET` set, so nobody can trigger your ingest job
- [ ] `.env` confirmed absent from git: `git ls-files | grep env` returns only `.env.example`
- [ ] Supabase 2FA on, and on your domain registrar and Vercel accounts
- [ ] Dependabot or `npm audit` on a schedule

## The part most people get wrong later

The moment you collect a clipper's email, PayPal handle, or crypto address, you
are holding personal and financial data and the bar rises: encrypt it at rest,
never log it, never put it in an error message, and give people a way to delete
it. Don't build payouts into this codebase casually — that is the point to slow
down and get help.

Related: if this ever holds data on people in the EU or UK, GDPR applies
regardless of where you or the company sit, and California has its own rules.
Worth thirty minutes with a lawyer before you launch a signup form, not after.
