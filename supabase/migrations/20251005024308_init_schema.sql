-- Enable required extensions
create extension if not exists pgcrypto;

-- Profiles table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text,
  identification_number text unique not null,
  phone text,
  password_hash text,
  role text not null default 'user',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Spaces table
create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  capacity integer,
  description text,
  operating_hours_start time not null,
  operating_hours_end time not null,
  rules text[] not null default array[]::text[],
  is_active boolean not null default true,
  image_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger spaces_set_updated_at
before update on public.spaces
for each row
execute function public.set_updated_at();

-- Reservations table
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  event text,
  status text not null default 'confirmed',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint reservations_end_after_start check (end_time > start_time)
);

create trigger reservations_set_updated_at
before update on public.reservations
for each row
execute function public.set_updated_at();

create index if not exists reservations_space_id_date_idx
on public.reservations (space_id, date);

-- System settings table
create table if not exists public.system_settings (
  id text primary key default 'global'::text,
  max_advance_days integer not null default 30,
  max_concurrent_reservations integer not null default 3,
  internal_message text not null default 'Recuerda confirmar la disponibilidad antes de aprobar una reserva especial.'
);

insert into public.system_settings (id)
values ('global')
on conflict (id) do nothing;
