#!/usr/bin/env bash
# Everything that must pass before clipsy.club points at this build.
cd "$(dirname "$0")/.." || exit 1
fail=0
line(){ printf '\n──── %s ────\n' "$1"; }

line "1. engine unit tests"
npm test >/dev/null 2>&1 && echo "PASS" || { echo "FAIL — run: npm test"; fail=1; }

line "2. dependency audit (engine)"
npm audit --omit=dev 2>&1 | tail -2

line "3. dependency audit (web)"
(cd ../clipsy-web && npm audit 2>&1 | tail -2)

line "4. production build"
(cd ../clipsy-web && npm run build >/tmp/build.log 2>&1) && echo "PASS" || { echo "FAIL — see /tmp/build.log"; tail -15 /tmp/build.log; fail=1; }

line "5. row level security (public key, from outside)"
KEY=$(grep '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' ../clipsy-web/.env.local | cut -d= -f2-)
URL=$(grep '^SUPABASE_URL=' .env | cut -d= -f2-)
SUPABASE_URL="$URL" SUPABASE_PUBLISHABLE_KEY="$KEY" ./scripts/verify-rls.sh || fail=1

line "6. demo data removed"
node --experimental-strip-types -e "
  const { db } = await import('./src/db.ts');
  const r = await db().from('campaigns').select('external_id').like('external_id','demo-%');
  const n = (r.data??[]).length;
  console.log(n === 0 ? 'PASS — no demo rows' : 'FAIL — ' + n + ' demo rows still live, run: npm run unseed');
  process.exit(n === 0 ? 0 : 1);
" || fail=1

line "RESULT"
[ $fail -eq 0 ] && echo "ALL CHECKS PASSED — safe to deploy" || echo "SOMETHING FAILED — do not deploy"
exit $fail
