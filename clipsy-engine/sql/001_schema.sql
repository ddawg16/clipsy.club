-- Clipsy campaign aggregation + Wire engine
-- Run against Supabase / any Postgres 14+.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- sources
create table if not exists sources (
  id          text primary key,             -- 'clippingnet', 'whop', 'direct'
  name        text not null,                -- display label shown on the card badge
  kind        text not null default 'scrape', -- api | scrape | manual
  homepage    text,
  enabled     boolean not null default true,
  last_run_at timestamptz,
  last_error  text
);

insert into sources (id, name, kind, homepage) values
  ('clippingnet', 'via clipping.net', 'scrape', 'https://clipping.net'),
  ('whop',        'via Whop',         'api',    'https://whop.com'),
  ('direct',      'Clipsy Direct',    'manual', null)
on conflict (id) do nothing;

-- -------------------------------------------------------------- campaigns
create table if not exists campaigns (
  id            uuid primary key default gen_random_uuid(),
  source_id     text not null references sources(id),
  external_id   text not null,              -- the id/slug on the source site
  name          text not null,
  brand         text,
  url           text,                       -- ALWAYS deep-link back to the source
  rate_cpm      numeric,                    -- $ per 100k views
  min_views     integer,
  platforms     text[] not null default '{}',
  ends_at       timestamptz,
  status        text not null default 'active',  -- active | closed | pulled
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  -- computed by the scoring pass
  heat          integer not null default 0,      -- 0..100
  effort_score  integer not null default 50,     -- 0..100, higher = easier
  effort_label  text    not null default 'Medium',
  payout_days   integer,
  unique (source_id, external_id)
);

create index if not exists campaigns_status_idx on campaigns (status, heat desc);
create index if not exists campaigns_ends_idx   on campaigns (ends_at);

-- ---------------------------------------------------- snapshots (the diff)
create table if not exists campaign_snapshots (
  id          bigserial primary key,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  captured_at timestamptz not null default now(),
  rate_cpm    numeric,
  min_views   integer,
  status      text,
  ends_at     timestamptz,
  payload     jsonb
);

create index if not exists snapshots_campaign_idx
  on campaign_snapshots (campaign_id, captured_at desc);

-- ------------------------------------------------------------ wire events
create table if not exists wire_events (
  id          bigserial primary key,
  campaign_id uuid references campaigns(id) on delete cascade,
  source_id   text references sources(id),
  type        text not null,   -- new_drop|rate_up|rate_down|min_views_up|min_views_down|closing|closed|pulled|payout_issue
  headline    text not null,
  old_value   text,
  new_value   text,
  severity    text not null default 'info', -- info | good | warn
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists wire_created_idx on wire_events (created_at desc);
create unique index if not exists wire_dedupe_idx
  on wire_events (campaign_id, type, coalesce(new_value, ''), (date_trunc('hour', created_at at time zone 'UTC')));

-- ------------------------------------------- outcomes (the actual moat)
-- Fed from your Discord rosters. This is what makes Effort real and is the
-- one dataset no competitor can scrape off you.
create table if not exists clip_outcomes (
  id              bigserial primary key,
  campaign_id     uuid not null references campaigns(id) on delete cascade,
  clipper_id      text,
  submitted_at    timestamptz not null default now(),
  approved        boolean,
  rejected_reason text,
  views           bigint,
  paid_at         timestamptz
);

create index if not exists outcomes_campaign_idx on clip_outcomes (campaign_id, submitted_at desc);

-- ------------------------------------------------ community submissions
create table if not exists campaign_submissions (
  id           bigserial primary key,
  submitted_by text,
  raw_url      text not null,
  notes        text,
  status       text not null default 'pending', -- pending | approved | rejected
  created_at   timestamptz not null default now()
);
