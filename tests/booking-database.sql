-- Run in an isolated test project as a privileged database user.
-- All synthetic rows are rolled back before the block completes.
do $test$
declare
  hotel text;
  room_type uuid;
  room uuid;
  other_room uuid;
  available_room uuid;
  guest_one uuid := gen_random_uuid();
  guest_two uuid := gen_random_uuid();
  request_id uuid := gen_random_uuid();
  booking public.reservations%rowtype;
  retry public.reservations%rowtype;
  matches bigint;
  rejected boolean;
  checkin date := (now() at time zone 'UTC')::date + 10;
begin
  select id into hotel from public.hotels where is_published limit 1;
  if hotel is null then raise exception 'A published hotel is required for this test'; end if;
  begin
    insert into auth.users (id, email, raw_user_meta_data)
    values
      (guest_one, guest_one::text || '@example.invalid', '{"first_name":"Test","last_name":"One"}'),
      (guest_two, guest_two::text || '@example.invalid', '{"first_name":"Test","last_name":"Two"}');
    insert into public.room_types (hotel_id, name)
      values (hotel, 'Test ' || gen_random_uuid()::text) returning id into room_type;
    insert into public.rooms (hotel_id, room_number, capacity, nightly_rate, room_type_id)
      values (hotel, gen_random_uuid()::text, 2, 123.45, room_type) returning id into room;
    insert into public.rooms (hotel_id, room_number, capacity, nightly_rate, room_type_id)
      values (hotel, gen_random_uuid()::text, 2, 123.45, room_type) returning id into other_room;
    select available_count into matches from public.list_room_offers(hotel, checkin, checkin + 2, 2)
      where room_type_id = room_type;
    if matches is distinct from 2 then raise exception 'Both available rooms were not found'; end if;
    rejected := false;
    begin
      perform public.list_room_offers(hotel, checkin, checkin, 2);
    exception when sqlstate 'P0001' then rejected := true;
    end;
    if not rejected then raise exception 'Invalid dates accepted'; end if;
    perform set_config('request.jwt.claim.sub', guest_one::text, true);
    perform set_config('role', 'authenticated', true);
    select * into booking from public.confirm_room_booking(room, room_type, checkin, checkin + 2, 2, 123.45, request_id);
    if booking.room_id <> room or booking.status <> 'confirmed' or booking.total_eur <> 246.90 then
      raise exception 'Incorrect reservation';
    end if;
    select * into retry from public.confirm_room_booking(room, room_type, checkin, checkin + 2, 2, 123.45, request_id);
    if retry.id <> booking.id then raise exception 'Retry was not idempotent'; end if;
    select available_count, room_id into matches, available_room from public.list_room_offers(hotel, checkin + 1, checkin + 3, 2)
      where room_type_id = room_type;
    if matches is distinct from 1 or available_room is distinct from other_room then
      raise exception 'The remaining available room was not offered';
    end if;
    perform set_config('request.jwt.claim.sub', guest_two::text, true);
    select count(*) into matches from public.my_reservations() where id = booking.id;
    if matches <> 0 then raise exception 'Another guest could view the booking'; end if;
    rejected := false;
    begin
      perform public.confirm_room_booking(room, room_type, checkin, checkin + 2, 2, 123.45, gen_random_uuid());
    exception when sqlstate 'P0001' then rejected := true;
    end;
    if not rejected then raise exception 'Overlapping booking accepted'; end if;
    select * into retry from public.confirm_room_booking(other_room, room_type, checkin, checkin + 2, 2, 123.45, gen_random_uuid());
    if retry.room_id is distinct from other_room or retry.status is distinct from 'confirmed' then
      raise exception 'The other available room was not booked';
    end if;
    select count(*) into matches from public.my_reservations() where id = retry.id;
    if matches <> 1 then raise exception 'The second guest cannot see their booking'; end if;
    select available_count into matches from public.list_room_offers(hotel, checkin, checkin + 2, 2)
      where room_type_id = room_type;
    if matches is distinct from 0 then raise exception 'Both reserved rooms should be unavailable'; end if;
    rejected := false;
    begin
      perform public.cancel_my_reservation(booking.id);
    exception when sqlstate 'P0001' then rejected := true;
    end;
    if not rejected then raise exception 'Another guest could cancel the booking'; end if;
    perform set_config('request.jwt.claim.sub', guest_one::text, true);
    perform public.cancel_my_reservation(booking.id);
    select count(*) into matches from public.my_reservations() where id = booking.id and status = 'cancelled';
    if matches <> 1 then raise exception 'Cancellation not reflected in history'; end if;
    select available_count into matches from public.list_room_offers(hotel, checkin, checkin + 2, 2)
      where room_type_id = room_type;
    if matches <> 1 then raise exception 'Cancelled room was not released'; end if;
    raise exception using errcode = 'PZ001', message = 'Rollback test data';
  exception when sqlstate 'PZ001' then
    raise notice 'Booking assertions passed; test data rolled back';
  end;
end;
$test$;
