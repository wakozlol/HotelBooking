create function public.list_available_rooms(
  requested_hotel_id text,
  requested_check_in date,
  requested_check_out date,
  requested_guest_count integer
)
returns table (room_id uuid, capacity integer, nightly_rate numeric)
language plpgsql
stable
security definer
set search_path = ''
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
  select r.id, r.capacity, r.nightly_rate
  from public.rooms r
  join public.hotels h on h.id = r.hotel_id
  where r.hotel_id = requested_hotel_id
    and h.is_published
    and r.is_active
    and r.capacity >= requested_guest_count
    and not exists (
      select 1
      from public.reservations b
      where b.room_id = r.id
        and b.status = 'confirmed'
        and b.check_in < requested_check_out
        and b.check_out > requested_check_in
    )
  order by r.nightly_rate, r.id;
end;
$$;

revoke all on function public.list_available_rooms(text, date, date, integer)
  from public, anon, authenticated;
grant execute on function public.list_available_rooms(text, date, date, integer)
  to anon, authenticated;
