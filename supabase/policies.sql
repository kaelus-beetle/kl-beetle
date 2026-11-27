-- Run in Supabase SQL Editor only after confirming the table names/columns.
-- Public can read product listings. Only authenticated admin users can manage them.
alter table public.products enable row level security;
drop policy if exists "Public can read products" on public.products;
create policy "Public can read products" on public.products
for select to anon, authenticated using (true);
drop policy if exists "Authenticated admins manage products" on public.products;
create policy "Authenticated admins manage products" on public.products
for all to authenticated using (true) with check (true);

-- Site settings can be read by visitors; only authenticated users can edit.
alter table public.site_settings enable row level security;
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings
for select to anon, authenticated using (true);
drop policy if exists "Authenticated admins manage site settings" on public.site_settings;
create policy "Authenticated admins manage site settings" on public.site_settings
for all to authenticated using (true) with check (true);

-- Visitor logs: allow anonymous inserts; only authenticated admins can read.
alter table public.visitors enable row level security;
drop policy if exists "Public can insert visitor logs" on public.visitors;
create policy "Public can insert visitor logs" on public.visitors
for insert to anon, authenticated with check (true);
drop policy if exists "Authenticated admins read visitor logs" on public.visitors;
create policy "Authenticated admins read visitor logs" on public.visitors
for select to authenticated using (true);

-- Storage: public image viewing, authenticated uploads/deletes.
drop policy if exists "Public can view KL beetle images" on storage.objects;
create policy "Public can view KL beetle images" on storage.objects
for select to public using (bucket_id = 'kl-beetle-images');
drop policy if exists "Authenticated admins upload KL beetle images" on storage.objects;
create policy "Authenticated admins upload KL beetle images" on storage.objects
for insert to authenticated with check (bucket_id = 'kl-beetle-images');
drop policy if exists "Authenticated admins update KL beetle images" on storage.objects;
create policy "Authenticated admins update KL beetle images" on storage.objects
for update to authenticated using (bucket_id = 'kl-beetle-images') with check (bucket_id = 'kl-beetle-images');
drop policy if exists "Authenticated admins delete KL beetle images" on storage.objects;
create policy "Authenticated admins delete KL beetle images" on storage.objects
for delete to authenticated using (bucket_id = 'kl-beetle-images');
