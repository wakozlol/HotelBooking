-- Run in an isolated test project as a privileged database user.
-- All synthetic rows are rolled back before the block completes.
do $test$
declare
  hotel text;
  room_type uuid;
  room uuid;
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
    select available_count into matches from public.list_room_offers(hotel, checkin, checkin + 2, 2)
      where room_type_id = room_type;
    if matches <> 1 then raise exception 'Available room not found'; end if;
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
    select available_count into matches from public.list_room_offers(hotel, checkin + 1, checkin + 3, 2)
      where room_type_id = room_type;
    if matches <> 0 then raise exception 'Overlapping room was shown available'; end if;
    perform set_config('request.jwt.claim.sub', guest_two::text, true);
    select count(*) into matches from public.my_reservations() where id = booking.id;
    if matches <> 0 then raise exception 'Another guest could view the booking'; end if;
    rejected := false;
    begin
      perform public.confirm_room_booking(room, room_type, checkin, checkin + 2, 2, 123.45, gen_random_uuid());
    exception when sqlstate 'P0001' then rejected := true;
    end;
    if not rejected then raise exception 'Overlapping booking accepted'; end if;
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
