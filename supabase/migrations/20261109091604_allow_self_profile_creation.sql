grant insert (id, first_name, last_name) on table public.profiles to authenticated;

create policy "Guests can create their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);
