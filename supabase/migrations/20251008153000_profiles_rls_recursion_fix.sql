-- Fix recursion in admin checks for profiles policies and role management

create or replace function public.is_admin(user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  is_admin_user boolean;
begin
  perform set_config('row_security', 'off', true);

  select exists (
    select 1
    from public.profiles p
    where p.id = user_id
      and p.role = 'admin'
  )
  into is_admin_user;

  return coalesce(is_admin_user, false);
end;
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

drop policy if exists "Admins can read profiles" on public.profiles;
create policy "Admins can read profiles"
  on public.profiles
  for select
  using (public.is_admin(auth.uid()));

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles
  for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

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

  if not public.is_admin(auth.uid()) then
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
