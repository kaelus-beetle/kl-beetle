-- KL BEETLE: optional GPS location fields for visitor logs
-- Run this once in Supabase Dashboard > SQL Editor.
alter table public.visitor_logs
  add column if not exists gps_latitude double precision,
  add column if not exists gps_longitude double precision,
  add column if not exists gps_accuracy double precision,
  add column if not exists gps_consent_at timestamptz;

-- Existing table permissions and RLS policies remain in place.


-- Remember each visitor's choice by a one-way hash of their IP address.
create table if not exists public.visitor_location_consents (
  ip_hash text primary key,
  decision text not null check (decision in ('granted','declined')),
  updated_at timestamptz not null default now()
);
alter table public.visitor_location_consents enable row level security;
revoke all on public.visitor_location_consents from anon, authenticated;

create or replace function public.get_location_consent(p_ip_hash text)
returns text
language sql
security definer
set search_path = public
as $$
  select decision from public.visitor_location_consents where ip_hash = p_ip_hash limit 1;
$$;

create or replace function public.set_location_consent(p_ip_hash text, p_decision text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_decision not in ('granted','declined') then
    raise exception 'Invalid decision';
  end if;
  insert into public.visitor_location_consents(ip_hash, decision, updated_at)
  values (p_ip_hash, p_decision, now())
  on conflict (ip_hash) do update set decision = excluded.decision, updated_at = now();
end;
$$;

revoke all on function public.get_location_consent(text) from public;
revoke all on function public.set_location_consent(text,text) from public;
grant execute on function public.get_location_consent(text) to anon, authenticated;
grant execute on function public.set_location_consent(text,text) to anon, authenticated;
