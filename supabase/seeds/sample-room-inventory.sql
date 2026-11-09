-- Explicit, one-time development seed. Do not run against production.
-- Sample offers are bookable database test records, not real hotel stays.
do $seed$
begin
  lock table public.hotels, public.room_types, public.rooms in share row exclusive mode;
  if not exists (select 1 from public.hotels) then
    raise exception 'No hotels exist; sample inventory was not created.';
  end if;
  if exists (select 1 from public.room_types) or exists (select 1 from public.rooms) then
    raise exception 'Room inventory is not empty; sample inventory was not created.';
  end if;

  insert into public.room_types (hotel_id, name, is_active)
  select h.id, sample.name, true
  from public.hotels h
  cross join (values
    ('SAMPLE TEST ONLY - NO HOTEL STAY - Double'),
    ('SAMPLE TEST ONLY - NO HOTEL STAY - Family')
  ) as sample(name);

  insert into public.rooms (hotel_id, room_type_id, room_number, capacity, nightly_rate, is_active)
  select t.hotel_id, t.id, sample.room_number, sample.capacity, sample.nightly_rate, true
  from public.room_types t
  join (values
    ('SAMPLE TEST ONLY - NO HOTEL STAY - Double', 'SAMPLE-101', 2, 120.00::numeric),
    ('SAMPLE TEST ONLY - NO HOTEL STAY - Double', 'SAMPLE-102', 2, 120.00::numeric),
    ('SAMPLE TEST ONLY - NO HOTEL STAY - Family', 'SAMPLE-201', 4, 180.00::numeric)
  ) as sample(type_name, room_number, capacity, nightly_rate) on t.name = sample.type_name;
end;
$seed$;
