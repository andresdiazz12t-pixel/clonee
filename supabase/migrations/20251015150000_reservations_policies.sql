-- Enable and configure row level security policies for reservations
alter table public.reservations enable row level security;
alter table public.reservations force row level security;

-- Clean up existing policies if they exist to avoid duplicates when re-running migrations
drop policy if exists "Users can select reservations" on public.reservations;
drop policy if exists "Users can insert reservations" on public.reservations;
drop policy if exists "Users can update reservations" on public.reservations;
drop policy if exists "Admins manage reservations" on public.reservations;
drop policy if exists "Authenticated users can view reservations" on public.reservations;
drop policy if exists "Authenticated users can insert reservations" on public.reservations;
drop policy if exists "Authenticated users can update reservations" on public.reservations;
drop policy if exists "Authenticated users can delete reservations" on public.reservations;

-- Allow authenticated users to read reservations to display schedules and their own bookings
create policy "Authenticated users can read reservations"
  on public.reservations
  for select
  to authenticated
  using (
    -- Users can always read their own reservations
    user_id = auth.uid()
    or
    -- Administrators can read all reservations
    public.is_admin(auth.uid())
    or
    -- Any authenticated user can view reservations of active spaces to check availability
    exists (
      select 1
      from public.spaces s
      where s.id = reservations.space_id
        and s.is_active = true
    )
  );

-- Allow authenticated users to create reservations for themselves only in active spaces
create policy "Authenticated users can insert reservations"
  on public.reservations
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.spaces s
      where s.id = reservations.space_id
        and s.is_active = true
    )
  );

-- Allow authenticated users to update (e.g., cancel) only their own reservations
create policy "Authenticated users can update own reservations"
  on public.reservations
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Administrators can manage reservations without restrictions
create policy "Admins manage reservations"
  on public.reservations
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
