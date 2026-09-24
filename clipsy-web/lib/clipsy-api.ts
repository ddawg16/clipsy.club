/**
 * Server-only boundary for the authenticated Clip Campaign Manager API.
 * Import this module from route handlers or server actions only. The API key
 * deliberately has no NEXT_PUBLIC_ prefix and must never reach client code.
 */

import 'server-only';

const REQUEST_TIMEOUT_MS = 10_000;

function baseUrl() {
  const configured = process.env.CLIPSY_API_BASE_URL ?? 'https://clipsy-club-bot-backend-access.onrender.com';
  const url = new URL(configured);
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  if (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && local)) {
    throw new Error('CLIPSY_API_BASE_URL must use HTTPS.');
  }
  url.pathname = url.pathname.replace(/\/$/, '');
  return url;
}

export async function clipsyApi<T>(
  path: `/api/v1/${string}`,
  options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown; idempotencyKey?: string; authenticated?: boolean } = {}
): Promise<T> {
  const url = new URL(path, baseUrl());
  const headers = new Headers({ accept: 'application/json' });
  if (options.body !== undefined) headers.set('content-type', 'application/json');
  if (options.authenticated !== false) {
    const key = process.env.CLIPSY_API_KEY;
    if (!key) throw new Error('CLIPSY_API_KEY is not configured.');
    headers.set('authorization', `Bearer ${key}`);
  }
  if (options.idempotencyKey) headers.set('idempotency-key', options.idempotencyKey);

  const response = await fetch(url, {
    method: options.method ?? 'GET', headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Clip Campaign Manager request failed (${response.status}).`);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
