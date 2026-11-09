# Guest authentication

The login, registration, and account entry modules under `src/pages/` compose the forms and profile view in this feature. Auth API calls are centralized in `src/services/auth-service.js`; profile reads and updates use `src/services/profile-service.js`; `src/utils/auth-guard.js` protects guest-only and authenticated routes.

The public header's Login and Register links open their dedicated `/login/` and `/register/` pages. Both pages use the same premium hotel-lounge presentation as the previous authentication modals. The login page can send password recovery email to `/reset-password/`, where a valid recovery session can choose a new password.

Copy the project-root `.env.example` to the project-root `.env` (beside `package.json`) and replace its example values with your Supabase project URL and publishable key from the project's API settings. For a legacy anon key, comment out `VITE_SUPABASE_PUBLISHABLE_KEY` and set `VITE_SUPABASE_ANON_KEY` instead. A publishable/anon key is intended for browser use; never use a service-role or secret key in a `VITE_` variable. Restart Vite after changing `.env`.

Apply the committed Supabase migrations in order. The profile migration links profiles to `auth.users`, creates profiles from signup metadata, and limits profile access with grants and RLS. Existing authenticated users without a profile can provide their names on `/account/` to create their own profile; they cannot create or edit another user's profile. In Supabase Auth URL configuration, allow the local Vite origin's `/account/` confirmation redirect and `/reset-password/` recovery redirect, plus the equivalent paths on the actual production origin.

Start the app with `npm run dev`. The direct-file and plain Live Server fallback is a static preview and cannot load the Vite-bundled Supabase SDK or provide authentication.

For Netlify, deploy the repository and branch containing `netlify.toml`, using
`npm run build` and `dist`. Set `VITE_SUPABASE_URL` and
`VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`) in the site's
Netlify build environment and redeploy after changing them. Do not configure a
service-role key as a Vite variable. The production `/account/` and
`/reset-password/` URLs must be allowed in Supabase Auth URL Configuration.
