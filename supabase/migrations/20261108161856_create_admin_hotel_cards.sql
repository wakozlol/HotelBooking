create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role = 'admin'),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

alter table public.user_roles enable row level security;

revoke all on table public.user_roles from public, anon, authenticated;
grant select on table public.user_roles to authenticated;

create policy "Users can read their own roles"
  on public.user_roles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create function public.is_hotel_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_hotel_admin() from public, anon;
grant execute on function public.is_hotel_admin() to authenticated;

create table public.hotels (
  id text primary key
    check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(id) <= 80),
  name text not null
    check (name = btrim(name) and char_length(name) between 1 and 120),
  location text not null
    check (location = btrim(location) and char_length(location) between 1 and 160),
  description text not null
    check (description = btrim(description) and char_length(description) between 1 and 600),
  style text not null
    check (style in ('coastal', 'alpine', 'garden', 'city')),
  image_url text not null
    check (image_url ~ '^https://'),
  image_path text,
  photo_credit text,
  photo_license text,
  photo_license_url text
    check (photo_license_url is null or photo_license_url ~ '^https://'),
  photo_source text
    check (photo_source is null or photo_source ~ '^https://'),
  highlights text[] not null default '{}'
    check (cardinality(highlights) <= 6),
  nightly_rate numeric(10, 2) not null
    check (nightly_rate between 0 and 100000),
  amenities text[] not null default '{}'
    check (cardinality(amenities) <= 20),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index hotels_published_created_at_idx
  on public.hotels (is_published, created_at);

alter table public.hotels enable row level security;

revoke all on table public.hotels from public, anon, authenticated;
grant select on table public.hotels to anon, authenticated;
grant insert, update, delete on table public.hotels to authenticated;

create policy "Anyone can view published hotels"
  on public.hotels
  for select
  to anon, authenticated
  using (is_published);

create policy "Admins can view all hotels"
  on public.hotels
  for select
  to authenticated
  using ((select public.is_hotel_admin()));

create policy "Admins can create hotels"
  on public.hotels
  for insert
  to authenticated
  with check ((select public.is_hotel_admin()));

create policy "Admins can update hotels"
  on public.hotels
  for update
  to authenticated
  using ((select public.is_hotel_admin()))
  with check ((select public.is_hotel_admin()));

create policy "Admins can delete hotels"
  on public.hotels
  for delete
  to authenticated
  using ((select public.is_hotel_admin()));

create function public.set_hotel_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

revoke all on function public.set_hotel_updated_at() from public, anon, authenticated;

create trigger set_hotel_updated_at
  before update on public.hotels
  for each row
  execute function public.set_hotel_updated_at();

