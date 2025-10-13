-- Enable RLS on profiles and restrict updates to admins
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

drop policy if exists "Profiles update" on public.profiles;
drop policy if exists "Allow profile updates" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles
  for update
  using (
    exists (
      select 1
      from public.profiles as admin_profiles
      where admin_profiles.id = auth.uid()
        and admin_profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles as admin_profiles
      where admin_profiles.id = auth.uid()
        and admin_profiles.role = 'admin'
    )
  );

create or replace function public.set_user_role(user_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if new_role is null or new_role not in ('admin', 'user') then
    raise exception 'El rol % no es válido. Usa "admin" o "user".', new_role;
  end if;

  if not exists (
    select 1
    from public.profiles as admin_profiles
    where admin_profiles.id = auth.uid()
      and admin_profiles.role = 'admin'
  ) then
    raise exception 'Solo los administradores pueden cambiar roles de usuario.';
  end if;

  update public.profiles
  set role = new_role,
      updated_at = timezone('utc', now())
  where id = user_id;

  if not found then
    raise exception 'No se encontró el usuario con id %.', user_id;
  end if;
end;
$$;

revoke all on function public.set_user_role(uuid, text) from public;
grant execute on function public.set_user_role(uuid, text) to authenticated;
