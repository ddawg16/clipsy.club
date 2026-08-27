import type { NextFunction, Request, Response } from 'express';
import { createHash, timingSafeEqual } from 'node:crypto';
import { config } from '../config.ts';

/**
 * Constant-time compare so a token can't be guessed byte-by-byte from timing.
 *
 * Both sides are hashed first: timingSafeEqual throws on a length mismatch, so
 * comparing raw strings would leak the secret's LENGTH through the error path.
 * Hashing makes both sides a fixed 32 bytes, so nothing is observable.
 */
function safeEqual(a: string, b: string): boolean {
  const ah = createHash('sha256').update(a).digest();
  const bh = createHash('sha256').update(b).digest();
  return timingSafeEqual(ah, bh);
}

/**
 * Every write route sits behind this. Without it, anyone who finds the URL can
 * poison your Heat/Effort scores with fake outcomes or post whatever they like
 * to the Wire — which is exactly the kind of hole a scanner finds in a week.
 */
export function requireWriteToken(req: Request, res: Response, next: NextFunction): void {
  const expected = config.apiWriteToken;

  // Fail CLOSED. A missing token config locks writes rather than opening them.
  if (!expected) {
    res.status(503).json({ error: 'writes_disabled' });
    return;
  }

  const header = req.get('authorization') ?? '';
  const presented = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!presented || !safeEqual(presented, expected)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  next();
}

/** Small in-memory limiter. Swap for Upstash/Redis once you run more than one instance. */
export function rateLimit(opts: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();

    if (hits.size > 10_000) {
      for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
    }

    // Trust the platform's forwarded IP only; see `trust proxy` in server.ts.
    const key = req.ip ?? 'unknown';
    const entry = hits.get(key);

    if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + opts.windowMs });
      next();
      return;
    }

    entry.count += 1;
    if (entry.count > opts.max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      res.status(429).json({ error: 'rate_limited' });
      return;
    }
    next();
  };
}

/** Allow-list CORS. A wildcard here would let any site call your API as a user. */
export function cors(req: Request, res: Response, next: NextFunction): void {
  const origin = req.get('origin');
  if (origin && config.allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
}

export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Referrer-Policy', 'no-referrer');
  res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.removeHeader('X-Powered-By');
  next();
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === 'string' && UUID_RE.test(v);

export function str(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length === 0 || t.length > max ? null : t;
}

export function int(v: unknown, min: number, max: number): number | null {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return Math.round(n);
}

/**
 * Log the real error, return an opaque one. Postgres error text can carry table
 * names, column names and constraint definitions — free reconnaissance.
 */
export function fail(res: Response, err: unknown, where: string): void {
  console.error(`[${where}]`, err instanceof Error ? err.message : err);
  res.status(500).json({ error: 'internal_error' });
}
