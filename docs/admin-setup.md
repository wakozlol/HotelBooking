# Hotel card administration setup

The homepage and hotel listings use rows from `public.hotels` when Supabase is configured. The admin dashboard and hotel catalog support creating and editing hotel profiles, deleting hotels, and uploading replacement images. Admin-only actions are visible only to signed-in users with an `admin` row in `public.user_roles`. Row Level Security and Storage policies enforce that role; hiding the buttons is not the authorization boundary. Room and reservation management remain deferred until their schemas and workflows are implemented.

## Initial administrator

The initial administrator Auth account has been created in the connected `HotelReservations` project and granted the `admin` role. Do not put its password in source code, SQL migrations, or this guide. Change the initial password before production use.

Apply the committed migrations in timestamp order:

1. `20261108161827_create_guest_profiles.sql`
2. `20261108161856_create_admin_hotel_cards.sql`
3. `20261108162005_set_hotel_admin_check_invoker.sql`
4. `20261108183516_create_room_reservations.sql`

The `set_hotel_admin_check_invoker` migration was renamed to match the verified remote version and SQL; it was not reapplied.

The room and reservation migration has been applied to the connected project. It
creates empty `rooms` and `reservations` tables, restricts guest reservations
to their owner and admins, and requires authenticated bookings to use `book_room`.
The function checks room capacity and the expected EUR rate, and the database
rejects overlapping confirmed stays. Room records must contain real inventory
and prices; the illustrative hotel rates are not used. Room management, room
selection, booking UI, and cancellation are not implemented yet.

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

Uploaded images are limited to JPEG, PNG, and WebP files up to 5 MB in the public `hotel-images` bucket. Hotel descriptions, prices, and availability remain illustrative and are not bookable inventory.
