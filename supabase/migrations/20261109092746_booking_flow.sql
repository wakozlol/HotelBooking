create table public.room_types (
  id uuid primary key default gen_random_uuid(),
  hotel_id text not null references public.hotels (id) on delete restrict,
  name text not null check (name = btrim(name) and char_length(name) between 1 and 100),
  is_active boolean not null default true,
  unique (hotel_id, name),
  unique (id, hotel_id)
);

alter table public.room_types enable row level security;
revoke all on public.room_types from public, anon, authenticated;
grant select, insert, update, delete on public.room_types to authenticated;
create policy "Admins can manage room types" on public.room_types
  for all to authenticated
  using ((select public.is_hotel_admin()))
  with check ((select public.is_hotel_admin()));

alter table public.rooms add column room_type_id uuid;
alter table public.rooms add constraint rooms_type_hotel_fkey
  foreign key (room_type_id, hotel_id) references public.room_types (id, hotel_id) on delete restrict;
grant update (room_type_id) on public.rooms to authenticated;

alter table public.reservations add column booking_request_id uuid;
alter table public.reservations add constraint reservations_guest_request_key
  unique (guest_id, booking_request_id);

create function public.list_room_offers(
  requested_hotel_id text,
  requested_check_in date,
  requested_check_out date,
  requested_guest_count integer
)
returns table (
  room_type_id uuid, room_type_name text, room_id uuid,
  capacity integer, nightly_rate numeric, available_count bigint
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if requested_hotel_id is null or requested_check_in is null
    or requested_check_out is null
    or requested_check_in < (pg_catalog.now() at time zone 'UTC')::date
    or requested_check_out <= requested_check_in
    or requested_check_out > date '9999-12-31'
    or requested_guest_count is null or requested_guest_count not between 1 and 100 then
    raise exception 'Choose valid dates and a guest count from 1 to 100.' using errcode = 'P0001';
  end if;

  return query
  select t.id, t.name,
    (array_agg(r.id order by r.id) filter (
      where r.is_active and r.capacity >= requested_guest_count and not exists (
        select 1 from public.reservations b
        where b.room_id = r.id and b.status = 'confirmed'
          and b.check_in < requested_check_out and b.check_out > requested_check_in
      )
    ))[1],
    r.capacity, r.nightly_rate,
    count(r.id) filter (
      where r.is_active and r.capacity >= requested_guest_count and not exists (
        select 1 from public.reservations b
        where b.room_id = r.id and b.status = 'confirmed'
          and b.check_in < requested_check_out and b.check_out > requested_check_in
      )
    )
  from public.room_types t
  join public.hotels h on h.id = t.hotel_id and h.is_published
  left join public.rooms r on r.room_type_id = t.id and r.hotel_id = t.hotel_id and r.is_active
  where t.hotel_id = requested_hotel_id and t.is_active
  group by t.id, t.name, r.capacity, r.nightly_rate
  order by t.name, r.nightly_rate, r.capacity;
end;
$$;

create function public.confirm_room_booking(
  requested_room_id uuid, requested_room_type_id uuid,
  requested_check_in date, requested_check_out date,
  requested_guest_count integer, expected_nightly_rate numeric,
  requested_request_id uuid
)
returns public.reservations
language plpgsql security definer set search_path = ''
as $$
declare
  current_guest uuid := auth.uid();
  existing public.reservations%rowtype;
  room public.rooms%rowtype;
begin
  if current_guest is null then
    raise exception 'Sign in to book a room.' using errcode = 'P0001';
  end if;
  if requested_request_id is null or requested_room_id is null or requested_room_type_id is null
    or requested_check_in is null or requested_check_out is null
    or requested_check_in < (pg_catalog.now() at time zone 'UTC')::date
    or requested_check_out <= requested_check_in or requested_check_out > date '9999-12-31'
    or requested_guest_count is null or requested_guest_count not between 1 and 100
    or expected_nightly_rate is null then
    raise exception 'Choose valid booking details.' using errcode = 'P0001';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(current_guest::text || requested_request_id::text, 0));
  select * into existing from public.reservations
    where guest_id = current_guest and booking_request_id = requested_request_id;
  if found then
    if existing.room_id <> requested_room_id or existing.check_in <> requested_check_in
      or existing.check_out <> requested_check_out or existing.guest_count <> requested_guest_count
      or existing.nightly_rate <> expected_nightly_rate then
      raise exception 'This booking request has already been used.' using errcode = 'P0001';
    end if;
    return existing;
  end if;

  select r.* into room from public.rooms r
    join public.room_types t on t.id = r.room_type_id and t.hotel_id = r.hotel_id
    join public.hotels h on h.id = r.hotel_id
    where r.id = requested_room_id and r.room_type_id = requested_room_type_id
      and r.is_active and t.is_active and h.is_published
    for update of r;
  if not found or room.capacity < requested_guest_count then
    raise exception 'Sorry, this room is no longer available. Please select another room.' using errcode = 'P0001';
  end if;
  if room.nightly_rate <> expected_nightly_rate then
    raise exception 'The room price has changed. Check availability again.' using errcode = 'P0001';
  end if;
  begin
    insert into public.reservations (guest_id, room_id, check_in, check_out, guest_count,
      nightly_rate, total_eur, booking_request_id)
    values (current_guest, room.id, requested_check_in, requested_check_out, requested_guest_count,
      room.nightly_rate, room.nightly_rate * (requested_check_out - requested_check_in), requested_request_id)
    returning * into existing;
  exception when exclusion_violation then
    raise exception 'Sorry, this room is no longer available. Please select another room.' using errcode = 'P0001';
  end;
  return existing;
