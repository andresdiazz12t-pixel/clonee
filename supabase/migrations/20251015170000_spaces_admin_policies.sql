-- Policies to allow only admins to modify spaces
create policy spaces_insert_admin
  on public.spaces
  for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

create policy spaces_update_admin
  on public.spaces
  for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy spaces_delete_admin
  on public.spaces
  for delete
  to authenticated
  using (public.is_admin(auth.uid()));
