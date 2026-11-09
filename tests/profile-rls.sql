-- Run against an isolated or test project as a privileged database user.
-- The test rolls back all synthetic users and profiles.
do $test$
declare
  old_user uuid := gen_random_uuid();
  new_user uuid := gen_random_uuid();
  visible_count integer;
  changed_count integer;
  denied boolean;
begin
  begin
    insert into auth.users (id, email, raw_user_meta_data)
    values
      (old_user, old_user::text || '@example.invalid', '{"first_name":"Old","last_name":"User"}'::jsonb),
      (new_user, new_user::text || '@example.invalid', '{"first_name":"New","last_name":"User"}'::jsonb);

    select count(*) into visible_count from public.profiles where id = new_user;
    if visible_count <> 1 then raise exception 'New user profile was not created'; end if;
    delete from public.profiles where id = old_user;

    perform pg_catalog.set_config('request.jwt.claim.sub', old_user::text, true);
    perform pg_catalog.set_config('role', 'authenticated', true);
    select count(*) into visible_count from public.profiles where id = new_user;
    if visible_count <> 0 then raise exception 'Other profile was visible'; end if;
    insert into public.profiles (id, first_name, last_name) values (old_user, 'Old', 'User');
    select count(*) into visible_count from public.profiles where id = old_user;
    if visible_count <> 1 then raise exception 'Own profile was not visible'; end if;
    update public.profiles set first_name = 'Updated' where id = old_user;
    get diagnostics changed_count = row_count;
    if changed_count <> 1 then raise exception 'Own profile update failed'; end if;
    update public.profiles set first_name = 'Changed' where id = new_user;
    get diagnostics changed_count = row_count;
    if changed_count <> 0 then raise exception 'Other profile update was allowed'; end if;
    denied := false;
    begin
      insert into public.profiles (id, first_name, last_name) values (new_user, 'New', 'User');
    exception when insufficient_privilege then denied := true;
    end;
    if not denied then raise exception 'Other profile insertion was allowed'; end if;
    denied := false;
    begin
      update public.profiles set id = new_user where id = old_user;
    exception when insufficient_privilege then denied := true;
    end;
    if not denied then raise exception 'Profile ID update was allowed'; end if;

    perform pg_catalog.set_config('request.jwt.claim.sub', new_user::text, true);
    select count(*) into visible_count from public.profiles where id = new_user;
    if visible_count <> 1 then raise exception 'New user could not read own profile'; end if;
    select count(*) into visible_count from public.profiles where id = old_user;
    if visible_count <> 0 then raise exception 'Existing profile was visible to new user'; end if;
    raise exception using errcode = 'PZ001', message = 'Rollback test data';
  exception when sqlstate 'PZ001' then
    raise notice 'Profile RLS assertions passed; test data rolled back';
  end;
end;
$test$;