end;
$$;

create function public.my_reservations()
returns table (
  id uuid, hotel_name text, room_type_name text, room_number text,
  check_in date, check_out date, guest_count integer, nightly_rate numeric,
  total_eur numeric, status text, created_at timestamptz, can_cancel boolean,
  booking_request_id uuid
)
language sql stable security definer set search_path = ''
as $$
  select b.id, h.name, t.name, r.room_number, b.check_in, b.check_out,
    b.guest_count, b.nightly_rate, b.total_eur, b.status, b.created_at,
    b.status = 'confirmed' and pg_catalog.now() < (b.check_in::timestamp at time zone 'UTC') - interval '24 hours',
    b.booking_request_id
  from public.reservations b
  join public.rooms r on r.id = b.room_id
  join public.hotels h on h.id = r.hotel_id
  left join public.room_types t on t.id = r.room_type_id
  where b.guest_id = auth.uid()
  order by b.created_at desc, b.id;
$$;

create function public.cancel_my_reservation(requested_reservation_id uuid)
returns public.reservations
language plpgsql security definer set search_path = ''
as $$
declare
  booking public.reservations%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Sign in to cancel a reservation.' using errcode = 'P0001';
  end if;
  update public.reservations b set status = 'cancelled'
  where b.id = requested_reservation_id and b.guest_id = auth.uid()
    and b.status = 'confirmed'
    and pg_catalog.now() < (b.check_in::timestamp at time zone 'UTC') - interval '24 hours'
  returning b.* into booking;
  if not found then
    raise exception 'This reservation cannot be cancelled. Cancellations close 24 hours before the check-in date begins (UTC).' using errcode = 'P0001';
  end if;
  return booking;
end;
$$;

revoke all on function public.list_room_offers(text,date,date,integer) from public, anon, authenticated;
revoke all on function public.confirm_room_booking(uuid,uuid,date,date,integer,numeric,uuid) from public, anon, authenticated;
revoke all on function public.my_reservations() from public, anon, authenticated;
revoke all on function public.cancel_my_reservation(uuid) from public, anon, authenticated;
grant execute on function public.list_room_offers(text,date,date,integer) to anon, authenticated;
grant execute on function public.confirm_room_booking(uuid,uuid,date,date,integer,numeric,uuid) to authenticated;
grant execute on function public.my_reservations() to authenticated;
grant execute on function public.cancel_my_reservation(uuid) to authenticated;
