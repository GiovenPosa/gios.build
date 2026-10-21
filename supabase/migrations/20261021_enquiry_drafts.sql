-- Enquiry drafts: the form saves each step here as the visitor goes, so
-- their contact details are kept from step 1 even if they never finish.
--
-- Finished enquiries are copied into booking_inquiries as before, so the
-- lead app and its push notification (the notify_new_inquiry trigger) only
-- ever see complete ones. Drafts stay here, visible in the Supabase table
-- editor.
--
-- Only the site's Worker writes here, with the secret key. Row level security
-- is on with no policies, so the public key can't read or write it.

create table public.enquiry_drafts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- the furthest step saved: 1 contact, 2 project, 3 sent
  step smallint not null default 1,
  name text not null,
  email text not null,
  phone text,
  current_site text,
  selected_types text[],
  selected_package text,
  budget numeric,
  message text,
  source_page text,
  user_agent text,
  -- set when the enquiry is sent and copied into booking_inquiries
  completed_at timestamptz
);

alter table public.enquiry_drafts enable row level security;

-- the same updated_at helper the contacts table uses
create trigger enquiry_drafts_set_updated_at
  before update on public.enquiry_drafts
  for each row execute function set_updated_at();

-- unfinished drafts, newest first, for checking in the table editor
create index enquiry_drafts_open_idx
  on public.enquiry_drafts (created_at desc)
  where completed_at is null;

-- Nightly clean-up, as the privacy page promises: unfinished drafts go after
-- 3 months; sent ones after a week (by then the enquiry itself lives in
-- booking_inquiries).
create extension if not exists pg_cron;

select cron.schedule(
  'delete-old-enquiry-drafts',
  '0 3 * * *',
  $$
    delete from public.enquiry_drafts
    where (completed_at is null and created_at < now() - interval '3 months')
       or (completed_at < now() - interval '7 days')
  $$
);
