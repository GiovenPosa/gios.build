-- Website audits (docs/website-audit/spec.md §13). Each request from the
-- /website-audit form is a row here; the Worker (worker/audit.ts) writes it
-- with the secret key, and also files the request in booking_inquiries
-- (source_page '/website-audit') so it reaches the lead app's inbox and push
-- alert like any enquiry.
--
-- Phase 1 only saves the request (status 'queued' or 'held'). The columns for
-- the gathered facts, Claude's report and sending are here from the start so
-- later phases don't need another migration.
--
-- Run once in the Supabase SQL editor.

create table public.audits (
  id uuid primary key default gen_random_uuid(),
  -- the private report's address (/report/<report_id>): a random UUID's 122
  -- random bits as 32 hex characters, so it can't be guessed
  report_id text not null unique default replace(gen_random_uuid()::text, '-', ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- what the visitor sent
  url text not null,
  -- the site's host, lower case, without "www.": one audit per domain per 30 days
  domain text not null,
  email text not null,
  phone text not null,
  wants_more_of text,
  consent_text text not null,
  consent_at timestamptz not null,
  -- a hash of the visitor's IP address, for the daily limit only
  ip_hash text,
  source_page text,
  user_agent text,

  -- where it's up to (spec §4)
  status text not null default 'queued'
    check (status in ('queued', 'held', 'gathering', 'writing', 'review', 'ready', 'sent', 'failed', 'rejected')),
  fail_reason text,

  -- later phases: the facts, Claude's draft, Gio's edited version, the checks
  facts jsonb,
  report jsonb,
  report_final jsonb,
  checks jsonb,
  model text,
  prompt_version text,
  cost_tokens_in integer,
  cost_tokens_out integer,

  -- the enquiry it filed in the lead app's inbox
  inquiry_id uuid references public.booking_inquiries (id) on delete set null,

  sent_at timestamptz,
  first_viewed_at timestamptz,
  view_count integer not null default 0
);

alter table public.audits enable row level security;

-- the lead app's signed-in user reads and edits them; nobody else (the
-- Worker uses the secret key, which bypasses row-level security)
create policy "Signed-in users manage audits"
  on public.audits
  for all
  to authenticated
  using (true)
  with check (true);

create trigger audits_set_updated_at
  before update on public.audits
  for each row execute function set_updated_at();

create index audits_domain_created_idx on public.audits (domain, created_at desc);
create index audits_ip_created_idx on public.audits (ip_hash, created_at desc);
create index audits_created_idx on public.audits (created_at desc);
