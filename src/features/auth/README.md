# Guest authentication

The login, registration, and account entry modules under `src/pages/` compose the forms and profile view in this feature. Auth API calls are centralized in `src/services/auth-service.js`; profile reads and updates use `src/services/profile-service.js`; `src/utils/auth-guard.js` protects guest-only and authenticated routes.

Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` plus either `VITE_SUPABASE_PUBLISHABLE_KEY` or the legacy `VITE_SUPABASE_ANON_KEY` from the Supabase project's API settings. A publishable/anon key is intended for browser use; never use a service-role or secret key in a `VITE_` variable. Restart Vite after changing `.env`.

Before using registration or account management, review and execute `supabase/migrations/20261107203000_create_guest_profiles.sql` in the Supabase SQL Editor. The migration links profiles to `auth.users`, creates the profile from whitelisted signup metadata, and limits profile reads/updates with grants and RLS. Check the project's Auth URL configuration and allow the local Vite origin's `/account/` confirmation redirect and the actual production origin before testing email confirmation.

Start the app with `npm run dev`. The direct-file and plain Live Server fallback is a static preview and cannot load the Vite-bundled Supabase SDK or provide authentication.
