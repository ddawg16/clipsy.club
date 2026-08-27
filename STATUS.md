# Clipsy — build status

Last updated while you were away.

## Working right now

| Thing | State |
|---|---|
| Clipster campaigns | **79 live**, refreshing every cycle |
| clipping.net campaigns | **4 live** (their public showcase feed) |
| The Wire | **4 real events** generated automatically |
| Database + RLS | Applied, tables locked, public reads scoped |
| Frontend | TypeScript clean, filters + search added |
| /brands page | Live with your email, $10k min, 70/30 split |
| Engine tests | 58 assertions, all pass |
| Engine typecheck | Clean |
| Frontend typecheck | Clean |

## Not working / not done

| Thing | Why |
|---|---|
| Whop | Your `.env` has your Claude key in `WHOP_API_KEY`, and whop.com has a terms modal blocking the account |
| Vues | No public campaign feed — `/campaigns` is a marketing page, login required for real data |
| Production build | Needs network I do not have. Run `npm run build` yourself |
| Deploy | Deliberately not done — you said not until it is perfect |
| Heat/Effort accuracy | Running on public signals until the Discord reports real outcomes |
| Learn guides | Six cards, no pages behind them |

## Before you deploy — one command

```
cd ~/"Apex Media Clipping Personal"/clipsy-engine && ./scripts/preflight.sh
```

Runs tests, both dependency audits, the production build, the RLS attack test,
and confirms no demo rows are live. It prints ALL CHECKS PASSED or tells you
exactly what failed.

## Notes

- Both adapters read PUBLIC endpoints the sites publish themselves. No logins,
  no session cookies, no page scraping. clipping.net's feed is the one their own
  marketing homepage renders from.
- clipping.net publishes no per-campaign URL, so those 4 link to their homepage
  rather than deep-linking. Clipster deep-links properly.
- Stop the autopilot loop (Ctrl+C) when you are done — it hits Clipster every
  2 minutes, which is fine for a dev session and rude as a permanent habit.
  Production schedule is 15 minutes.
