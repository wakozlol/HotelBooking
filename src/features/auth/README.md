# Guest authentication

The login, registration, and account entry modules under `src/pages/` compose the forms and profile view in this feature. Auth API calls are centralized in `src/services/auth-service.js`; profile reads and updates use `src/services/profile-service.js`; `src/utils/auth-guard.js` protects guest-only and authenticated routes.

The shared public header opens reusable login and registration modals; the standalone login and registration routes remain available. The login modal also sends password recovery email to `/reset-password/`, where a valid recovery session can choose a new password.

Copy the project-root `.env.example` to the project-root `.env` (beside `package.json`) and replace its example values with your Supabase project URL and publishable key from the project's API settings. For a legacy anon key, comment out `VITE_SUPABASE_PUBLISHABLE_KEY` and set `VITE_SUPABASE_ANON_KEY` instead. A publishable/anon key is intended for browser use; never use a service-role or secret key in a `VITE_` variable. Restart Vite after changing `.env`.

Before using registration or account management, review and execute `supabase/migrations/20261107203000_create_guest_profiles.sql` in the Supabase SQL Editor. The migration links profiles to `auth.users`, creates the profile from whitelisted signup metadata, and limits profile reads/updates with grants and RLS. In Supabase Auth URL configuration, allow the local Vite origin's `/account/` confirmation redirect and `/reset-password/` recovery redirect, plus the equivalent paths on the actual production origin.

Start the app with `npm run dev`. The direct-file and plain Live Server fallback is a static preview and cannot load the Vite-bundled Supabase SDK or provide authentication.
