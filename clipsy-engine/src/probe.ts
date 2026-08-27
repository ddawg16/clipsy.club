/**
 * Probe an upstream endpoint and print its SHAPE, so we can map real field
 * names instead of guessing. Reads the key from .env — never prints it.
 *
 *   npm run probe
 */
import { readFileSync } from 'node:fs';

for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && m[2].trim() && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
}

const key = process.env.WHOP_API_KEY;
const url = process.env.WHOP_ENDPOINT || 'https://api.whop.com/api/v1/bounties?first=50';
if (!key) { console.error('WHOP_API_KEY missing from .env'); process.exit(1); }

console.log(`GET ${url}\n`);
const res = await fetch(url, {
  headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
  signal: AbortSignal.timeout(20_000),
});

console.log(`HTTP ${res.status} ${res.statusText}\n`);
const text = await res.text();
if (!res.ok) { console.log(text.slice(0, 800)); process.exit(1); }

const json = JSON.parse(text);
const rows = Array.isArray(json) ? json : (json.data ?? json.results ?? json.items ?? []);
console.log(`rows returned: ${Array.isArray(rows) ? rows.length : 'not an array'}\n`);

if (Array.isArray(rows) && rows.length > 0) {
  console.log('--- FIELDS ON ROW 1 ---');
  for (const [k, v] of Object.entries(rows[0])) {
    const t = v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v;
    const preview = typeof v === 'object' ? JSON.stringify(v)?.slice(0, 60) : String(v).slice(0, 60);
    console.log(`  ${k.padEnd(24)} ${t.padEnd(8)} ${preview}`);
  }
  console.log('\n--- ROW 1 RAW ---');
  console.log(JSON.stringify(rows[0], null, 2).slice(0, 1500));
} else {
  console.log('--- TOP-LEVEL SHAPE ---');
  console.log(JSON.stringify(json, null, 2).slice(0, 1200));
}
