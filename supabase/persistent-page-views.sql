-- 방문자 상세 기록과 조회수 집계를 분리해, 방문 기록 삭제 후에도 조회수 유지
create table if not exists public.page_view_counts (
  page_path text primary key,
  view_count bigint not null default 0
);

alter table public.page_view_counts enable row level security;

drop policy if exists "Authenticated users can read page view counts" on public.page_view_counts;
create policy "Authenticated users can read page view counts"
on public.page_view_counts for select
to authenticated
using (true);

-- 기존 방문 기록을 조회수 집계에 1회 반영 (이미 집계된 경로는 중복 반영하지 않음)
insert into public.page_view_counts (page_path, view_count)
select page_path, count(*)::bigint
from public.visitor_logs
group by page_path
on conflict (page_path) do nothing;

create or replace function public.record_page_view(p_page_path text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_page_path is null or left(p_page_path, 1) <> '/' or left(p_page_path, 6) = '/admin' or left(p_page_path, 5) = '/api/' then
    return;
  end if;
  insert into public.page_view_counts (page_path, view_count)
  values (p_page_path, 1)
  on conflict (page_path)
  do update set view_count = public.page_view_counts.view_count + 1;
end;
$$;

grant execute on function public.record_page_view(text) to anon, authenticated;

create or replace function public.get_visitor_summary()
returns table(total_views bigint, unique_visitors bigint)
language sql
security invoker
set search_path = public
as $$
  select
    coalesce((select sum(view_count)::bigint from public.page_view_counts), 0),
    (select count(distinct visitor_id)::bigint from public.visitor_logs);
$$;

grant execute on function public.get_visitor_summary() to authenticated;
