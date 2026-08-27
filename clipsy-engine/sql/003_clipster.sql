-- Register Clipster as a source. Safe to re-run.
insert into sources (id, name, kind, homepage) values
  ('clipster', 'via Clipster', 'api', 'https://clipster.gg')
on conflict (id) do nothing;
