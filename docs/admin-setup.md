# Hotel card administration setup

The homepage and hotel listings use rows from `public.hotels` when Supabase is configured. The admin dashboard and hotel catalog support creating and editing hotel profiles, deleting hotels, and uploading replacement images. Admin-only actions are visible only to signed-in users with an `admin` row in `public.user_roles`. Row Level Security and Storage policies enforce that role; hiding the buttons is not the authorization boundary. Room and reservation management screens remain deferred.

## Initial administrator

The initial administrator Auth account has been created in the connected `HotelReservations` project and granted the `admin` role. Do not put its password in source code, SQL migrations, or this guide. Change the initial password before production use.

Apply the committed migrations in timestamp order:

1. `20261108161827_create_guest_profiles.sql`
2. `20261108161856_create_admin_hotel_cards.sql`
3. `20261108162005_set_hotel_admin_check_invoker.sql`
4. `20261108183516_create_room_reservations.sql`
5. `20261109091149_list_available_rooms.sql`
6. `20261109091604_allow_self_profile_creation.sql`
7. `20261109092746_booking_flow.sql`
8. `20261109093003_retire_legacy_booking_rpc.sql`
9. `20261109103602_create_site_assets_bucket.sql`

The `set_hotel_admin_check_invoker` migration was renamed to match the verified remote version and SQL; it was not reapplied.
The `list_available_rooms` migration is applied to the connected project; its
timestamp matches the remote migration history.
The profile self-creation migration is also applied to the connected project.

The booking migrations are applied to the connected project. They retain the
existing `rooms` and `reservations` tables, add `room_types`, and use
`confirm_room_booking` for authenticated reservations. The function checks the
room type, capacity and quoted EUR rate, and the database rejects overlapping
confirmed stays. The legacy `book_room` RPC is no longer available to browser
clients. Guests can view only their own reservation details and cancel confirmed
stays until 24 hours before the check-in date begins in UTC.

The owner requested labelled development-only sample inventory. The optional
[`sample-room-inventory.sql`](../supabase/seeds/sample-room-inventory.sql) seed
is deliberately separate from migrations: run it only in a development project,
never automatically on production. It refuses to run if either inventory table
already contains records. Sample offers and their confirmed database records
are tests, not real stays; do not travel or pay for them.
The seed was run in the connected project at the owner's request: it created
two sample types and three sample rooms per existing hotel. It does not create
real inventory and its records are publicly offered by the availability RPC.
Deploy the updated frontend with its test-only warnings before inviting testers.

For real bookings, an authorized administrator must add real room types to
`public.room_types` and physical rooms to `public.rooms` in Supabase. Each room
needs an existing `hotel_id`, matching
`room_type_id`, a unique room number within the hotel, capacity, nightly EUR
rate, and `is_active` set to true. Older rooms without a type are preserved but
will not appear in the new booking flow until assigned a type. Only published
hotels and active room types and rooms are offered. Availability is rechecked
by the atomic booking operation, so a room can become unavailable between
search and confirmation. No payment is collected online.

To grant the role to another account, first register it through the site's registration page and complete any required email confirmation. Then run this statement in the Supabase SQL Editor while signed in as a project administrator, replacing the email with the registered account:

```sql
do $grant_hotel_admin$
declare
  target_user_id uuid;
begin
  select id
  into target_user_id
  from auth.users
  where lower(email) = lower('admin@example.com');

  if target_user_id is null then
    raise exception 'The requested Auth user does not exist in this project';
  end if;

  insert into public.user_roles (user_id, role)
  values (target_user_id, 'admin')
  on conflict (user_id, role) do nothing;
end
$grant_hotel_admin$;
```

Sign out and back in, then open the admin dashboard. The hotel catalog tools will be available after the app verifies the role. Guests and anonymous visitors can only read published hotels. Only admins can create, edit, or delete hotel records and upload images.

Uploaded images are limited to JPEG, PNG, and WebP files up to 5 MB in the public `hotel-images` bucket. Hotel card descriptions and rates may be illustrative; bookable prices come from room inventory, including explicitly labelled development samples if seeded.

The public `site-assets` bucket holds the site's gallery and hero photographs,
login background, and favicon. Its migration creates the bucket but does not
copy the image files: deploy the assets separately in each Supabase project.
The gallery and hero photographs originate from Unsplash; retain their source
attribution and ensure permission to redistribute them. The frontend uses the
configured Supabase URL for these assets, with existing local or external
fallbacks when configuration is absent. Uploading site assets requires a
trusted server-side credential; never expose it in the browser.
