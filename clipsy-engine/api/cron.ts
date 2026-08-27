import { ingestAll } from '../src/pipeline/ingest.ts';
import { scoreAll } from '../src/pipeline/score.ts';

/**
 * Vercel Cron entry point. Add to vercel.json:
 *
 *   { "crons": [{ "path": "/api/cron", "schedule": "star/15 * * * *" }] }
 *   (use a real asterisk-slash-15 — written out here so the comment stays valid)
 *
 * Protect it with CRON_SECRET so nobody else can trigger your scrapers.
 */
export const config = { maxDuration: 300 };

export default async function handler(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('unauthorized', { status: 401 });
  }

  const started = Date.now();
  const reports = await ingestAll();
  const scored = await scoreAll();

  return Response.json({
    ok: reports.every((r) => !r.error),
    ms: Date.now() - started,
    reports,
    scored,
  });
}
