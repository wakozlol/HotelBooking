create extension if not exists btree_gist with schema extensions;

set search_path = public, extensions;

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  hotel_id text not null references public.hotels (id) on delete restrict,
  room_number text not null
    check (room_number = btrim(room_number) and char_length(room_number) between 1 and 40),
  capacity integer not null check (capacity between 1 and 100),
  nightly_rate numeric(10, 2) not null check (nightly_rate between 0 and 100000),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (hotel_id, room_number)
);

alter table public.rooms enable row level security;
revoke all on table public.rooms from public, anon, authenticated;
grant select, insert, delete on table public.rooms to authenticated;
grant update (room_number, capacity, nightly_rate, is_active)
  on table public.rooms to authenticated;

create policy "Admins can view rooms"
  on public.rooms for select to authenticated
  using ((select public.is_hotel_admin()));
create policy "Admins can create rooms"
  on public.rooms for insert to authenticated
  with check ((select public.is_hotel_admin()));
create policy "Admins can update rooms"
  on public.rooms for update to authenticated
  using ((select public.is_hotel_admin()))
  with check ((select public.is_hotel_admin()));
create policy "Admins can delete rooms"
  on public.rooms for delete to authenticated
  using ((select public.is_hotel_admin()));

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references auth.users (id) on delete restrict,
  room_id uuid not null references public.rooms (id) on delete restrict,
  check_in date not null,
  check_out date not null,
  guest_count integer not null check (guest_count between 1 and 100),
  nightly_rate numeric(10, 2) not null check (nightly_rate between 0 and 100000),
  total_eur numeric(14, 2) not null
    check (total_eur = nightly_rate * (check_out - check_in)),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  check (check_in < check_out),
  constraint reservations_no_overlapping_confirmed_stays
    exclude using gist (
      room_id with =,
      daterange(check_in, check_out, '[)') with &&
    ) where (status = 'confirmed')
);

create index reservations_guest_created_idx on public.reservations (guest_id, created_at desc);
alter table public.reservations enable row level security;
revoke all on table public.reservations from public, anon, authenticated;
grant select on table public.reservations to authenticated;

create policy "Guests can view their reservations"
  on public.reservations for select to authenticated
  using ((select auth.uid()) = guest_id);
create policy "Admins can view reservations"
  on public.reservations for select to authenticated
  using ((select public.is_hotel_admin()));

create function public.book_room(
  requested_room_id uuid,
  requested_check_in date,
  requested_check_out date,
  requested_guest_count integer,
  expected_nightly_rate numeric
)
returns public.reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_guest uuid := auth.uid();
  chosen_room public.rooms%rowtype;
  booking public.reservations%rowtype;
begin
  if current_guest is null then
    raise exception 'Sign in to book a room.' using errcode = 'P0001';
  end if;
  if requested_check_in is null or requested_check_out is null
    or requested_check_in < (pg_catalog.now() at time zone 'UTC')::date
    or requested_check_out <= requested_check_in
    or requested_check_out > date '9999-12-31'
    or requested_guest_count is null or requested_guest_count < 1 then
    raise exception 'Choose valid dates and a positive guest count.' using errcode = 'P0001';
  end if;

  select r.* into chosen_room
  from public.rooms r
  join public.hotels h on h.id = r.hotel_id
  where r.id = requested_room_id and r.is_active and h.is_published
  for update of r;

  if not found or requested_guest_count > chosen_room.capacity then
    raise exception 'This room is unavailable for your party.' using errcode = 'P0001';
  end if;
  if expected_nightly_rate is null or expected_nightly_rate <> chosen_room.nightly_rate then
    raise exception 'The room price has changed. Review the current price before booking.' using errcode = 'P0001';
  end if;

  begin
    insert into public.reservations (
      guest_id, room_id, check_in, check_out, guest_count, nightly_rate, total_eur
    ) values (
      current_guest, chosen_room.id, requested_check_in, requested_check_out,
      requested_guest_count, chosen_room.nightly_rate,
      chosen_room.nightly_rate * (requested_check_out - requested_check_in)
    ) returning * into booking;
  exception when exclusion_violation then
    raise exception 'This room is no longer available for those dates.' using errcode = 'P0001';
  end;
  return booking;
end;
$$;

revoke all on function public.book_room(uuid, date, date, integer, numeric)
  from public, anon, authenticated;
grant execute on function public.book_room(uuid, date, date, integer, numeric)
  to authenticated;

reset search_path;
