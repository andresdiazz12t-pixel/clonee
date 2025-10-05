alter table public.profiles
  add column if not exists email text,
  add column if not exists identification_number text,
  add column if not exists phone text,
  add column if not exists password_hash text,
  add column if not exists role text default 'user',
  add column if not exists is_active boolean default true;

update public.profiles
set role = 'user'
where role is null;

update public.profiles
set is_active = true
where is_active is null;

update public.profiles
set identification_number = id
where identification_number is null;

alter table public.profiles
  alter column role set default 'user',
  alter column role set not null,
  alter column is_active set default true,
  alter column is_active set not null,
  alter column identification_number set not null;

create unique index if not exists profiles_identification_number_key
  on public.profiles (identification_number);

alter table public.profiles
drop column if exists username;
