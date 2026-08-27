#!/usr/bin/env bash
# Dev loop: re-run ingest every 2 minutes so code changes get tested without
# a human present. Ctrl+C to stop. NOT for production — the real schedule is
# every 15 minutes (see api/cron.ts).
cd "$(dirname "$0")/.." || exit 1
mkdir -p logs
i=0
while true; do
  i=$((i+1))
  {
    echo "═══════════ CYCLE $i · $(date '+%H:%M:%S') ═══════════"
    npm run ingest 2>&1
    echo "--- data quality ---"
    node --experimental-strip-types -e "
      const { db } = await import('./src/db.ts');
      const r = await db().from('campaigns').select('*').eq('status','active');
      if (r.error) { console.log('QUERY ERROR:', r.error.message); }
      const all = r.data ?? [];
      const by = {}; for (const c of all) by[c.source_id] = (by[c.source_id]??0)+1;
      console.log('total active:', all.length, JSON.stringify(by));
      const nums = all.map(c=>Number(c.rate_cpm)).filter(Number.isFinite);
      console.log('rate \$/100k  :', nums.length ? Math.min(...nums)+' - '+Math.max(...nums) : 'none');
      console.log('heat scored  :', all.every(c=>c.heat===0) ? 'NO - all zero' : 'yes');
      console.log('effort mix   :', JSON.stringify(all.reduce((a,c)=>(a[c.effort_label]=(a[c.effort_label]??0)+1,a),{})));
      console.log('null url     :', all.filter(c=>!c.url).length);
      console.log('no platforms :', all.filter(c=>!c.platforms||!c.platforms.length).length);
      const p=new Set(); for (const c of all) for (const x of (c.platforms||[])) p.add(x);
      console.log('platforms    :', [...p].join(', ') || '(none)');
      console.log('wire events  :', (await db().from('wire_events').select('id')).data?.length ?? 0);
      console.log('TOP 5 BY HEAT:');
      for (const c of all.sort((a,b)=>b.heat-a.heat).slice(0,5))
        console.log('  ' + String(c.heat).padStart(3) + ' | ' + String(c.effort_label).padEnd(6) + ' | \$' + String(c.rate_cpm).padStart(6) + ' | ' + String(c.name).slice(0,44));
    " 2>&1
    echo
  } > logs/latest.txt 2>&1
  cat logs/latest.txt >> logs/autopilot.log
  tail -c 200000 logs/autopilot.log > logs/.t && mv logs/.t logs/autopilot.log
  printf "cycle %d done %s\n" "$i" "$(date '+%H:%M:%S')"
  sleep 120
done
