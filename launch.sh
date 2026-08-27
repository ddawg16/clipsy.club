#!/usr/bin/env bash
# One command, guided. Stops and tells you what to do whenever it needs you.
set -u
cd "$(dirname "$0")"
ok(){ printf "\n\033[32m✓ %s\033[0m\n" "$1"; }
stop(){ printf "\n\033[33m▸ %s\033[0m\n" "$1"; }
die(){ printf "\n\033[31m✗ %s\033[0m\n" "$1"; exit 1; }

printf "\n═══ CLIPSY LAUNCH ═══\n"

# ---------- 1. did the migration run? ----------
stop "STEP 1 — Have you run sql/004_richer_campaigns.sql in Supabase yet?"
echo "   If not: press Ctrl+C, run this, paste into Supabase SQL editor, hit Run,"
echo "   then start this script again."
echo "     pbcopy < clipsy-engine/sql/004_richer_campaigns.sql"
read -r -p "   Already run it? [y/N] " a
[ "$a" = "y" ] || [ "$a" = "Y" ] || die "Run the migration first, then re-run ./launch.sh"

# ---------- 2. pull fresh data ----------
printf "\n▸ STEP 2 — pulling campaigns...\n"
( cd clipsy-engine && npm run ingest ) || die "Ingest failed. Paste the error to Claude."
ok "campaigns pulled"

# ---------- 3. full check ----------
printf "\n▸ STEP 3 — running every pre-launch check...\n"
( cd clipsy-engine && ./scripts/preflight.sh ) || die "Preflight failed. Paste the output to Claude."
ok "all checks passed"

# ---------- 4. git ----------
printf "\n▸ STEP 4 — preparing the code for GitHub...\n"
[ -d .git ] || git init -q
git add -A

if git status --porcelain | grep -qE '(^|/)\.env(\.local)?$'; then
  die "STOP. A .env file is staged. Do NOT continue — tell Claude."
fi
ok "no secret files staged — safe"

echo
echo "   These are the files that will go to GitHub:"
git status --short | head -25
echo "   ... $(git status --porcelain | wc -l | tr -d ' ') files total"

git commit -q -m "Clipsy site and ingest engine" 2>/dev/null && ok "committed" || echo "   (nothing new to commit)"

# ---------- 5. push ----------
if git remote get-url origin >/dev/null 2>&1; then
  printf "\n▸ STEP 5 — pushing to GitHub...\n"
  git branch -M main
  git push -u origin main && ok "pushed" || die "Push failed — see the error above."
else
  stop "STEP 5 — you need a GitHub repo. Do this now:"
  echo "   1. A browser tab should be open at github.com/new (name is prefilled)."
  echo "   2. Make sure PRIVATE is selected. Do NOT tick README or .gitignore."
  echo "   3. Click 'Create repository'."
  echo "   4. Copy the repo URL, then run:"
  echo
  echo "        git remote add origin PASTE_URL_HERE"
  echo "        ./launch.sh"
  echo
  echo "   (If it asks for a password, GitHub wants a token instead:"
  echo "    github.com/settings/tokens → Generate new token (classic) → tick 'repo')"
  exit 0
fi

printf "\n═══ TERMINAL WORK DONE ═══\n"
echo "Left to do, all in the browser:"
echo "  A. GitHub repo → Settings → Secrets and variables → Actions"
echo "     Add SUPABASE_URL and SUPABASE_SERVICE_KEY (values in clipsy-engine/.env)"
echo "     Then Actions tab → 'Ingest campaigns' → Run workflow"
echo "  B. vercel.com/new → import the repo → Root Directory = clipsy-web"
echo "     → add the 3 NEXT_PUBLIC_ vars from clipsy-web/.env.local → Deploy"
echo "  C. Click through the preview URL, then move the domain."
