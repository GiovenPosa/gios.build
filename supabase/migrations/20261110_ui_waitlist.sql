-- The Gio UI waitlist: emails left on gios.build/ui, to send one email when
-- the component library launches (worker/waitlist.ts).
--
-- One row per address; the database compares them case-insensitively, so
-- "Alex@x.com" and "alex@x.com" are the same sign-up.
--
-- Only the site's Worker writes here, with the secret key. Row level security
-- is on with no policies, so the public key can't read or write it.

create extension if not exists citext;

create table public.ui_waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email citext not null unique,
  -- the page it was left on, e.g. /ui
  source_page text
);

alter table public.ui_waitlist enable row level security;
