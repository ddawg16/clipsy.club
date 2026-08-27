-- Richer campaign cards + team picks. Safe to re-run.

alter table campaigns add column if not exists icon_url        text;
alter table campaigns add column if not exists brief_url       text;   -- the real brief, on the source
alter table campaigns add column if not exists platform_rates  jsonb;  -- [{platform, rate}] in $/100k
alter table campaigns add column if not exists budget_total    numeric;
alter table campaigns add column if not exists budget_used_pct integer;
alter table campaigns add column if not exists payout_method   text;
alter table campaigns add column if not exists category        text;

-- ---------------------------------------------------------- team picks
-- Set these BY HAND in the Supabase table editor. Nothing automated touches
-- them, and ingest never overwrites them.
alter table campaigns add column if not exists team_pick   boolean not null default false;
alter table campaigns add column if not exists team_note   text;      -- one line, shown on the card
alter table campaigns add column if not exists team_rank   integer;   -- 1, 2, 3 — controls order

create index if not exists campaigns_team_pick_idx on campaigns (team_pick, team_rank) where team_pick;

-- Public can read the new columns too.
grant select (
  id, source_id, external_id, name, brand, url, rate_cpm, min_views,
  platforms, ends_at, status, first_seen_at, last_seen_at, heat, effort_score,
  effort_label, payout_days, icon_url, brief_url, platform_rates,
  budget_total, budget_used_pct, payout_method, category,
  team_pick, team_note, team_rank
) on campaigns to anon, authenticated;

-- A place to record when ingest last actually ran, so the site can state the
-- real freshness instead of claiming a schedule it might not be keeping.
create table if not exists ingest_runs (
  id          bigserial primary key,
  ran_at      timestamptz not null default now(),
  ok          boolean not null default true,
  sources     integer,
  campaigns   integer
);
alter table ingest_runs enable row level security;
drop policy if exists "public reads ingest runs" on ingest_runs;
create policy "public reads ingest runs" on ingest_runs for select to anon, authenticated using (true);
grant select (id, ran_at, ok, sources, campaigns) on ingest_runs to anon, authenticated;
create index if not exists ingest_runs_at_idx on ingest_runs (ran_at desc);
