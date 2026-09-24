# clipsy.club integration deployment checklist

No production change is authorized by this document. Run it in staging first, then obtain explicit owner approval for production.

## Before staging

- [ ] Record the exact website and manager commit SHAs.
- [ ] Confirm `npm run build` passes in both projects and the manager test suite is green.
- [ ] Verify the read-only public campaign feed contains only active campaign name, rate, platforms, and end date. No API key is needed for this feed.
- [ ] Set `NEXT_PUBLIC_CLIPSY_DASHBOARD_URL`; optionally override `CLIPSY_API_BASE_URL` for a different backend origin.
- [ ] Set manager values: exact `CLIPSY_WEB_ORIGINS`, `PUBLIC_BASE_URL`, Discord OAuth redirect, and Meta callback credentials if enabled.
- [ ] Keep all payment execution flags off: `PAYPAL_PAYOUTS_ENABLED=false`, `WISE_PAYOUTS_ENABLED=false`, `CRYPTO_MODE_B_ENABLED=false`, `PAYOUTS_LIVE=false`.
- [ ] Back up the database and prove restore into a disposable database.

## Staging verification

- [ ] Browse the campaign board, Wire, all guide pages, Privacy, Terms, and Data Deletion on desktop and mobile.
- [ ] Confirm `/dashboard` lands on the correct manager origin and Discord login returns to the dashboard.
- [ ] As a clipper, load My Accounts, My Clips & Earnings, Payout Method, and My Analytics.
- [ ] Create a disposable user, link a test social account, then delete the account. Confirm the session ends and retained rows are pseudonymous.
- [ ] Send a correctly signed Meta deletion fixture and verify its confirmation status URL; verify an invalid signature is rejected.
- [ ] Use a `payouts:read` key to GET batches; confirm the same key cannot draft or send a batch.
- [ ] Confirm website response headers, HTTPS redirects, CSP, cookies, and CORS behavior.
- [ ] Confirm logs and alerts do not contain API keys, provider tokens, payout destinations, tax identity, or signed callback bodies.

## Production approval gate

- [ ] Name the release owner, deployment window, rollback owner, and incident channel.
- [ ] Verify DNS/TLS for `clipsy.club` and `api.clipsy.club` before changing redirects or provider callbacks.
- [ ] Configure provider dashboards with the deployed privacy, terms, deletion, and callback URLs.
- [ ] Rotate any key exposed during setup and save recovery material in the approved secret manager.
- [ ] Obtain explicit approval before migrations, DNS changes, provider review submissions, or enabling any live payout flag.

## Rollback

- [ ] Roll the website back to its previous deployment; `/dashboard` can be disabled by removing its configured URL.
- [ ] Roll the manager back to the previous verified SHA if the new routes fail. Do not reverse completed account deletions.
- [ ] Revoke the website API key if misuse or leakage is suspected.
- [ ] Leave payout flags off during rollback and reconciliation.
- [ ] Restore the database only for database corruption, never to undo a valid privacy deletion without legal review.

## First 24 hours

- [ ] Watch manager 4xx/5xx rates, login failures, deletion requests, API-key denials, webhook failures, and database saturation.
- [ ] Sample the complete clipper journey: discover → dashboard login → submit → review → earnings.
- [ ] Record every manual intervention and turn repeated ones into a runbook or alert.
