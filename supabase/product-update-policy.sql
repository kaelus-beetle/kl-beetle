-- KL BEETLE 상품 수정 권한
alter table public.products enable row level security;

drop policy if exists "Authenticated users can update products" on public.products;
create policy "Authenticated users can update products"
on public.products
for update
to authenticated
using (true)
with check (true);
