create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null
    check (
      first_name = btrim(first_name)
      and char_length(first_name) between 1 and 80
    ),
  last_name text not null
    check (
      last_name = btrim(last_name)
      and char_length(last_name) between 1 and 80
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (first_name, last_name) on table public.profiles to authenticated;

create policy "Guests can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Guests can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  raw_first_name text;
  raw_last_name text;
begin
  raw_first_name := pg_catalog.btrim(new.raw_user_meta_data ->> 'first_name');
  raw_last_name := pg_catalog.btrim(new.raw_user_meta_data ->> 'last_name');

  if raw_first_name is null
    or pg_catalog.char_length(raw_first_name) not between 1 and 80
    or raw_last_name is null
    or pg_catalog.char_length(raw_last_name) not between 1 and 80 then
    raise exception 'First and last name must each contain between 1 and 80 characters';
  end if;

  insert into public.profiles (id, first_name, last_name)
  values (new.id, raw_first_name, raw_last_name);
  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

create function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

revoke all on function public.set_profile_updated_at() from public, anon, authenticated;

create trigger set_profile_updated_at
  before update on public.profiles
  for each row
  execute function public.set_profile_updated_at();
