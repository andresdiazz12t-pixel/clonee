-- Grant usage on public schema to authenticated role
grant usage on schema public to authenticated;

-- Grant CRUD permissions on public tables to authenticated role
grant select, insert, update, delete on public.spaces to authenticated;
grant select, insert, update, delete on public.reservations to authenticated;
grant select on public.system_settings to authenticated;
