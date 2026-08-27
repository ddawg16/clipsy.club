import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { assertDb, config } from './config.ts';

let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!client) {
    assertDb();
    client = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}

/** Throw on a Supabase error so the cron run fails loudly instead of silently. */
export function unwrap<T>(res: { data: T | null; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data as T;
}
