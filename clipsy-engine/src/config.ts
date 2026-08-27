import { existsSync, readFileSync } from 'node:fs';

/**
 * Load .env into process.env once, at import time.
 *
 * Every entry point (cli, server, cron) imports this module, so this is the
 * single place it needs to happen. On a hosting platform there is no .env file
 * and the environment is already populated — hence the existsSync guard.
 * Real environment variables always win over the file.
 */
(() => {
  if (!existsSync('.env')) return;
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    const value = m[2].trim().replace(/^["']|["']$/g, '');
    if (value && !process.env[m[1]]) process.env[m[1]] = value;
  }
})();

function env(key: string): string | undefined {
  const v = process.env[key];
  return v && v.trim() !== '' ? v.trim() : undefined;
}

export const config = {
  supabaseUrl: env('SUPABASE_URL') ?? '',
  supabaseKey: env('SUPABASE_SERVICE_KEY') ?? '',

  whop: {
    apiKey: env('WHOP_API_KEY'),
    /**
     * Set this to the endpoint that actually returns campaign/bounty listings
     * for your account. Run `npm run discover -- <whop campaigns url>` if you
     * are not sure which one it is.
     */
    endpoint: env('WHOP_ENDPOINT'),
  },

  clippingnet: {
    /**
     * The JSON endpoint the campaigns page hydrates from. Find it with
     * `npm run discover -- https://clipping.net/campaigns`.
     * Leave unset to fall back to the rendered-DOM scraper.
     */
    feedUrl: env('CLIPPINGNET_FEED_URL'),
    pageUrl: env('CLIPPINGNET_PAGE_URL') ?? 'https://clipping.net/campaigns',
    /** Cookie header if the listing needs a logged-in session. */
    cookie: env('CLIPPINGNET_COOKIE'),
  },

  /** Campaigns not seen in this many consecutive runs are marked pulled. */
  missingRunsBeforePulled: Number(env('MISSING_RUNS_BEFORE_PULLED') ?? 2),

  userAgent:
    env('USER_AGENT') ??
    'ClipsyBot/0.1 (+https://clipsy.club/bot; campaign indexer; contact@clipsy.club)',

  port: Number(env('PORT') ?? 8787),

  /** Bearer token for every write route. Unset = writes refuse everything. */
  apiWriteToken: env('API_WRITE_TOKEN'),

  /** Exact origins allowed to call the API from a browser. No wildcards. */
  allowedOrigins: (env('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};

export function assertDb(): void {
  if (!config.supabaseUrl || !config.supabaseKey) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_KEY must be set. Copy .env.example to .env and fill them in.',
    );
  }
}
