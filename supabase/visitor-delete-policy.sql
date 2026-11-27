-- KL BEETLE 방문 기록 삭제 권한 (관리자 로그인 후 삭제 기능용)
alter table public.visitor_logs enable row level security;

drop policy if exists "Authenticated users can delete visitor logs" on public.visitor_logs;
create policy "Authenticated users can delete visitor logs"
on public.visitor_logs
for delete
to authenticated
using (true);
