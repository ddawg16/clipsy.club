# ADR-001: clipsy.club and Clip Campaign Manager boundary

Status: accepted locally; production rollout pending owner approval

## Context

clipsy.club is a public campaign-discovery and education site. The Clip Campaign Manager owns authenticated identities, submissions, account verification, analytics, balances, payout methods, tax attestations, review operations, and API keys. Combining both codebases or exposing a manager API key to the browser would expand the blast radius and create two competing sources of truth.

## Decision

1. Keep the public board on its existing read-only Supabase path protected by Row Level Security.
2. Route people to the authenticated manager through `/dashboard`, which redirects to `NEXT_PUBLIC_CLIPSY_DASHBOARD_URL`.
3. Perform privileged integrations only from server route handlers or server actions through `lib/clipsy-api.ts`.
4. Store `CLIPSY_API_KEY` only as a server secret. Mint the smallest required scopes and use an idempotency key for every retried write.
5. Keep campaign-manager payout writes session/admin-only. A `payouts:read` key may read eligibility and batches but cannot approve, send, export, confirm, or reconcile.
6. Use the manager as the source of truth for users, submissions, earnings, and deletion. The public site must not create a second user or payout model.

## Flow

```text
Visitor browser
  ├─ clipsy.club public pages ── read-only ──> Supabase/RLS
  ├─ /dashboard ─────────────────────────────> Campaign Manager + Discord session
  └─ public forms (future) ──> clipsy.club server ── scoped API key ──> /api/v1
```

## Consequences

- A compromise of public browser code cannot reveal the campaign-manager API key.
- Public discovery can ship independently of operations and payouts.
- Cross-system writes need explicit reconciliation, monitoring, idempotency, and ownership.
- Authentication remains on the manager origin until there is a deliberate shared-session design.

## Follow-up decision triggers

Revisit this ADR only if the public board moves into the manager database, clipsy.club gains authenticated inline submissions, or the two apps move behind one gateway and session domain.
