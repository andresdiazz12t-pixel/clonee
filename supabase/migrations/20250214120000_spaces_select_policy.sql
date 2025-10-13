alter table public.spaces enable row level security;
create policy spaces_select_authenticated
  on public.spaces
  for select
  to authenticated
  using (true);
