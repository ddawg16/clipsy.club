import { isUuid, str, int } from '../src/api/guard.ts';
let fail = 0;
const ok = (c: boolean, m: string) => { if (!c) { console.log('FAIL ' + m); fail++; } else console.log('ok   ' + m); };

ok(isUuid('9f8b7c6d-1e2f-4a3b-8c9d-0e1f2a3b4c5d'), 'accepts a real uuid');
ok(!isUuid("1' OR '1'='1"), 'rejects an injection string');
ok(!isUuid(''), 'rejects empty');
ok(!isUuid(123 as unknown), 'rejects non-string');
ok(str('  hi  ', 10) === 'hi', 'trims');
ok(str('x'.repeat(600), 500) === null, 'rejects over-long string');
ok(str('', 10) === null, 'rejects empty string');
ok(int('42', 0, 100) === 42, 'coerces numeric string');
ok(int(-5, 0, 100) === null, 'rejects below min');
ok(int(1e12, 0, 100) === null, 'rejects above max');
ok(int('abc', 0, 100) === null, 'rejects non-numeric');

console.log(fail === 0 ? '\nALL PASS' : `\n${fail} FAILED`);
process.exit(fail ? 1 : 0);
