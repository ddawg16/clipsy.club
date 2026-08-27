#!/usr/bin/env bash
# Proves Row Level Security works, by attacking the API the way a stranger
# would: with the PUBLIC key, from outside. Never prints the key.
set -u

URL="${SUPABASE_URL:-}"
KEY="${SUPABASE_PUBLISHABLE_KEY:-}"
[ -z "$URL" ] && { echo "set SUPABASE_URL"; exit 1; }
[ -z "$KEY" ] && { echo "set SUPABASE_PUBLISHABLE_KEY"; exit 1; }

# A legacy anon key is a JWT and PostgREST wants it in Authorization too.
# A new sb_publishable_ key is NOT a JWT — sending it as a Bearer token makes
# PostgREST fail to parse it and return 401 before any policy is consulted.
# Bash ARRAY, not a string: a plain string word-splits and mangles the headers.
if [[ "$KEY" == eyJ* ]]; then
  HDRS=(-H "apikey: $KEY" -H "Authorization: Bearer $KEY")
  KEYKIND="legacy JWT anon key"
else
  HDRS=(-H "apikey: $KEY")
  KEYKIND="publishable key (apikey header only)"
fi

pass=0; fail=0

probe () { # name  table  public|private
  local name="$1" table="$2" expect="$3" out code body
  out=$(curl -s -w $'\n%{http_code}' --max-time 15 "${HDRS[@]}" \
        "$URL/rest/v1/$table?select=id&limit=1")
  code=$(printf '%s' "$out" | tail -1)
  body=$(printf '%s' "$out" | sed '$d')

  if [ "$expect" = private ]; then
    if [ "$code" = "200" ] && [ "$body" != "[]" ]; then
      echo "  LEAK   $name -> HTTP $code returned data"; fail=$((fail+1))
    else
      echo "  ok     $name -> blocked (HTTP $code)"; pass=$((pass+1))
    fi
  else
    if [ "$code" = "200" ]; then
      echo "  ok     $name -> readable (HTTP $code)"; pass=$((pass+1))
    else
      echo "  BROKEN $name -> HTTP $code ${body:0:90}"; fail=$((fail+1))
    fi
  fi
}

echo "Attacking $URL"
# NOTE: probes select=id, not select=*. Column-level grants mean `*` is
# refused even on public tables — that is the grant working, not a failure.
echo "Using: $KEYKIND"
echo
echo "MUST BE PRIVATE:"
probe "clip_outcomes        (clipper earnings)" clip_outcomes private
probe "campaign_snapshots   (scrape history)"   campaign_snapshots private
probe "campaign_submissions (submitter info)"   campaign_submissions private

echo
echo "MUST BE PUBLIC:"
probe "campaigns            (the board)"        campaigns public
probe "wire_events          (the feed)"         wire_events public
probe "sources              (badges)"           sources public

echo
echo "WRITE ATTEMPT (should be refused):"
wcode=$(curl -s -o /tmp/clipsy_w.txt -w '%{http_code}' --max-time 15 -X POST \
  "${HDRS[@]}" -H "Content-Type: application/json" \
  -d '{"source_id":"direct","external_id":"hacked","name":"INJECTED BY STRANGER"}' \
  "$URL/rest/v1/campaigns")
if [ "$wcode" = "201" ] || [ "$wcode" = "200" ]; then
  echo "  LEAK   anonymous write SUCCEEDED (HTTP $wcode)"; fail=$((fail+1))
else
  echo "  ok     anonymous write refused (HTTP $wcode)"; pass=$((pass+1))
fi
rm -f /tmp/clipsy_w.txt

echo
echo "-------------------------------------------"
if [ "$fail" -eq 0 ]; then echo "ALL $pass CHECKS PASSED — safe to deploy"; else echo "$fail FAILURE(S), $pass passed — DO NOT DEPLOY"; fi
exit "$fail"
