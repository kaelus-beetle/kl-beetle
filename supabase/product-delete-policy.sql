-- KL BEETLE 판매글 삭제 권한
alter table public.products enable row level security;

drop policy if exists "Authenticated users can delete products" on public.products;
create policy "Authenticated users can delete products"
on public.products
for delete
to authenticated
using (true);
