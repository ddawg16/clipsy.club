-- Partner campaigns source, fed by a Google Sheet (see PARTNERS-SHEET-SETUP.md).
-- Run once in the Supabase SQL editor. Safe to re-run.
insert into sources (id, name, kind, homepage) values
  ('partners', 'Partner', 'manual', null)
on conflict (id) do nothing;
