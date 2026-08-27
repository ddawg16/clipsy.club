import { config } from './config.ts';
import { ingestAll } from './pipeline/ingest.ts';
import { scoreAll } from './pipeline/score.ts';
import { findCampaignArrays } from './sources/normalize.ts';
import { db, unwrap } from './db.ts';

const [, , command, ...args] = process.argv;

switch (command) {
  case 'ingest':
    await runIngest();
    break;
  case 'score':
    console.table(await scoreAll());
    break;
  case 'wire':
    await showWire();
    break;
  case 'discover':
    await discover(args[0]);
    break;
  default:
    console.log(`clipsy-engine

  npm run ingest      fetch every enabled source, snapshot, diff, write Wire events
  npm run score       recompute Heat + Effort for active campaigns
  npm run wire        print the latest Wire events
  npm run discover -- <url>   find the JSON endpoint a campaigns page hydrates from
  npm run serve       start the read API on :${config.port}
`);
}

async function runIngest(): Promise<void> {
  const reports = await ingestAll();
  console.table(reports);
  const failed = reports.filter((r) => r.error);
  if (failed.length > 0) {
    console.error(`\n${failed.length} source(s) failed:`);
    for (const f of failed) console.error(`  ${f.source}: ${f.error}`);
    process.exitCode = 1;
  }
  await scoreAll();

  // Record the run so the site can state real freshness instead of claiming a
  // schedule it might not be keeping.
  const okCount = reports.filter((r) => !r.error).length;
  const fetched = reports.reduce((n, r) => n + r.fetched, 0);
  await db().from('ingest_runs').insert({ ok: failed.length === 0, sources: okCount, campaigns: fetched });
}

async function showWire(): Promise<void> {
  const rows = unwrap(
    await db().from('wire_events').select('created_at, type, headline').order('created_at', { ascending: false }).limit(25),
    'wire',
  );
  console.table(rows);
}

/**
 * Point this at a campaigns page and it reports every JSON response that looks
 * like a campaign list. This is how you find the endpoint to put in
 * CLIPPINGNET_FEED_URL / WHOP_ENDPOINT instead of scraping the DOM.
 */
async function discover(url: string | undefined): Promise<void> {
  if (!url) {
    console.error('usage: npm run discover -- https://example.com/campaigns');
    process.exitCode = 1;
    return;
  }

  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ userAgent: config.userAgent });

  const hits: Array<{ url: string; rows: number; sample: string }> = [];

  page.on('response', async (response) => {
    const type = response.headers()['content-type'] ?? '';
    if (!type.includes('json')) return;
    try {
      const json: unknown = await response.json();
      const arrays = findCampaignArrays(json);
      if (arrays.length > 0 && arrays[0].length > 0) {
        hits.push({
          url: response.url(),
          rows: arrays[0].length,
          sample: JSON.stringify(arrays[0][0]).slice(0, 400),
        });
      }
    } catch {
      /* ignore */
    }
  });

  console.log(`opening ${url} ...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(3000);
  await browser.close();

  if (hits.length === 0) {
    console.log('\nNo campaign-shaped JSON found. The page is probably server-rendered —');
    console.log('use the Playwright DOM fallback in src/sources/clippingnet.ts instead.');
    return;
  }

  console.log(`\nFound ${hits.length} candidate endpoint(s):\n`);
  for (const h of hits) {
    console.log(`  ${h.url}`);
    console.log(`    rows: ${h.rows}`);
    console.log(`    sample: ${h.sample}\n`);
  }
  console.log('Put the best one in CLIPPINGNET_FEED_URL (or WHOP_ENDPOINT) in your .env.');
}
