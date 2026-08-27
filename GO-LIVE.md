# Go live — every step, in order

Nothing here needs Railway or any paid service.

---

## 1 · Database (2 min)

```
pbcopy < ~/"Apex Media Clipping Personal"/clipsy-engine/sql/004_richer_campaigns.sql
```
Paste into the Supabase SQL editor → **Run**. Expect "Success. No rows returned."

## 2 · Pull fresh data (1 min)

```
cd ~/"Apex Media Clipping Personal"/clipsy-engine && npm run ingest
```
Campaign artwork, per-platform rates and pool bars only appear after this.

## 3 · Pick your 3 easiest campaigns (5 min)

Supabase → **Table Editor** → `campaigns`. For three rows:

| column | what to put |
|---|---|
| `team_pick` | tick it |
| `team_note` | one line, e.g. "No view minimum and pays in 7 days" |
| `team_rank` | 1, 2, 3 |

Saves instantly. Ingest never overwrites these. The section is hidden until at
least one exists.

## 4 · Check everything (3 min)

```
cd ~/"Apex Media Clipping Personal"/clipsy-engine && ./scripts/preflight.sh
```
Want `ALL CHECKS PASSED`. This is the only run of the production build.

## 5 · Put the code on GitHub (5 min)

This gives you three things at once: a backup, auto-deploy, and the **free**
scheduler that replaces Railway.

```
cd ~/"Apex Media Clipping Personal"
git init
git add .
git status          # ← LOOK AT THIS. No .env, no .env.local. Stop if you see either.
git commit -m "Clipsy site + ingest engine"
```

Create an **empty private repo** at github.com/new called `clipsy` — no README,
no .gitignore. Then:

```
git remote add origin https://github.com/YOUR-USERNAME/clipsy.git
git branch -M main
git push -u origin main
```

## 6 · Turn on the free scheduler (3 min)

GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**.
Add two (values from `clipsy-engine/.env`):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

Then **Actions** tab → "Ingest campaigns" → **Run workflow** to test it now.
After that it runs itself every 15 minutes, free, whether your laptop is on or not.

## 7 · Deploy (5 min)

Vercel → **Add New → Project** → import the `clipsy` repo.

- **Root Directory**: `clipsy-web`  ← easy to miss, and it fails without it
- **Environment Variables** — add all three from `clipsy-web/.env.local`:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_DISCORD_INVITE`

Deploy. You get a `*.vercel.app` URL. **Your live site is untouched.**

## 8 · Click through the preview (5 min)

`/` · `/campaigns` · one campaign page · `/wire` · `/contact` · `/brands` · `/learn`.
Check it on your phone. Try the contact form — it should open your mail app
with the fields filled in.

## 9 · Switch the domain (2 min)

Vercel → new project → **Settings → Domains** → add `clipsy.club`. It will
offer to transfer it from your old project. Accept.

**Rollback:** don't delete the old project. Move the domain back and you're
live again in under a minute.

## 10 · After launch

- Pin the `#getting-started` post in Discord — `/learn` and `/contact` promise
  someone answers there
- Stop the autopilot loop on your laptop (Ctrl+C) — GitHub does it now
- Add a social preview image so shared links look right in Discord and X
