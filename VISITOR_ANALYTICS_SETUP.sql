-- KL BEETLE: visitor analytics fields
-- Run once in Supabase Dashboard > SQL Editor.

alter table public.visitor_logs
  add column if not exists event_id uuid,
  add column if not exists is_returning boolean not null default false,
  add column if not exists referrer_url text,
  add column if not exists referrer_source text,
  add column if not exists browser_language text,
  add column if not exists timezone text,
  add column if not exists duration_seconds integer;

create unique index if not exists visitor_logs_event_id_idx
  on public.visitor_logs(event_id)
  where event_id is not null;

-- Called when a visitor leaves a page; only updates the matching random event ID.
create or replace function public.record_visitor_duration(
  p_event_id uuid,
  p_duration_seconds integer
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.visitor_logs
  set duration_seconds = greatest(0, least(coalesce(p_duration_seconds, 0), 86400))
  where event_id = p_event_id;
$$;

-- Number of distinct visitor browser IDs seen in the last five minutes.
create or replace function public.get_active_visitor_count()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(distinct visitor_id)::integer
  from public.visitor_logs
  where created_at >= now() - interval '5 minutes';
$$;

revoke all on function public.record_visitor_duration(uuid, integer) from public;
revoke all on function public.get_active_visitor_count() from public;
grant execute on function public.record_visitor_duration(uuid, integer) to anon, authenticated;
grant execute on function public.get_active_visitor_count() to anon, authenticated;
