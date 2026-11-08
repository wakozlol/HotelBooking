# Hotel card administration setup

The homepage and hotel listings use rows from `public.hotels` when Supabase is configured. Admin-only card actions are visible only to signed-in users with an `admin` row in `public.user_roles`. Row Level Security and Storage policies enforce that role; hiding the buttons is not the authorization boundary.

## Initial administrator

The connected `HotelReservations` project did not contain the requested Auth user when checked. Create the account through the site's registration page after the guest profile migration is installed, and complete any required email confirmation. Do not put the password in source code, SQL migrations, or this guide.

Apply the committed migrations in timestamp order:

1. `20261108161827_create_guest_profiles.sql`
2. `20261108161856_create_admin_hotel_cards.sql`
3. `20261108181932_set_hotel_admin_check_invoker.sql`

After the Auth user exists in the same Supabase project as the site, run this statement in the Supabase SQL Editor while signed in as a project administrator:

```sql
do $grant_hotel_admin$
declare
  target_user_id uuid;
begin
  select id
  into target_user_id
  from auth.users
  where lower(email) = lower('koceto@gmail.com');

  if target_user_id is null then
    raise exception 'The requested Auth user does not exist in this project';
  end if;

  insert into public.user_roles (user_id, role)
  values (target_user_id, 'admin')
  on conflict (user_id, role) do nothing;
end
$grant_hotel_admin$;
```

Sign out and back in, then open the homepage. The card actions will be available after the app verifies the role. Guests and anonymous visitors can only read published hotels. Only admins can edit or delete hotel records and upload images.

Uploaded images are limited to JPEG, PNG, and WebP files up to 5 MB in the public `hotel-images` bucket. Hotel descriptions, prices, and availability remain illustrative and are not bookable inventory.
