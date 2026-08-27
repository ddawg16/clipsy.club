-- Row Level Security. Run this immediately after 001_schema.sql.
--
-- WHY THIS FILE EXISTS: Supabase exposes every table over PostgREST at a public
-- URL. Without RLS, anyone who finds your anon key — and it ships in your
-- frontend JavaScript, so assume everyone has it — can read AND write every
-- table. That is the single most common way a "vibe coded" Supabase site leaks.
-- Default-deny everything, then open the narrowest possible read paths.

alter table sources              enable row level security;
alter table campaigns            enable row level security;
alter table campaign_snapshots   enable row level security;
alter table wire_events          enable row level security;
alter table clip_outcomes        enable row level security;
alter table campaign_submissions enable row level security;

-- Belt and braces: revoke the blanket grants Supabase hands the public roles,
-- so a missing policy fails closed instead of open.
revoke all on all tables in schema public from anon, authenticated;

-- ---------------------------------------------------------------- PUBLIC READ
-- Only two things are safe for the world to read, and only some columns.

create policy "public reads active campaigns"
  on campaigns for select
  to anon, authenticated
  using (status = 'active');

grant select (
  id, source_id, external_id, name, brand, url, rate_cpm, min_views,
  platforms, ends_at, status, first_seen_at, heat, effort_score,
  effort_label, payout_days
) on campaigns to anon, authenticated;

create policy "public reads published wire"
  on wire_events for select
  to anon, authenticated
  using (published = true);

grant select (id, campaign_id, source_id, type, headline, severity, created_at)
  on wire_events to anon, authenticated;

create policy "public reads source labels"
  on sources for select
  to anon, authenticated
  using (enabled = true);

-- last_error can contain internal URLs and stack detail. Never expose it.
grant select (id, name, kind, homepage, enabled) on sources to anon, authenticated;

-- ------------------------------------------------------------- SUBMISSIONS
-- The only thing the public may write, and it lands in a moderation queue.
create policy "public may submit a campaign"
  on campaign_submissions for insert
  to anon, authenticated
  with check (status = 'pending');

grant insert (submitted_by, raw_url, notes, status) on campaign_submissions to anon;

-- ------------------------------------------------------------ NEVER PUBLIC
-- campaign_snapshots  — your scrape cadence and raw payloads
-- clip_outcomes       — per-clipper earnings and approval history. This is the
--                       most sensitive table you own. Leaking it exposes your
--                       clippers' income and hands a competitor your moat.
-- campaign_submissions SELECT — contains submitter contact details
--
-- No policies are created for these, so with RLS on they are deny-by-default
-- for anon/authenticated. Only the service-role key (server-side only, never
-- in a browser bundle) can reach them.

-- --------------------------------------------------------------- INTEGRITY
alter table campaigns
  add constraint campaigns_rate_sane check (rate_cpm is null or (rate_cpm >= 0 and rate_cpm <= 100000)) not valid;
alter table campaigns
  add constraint campaigns_status_valid check (status in ('active', 'closed', 'pulled')) not valid;
alter table clip_outcomes
  add constraint outcomes_views_sane check (views is null or views >= 0) not valid;
alter table wire_events
  add constraint wire_headline_len check (char_length(headline) <= 500) not valid;
