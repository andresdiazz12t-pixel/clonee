--
-- Para desactivar la confirmación de correo en Supabase: ve a Authentication > Providers > Email y deshabilita "Confirm email".
-- Esto permite que los usuarios creados con correos sintéticos basados en el número de identificación puedan iniciar sesión sin esperar confirmación.
--

-- Ajustar la columna id de profiles para que dependa de auth.users
alter table public.profiles
  alter column id drop default;

alter table public.profiles
  alter column id set not null;

alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  add constraint profiles_id_auth_users_fkey
  foreign key (id)
  references auth.users (id)
  on update cascade
  on delete cascade
  not valid;

-- Actualizar la relación con reservations para propagar los cambios de id
alter table public.reservations
  drop constraint if exists reservations_user_id_fkey;

alter table public.reservations
  add constraint reservations_user_id_fkey
  foreign key (user_id)
  references public.profiles (id)
  on update cascade
  on delete cascade;

-- Reconfigurar políticas RLS
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Profiles update" on public.profiles;
drop policy if exists "Allow profile updates" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Admins can read profiles" on public.profiles;
drop policy if exists "Users can insert profile" on public.profiles;

create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Admins can read profiles"
  on public.profiles
  for select
  using (
    exists (
      select 1
      from public.profiles as admin_profiles
      where admin_profiles.id = auth.uid()
        and admin_profiles.role = 'admin'
    )
  );

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

create policy "Users can insert profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Intentar validar la nueva referencia tras ejecutar el script de migración de usuarios
DO $$
BEGIN
  ALTER TABLE public.profiles VALIDATE CONSTRAINT profiles_id_auth_users_fkey;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'La validación de profiles_id_auth_users_fkey falló. Ejecuta scripts/migrate-auth-users.ts y vuelve a validar la restricción.';
END;
$$;