insert into public.hotels (
  id,
  name,
  location,
  description,
  style,
  image_url,
  photo_credit,
  photo_license,
  photo_license_url,
  photo_source,
  highlights,
  nightly_rate,
  amenities
)
values
  (
    'azure-cove',
    'Azure Cove Retreat',
    'Sample stay · Lisbon, Portugal',
    'A breezy coastal hideaway inspired by tiled streets, long lunches, and Atlantic sunsets.',
    'coastal',
    'https://euccwinysxbwtbjwykkc.supabase.co/storage/v1/object/public/hotel-images/azure-cove.jpg',
    'Justin W Flory',
    'CC BY-SA 3.0',
    'https://creativecommons.org/licenses/by-sa/3.0/',
    'https://commons.wikimedia.org/wiki/File:Seaside_In_Dubrovnik_(208105323).jpeg',
    array['Ocean-inspired', 'Slow mornings'],
    229,
    array['Sea-view terrace', 'Outdoor pool', 'Breakfast concept', 'Complimentary Wi-Fi']
  ),
  (
    'alpine-hearth',
    'Alpine Hearth Lodge',
    'Sample stay · Innsbruck, Austria',
    'A warm mountain lodge concept with timber details and trails just beyond the door.',
    'alpine',
    'https://euccwinysxbwtbjwykkc.supabase.co/storage/v1/object/public/hotel-images/alpine-hearth.jpg',
    'Naturpuur',
    'CC BY-SA 4.0',
    'https://creativecommons.org/licenses/by-sa/4.0/',
    'https://commons.wikimedia.org/wiki/File:Alpine_Peaks_Hotel,_Turracher_H%C3%B6he,_Gde._Stadl-Predlitz,_Steiermark,_Austria_02.jpg',
    array['Mountain air', 'Made for unwinding'],
    198,
    array['Mountain views', 'Sauna', 'Trail access', 'Breakfast concept']
  ),
  (
    'maison-verdi',
    'Maison Verdi',
    'Sample stay · Florence, Italy',
    'An intimate city retreat imagined around garden courtyards and thoughtful design.',
    'garden',
    'https://euccwinysxbwtbjwykkc.supabase.co/storage/v1/object/public/hotel-images/maison-verdi.jpg',
    'jaycross',
    'CC BY 2.0',
    'https://creativecommons.org/licenses/by/2.0/',
    'https://commons.wikimedia.org/wiki/File:Villa_san_michele_fiesole_00.jpg',
    array['Courtyard calm', 'Design-led'],
    185,
    array['Garden courtyard', 'Lounge', 'Walkable location', 'Complimentary Wi-Fi']
  ),
  (
    'meridian-house',
    'Meridian House',
    'Sample stay · Copenhagen, Denmark',
    'A modern urban stay concept balancing Nordic simplicity with a lively neighborhood.',
    'city',
    'https://euccwinysxbwtbjwykkc.supabase.co/storage/v1/object/public/hotel-images/meridian-house.jpg',
    'Dietmar Rabich',
    'CC BY-SA 4.0',
    'https://creativecommons.org/licenses/by-sa/4.0/',
    'https://commons.wikimedia.org/wiki/File:Kopenhagen_(DK),_Copenhagen_Admiral_Hotel_--_2017_--_1712.jpg',
    array['City address', 'Nordic-inspired'],
    210,
    array['City-center setting', 'Restaurant concept', 'Fitness room', 'Complimentary Wi-Fi']
  ),
  (
    'caldera-lantern',
    'Caldera Lantern Retreat',
    'Sample stay · Perissa, Santorini, Greece',
    'A sunlit island escape concept with bright Cycladic architecture and a relaxed coastal rhythm.',
    'coastal',
    'https://euccwinysxbwtbjwykkc.supabase.co/storage/v1/object/public/hotel-images/santorini-cove.jpg',
    'Norbert Nagel',
    'CC BY-SA 3.0',
    'https://creativecommons.org/licenses/by-sa/3.0/',
    'https://commons.wikimedia.org/wiki/File:Hotel_Anastasia_Princess_-_Perissa_-_Santorini_-_Greece_-_01.jpg',
    array['Island light', 'By the Aegean'],
    170,
    array['Aegean views', 'Outdoor pool', 'Private balcony', 'Breakfast concept']
  ),
  (
    'golden-lane-house',
    'Golden Lane House',
    'Sample stay · Prague, Czech Republic',
    'A city-stay concept inspired by Prague''s historic lanes, warm stone, and evening strolls.',
    'city',
    'https://euccwinysxbwtbjwykkc.supabase.co/storage/v1/object/public/hotel-images/prague-golden-lane.jpg',
    'Estec Co.Ltd, Prague Hotel Operator',
    'CC BY 3.0',
    'https://creativecommons.org/licenses/by/3.0/',
    'https://commons.wikimedia.org/wiki/File:Prague_gold_alley.jpg',
    array['Old-town walks', 'City character'],
    155,
    array['Historic district', 'Courtyard lounge', 'Local dining nearby', 'Complimentary Wi-Fi']
  ),
  (
    'palma-verde',
    'Palma Verde Wellness',
    'Sample stay · Portals Nous, Mallorca, Spain',
    'A garden resort concept for slow afternoons, Mediterranean greenery, and a restorative stay.',
    'garden',
    'https://euccwinysxbwtbjwykkc.supabase.co/storage/v1/object/public/hotel-images/palma-garden.jpg',
    'Lindner Hotels AG',
    'CC BY-SA 3.0',
    'https://creativecommons.org/licenses/by-sa/3.0/',
    'https://commons.wikimedia.org/wiki/File:Lindner_Golf_%26_Wellness_Resort_Portals_Nous.jpg',
    array['Garden setting', 'Wellness-inspired'],
    190,
    array['Wellness area', 'Outdoor pool', 'Garden paths', 'Yoga studio']
  ),
  (
    'maison-mezzara',
    'Maison Mezzara',
    'Sample stay · Paris, France',
    'A Parisian city-stay concept inspired by expressive architecture and relaxed neighborhood walks.',
    'garden',
    'https://euccwinysxbwtbjwykkc.supabase.co/storage/v1/object/public/hotel-images/paris-mezzara.jpg',
    'Davitof',
    'CC BY-SA 3.0',
    'https://creativecommons.org/licenses/by-sa/3.0/',
    'https://commons.wikimedia.org/wiki/File:Paris_-_Hotel_Mezzara_(2).jpg',
    array['Parisian character', 'Art nouveau inspired'],
    225,
    array['Art Nouveau setting', 'Garden lounge', 'Walkable location', 'Complimentary Wi-Fi']
  )
on conflict (id) do nothing;

update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'hotel-images';

create policy "Admins can upload hotel card images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'hotel-images'
    and (select public.is_hotel_admin())
  );

create policy "Admins can update hotel card images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'hotel-images'
    and (select public.is_hotel_admin())
  )
  with check (
    bucket_id = 'hotel-images'
    and (select public.is_hotel_admin())
  );

create policy "Admins can delete hotel card images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'hotel-images'
    and (select public.is_hotel_admin())
  );
