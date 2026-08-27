/**
 * Render-side URL guard. Defence in depth.
 *
 * The ingest pipeline already rejects non-http(s) URLs before they reach the
 * database (see clipsy-engine/src/safety.ts). This is the second lock: any row
 * written before that fix landed, or by a future code path that skips it,
 * still cannot put `javascript:` into an href on our own domain.
 *
 * Use it on EVERY href whose value came out of the database.
 */
export function safeHref(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    if (parsed.username || parsed.password) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/** Internal/known-safe links (Discord invite from env, anchors). */
export function safeExternal(value: string | undefined, fallback = '#'): string {
  return safeHref(value) ?? fallback;
}
