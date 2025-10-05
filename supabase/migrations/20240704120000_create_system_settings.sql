create table if not exists public.system_settings (
  id text primary key default 'global'::text,
  max_advance_days integer not null default 30,
  max_concurrent_reservations integer not null default 3,
  internal_message text not null default 'Recuerda confirmar la disponibilidad antes de aprobar una reserva especial.'
);

insert into public.system_settings (id)
values ('global')
on conflict (id) do nothing;
