#!/usr/bin/env bash
# One-command deploy to a NEW Vercel project. Does NOT touch clipsy.club —
# the domain switch stays manual, because that is the only irreversible step.
set -e
cd "$(dirname "$0")/clipsy-web"

echo "══ 1/4  Logging in to Vercel"
echo "   A browser window will open. Approve it, then come back here."
npx vercel login

echo
echo "══ 2/4  Creating a new project and deploying a preview"
echo "   New project named 'clipsy-web'. Your existing site is untouched."
npx vercel --yes

echo
echo "══ 3/4  Pushing environment variables"
while IFS= read -r line; do
  key=${line%%=*}; val=${line#*=}
  case "$key" in
    NEXT_PUBLIC_*)
      for target in production preview development; do
        printf '%s' "$val" | npx vercel env add "$key" "$target" --force >/dev/null 2>&1 || true
      done
      echo "   set $key"
      ;;
  esac
done < .env.local

echo
echo "══ 4/4  Redeploying with the environment in place"
npx vercel --prod --yes

echo
echo "═══════════════════════════════════════════════════════"
echo "Deployed. The URL printed above is your live preview."
echo
echo "clipsy.club still points at your OLD site. Nothing broke."
echo
echo "Once you have clicked through the preview and it looks right:"
echo "  Vercel dashboard -> clipsy-web -> Settings -> Domains"
echo "  -> add clipsy.club -> accept the transfer prompt"
echo
echo "Rollback: move the domain back to the old project. Under a minute."
echo "═══════════════════════════════════════════════════════"
