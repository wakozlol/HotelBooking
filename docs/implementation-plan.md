# Hotel Booking Website Implementation Plan

## Product and architecture constraints

- **Frontend:** HTML, CSS, vanilla JavaScript ES modules, Bootstrap, and Vite. Do not use TypeScript or frontend frameworks.
- **Application shape:** a genuine multi-page application with separate HTML entry files and shared components, services, and utilities.
- **Backend:** Supabase Database, Auth, and Storage. Authorization and booking integrity must be enforced by database policies and operations, not only by the UI.
- **Hosting:** Render Static Site.
- **Booking:** one physical room per reservation; immediate confirmation only when an available physical room is assigned; prices in EUR; payment at the hotel.
- **Guest capabilities:** browse hotels, search availability, register, log in and out, view booking history, and cancel eligible reservations.
- **Admin capabilities:** manage hotels, room types, physical rooms, images, and reservations.
- **Security and operations:** never commit credentials or expose privileged keys in browser code. Keep SQL migrations committed and synchronized with verified remote migration history. Never invent credentials, project identifiers, or deployment URLs.
- **Quality:** safely render user content; build accessible, responsive interfaces; verify version-specific APIs against official documentation; report checks honestly.

## Milestones

Complete one milestone at a time. Do not begin a later milestone until it is in scope. Update this plan when implementation decisions or verified completion status change.

### 0. Workspace guidance and implementation plan

- Establish repository-specific working, security, and validation instructions.
- Record the agreed product scope, architecture constraints, milestones, and acceptance criteria.
- Do not implement application features in this milestone.
- **Acceptance:** `AGENTS.md` and this plan are consistent, committed, and no application features are implemented.
- **Status:** Complete.

### 1. Application foundation

- Establish or verify the Node.js/npm project and Vite configuration using JavaScript ES modules.
- Keep the home `index.html` in the project root and establish separate HTML entry files for the other public, guest, and admin routes, with page modules under `src/pages/`.
- Add only the shared structure and assets needed to build and load the multi-page application; do not implement later milestone behavior.
- Document required local configuration with placeholders only.
- **Acceptance:** dependencies install reproducibly, the production build emits the root home page and every configured route, every page loads its shared assets through the appropriate shared layout, and the root home page remains visible when opened directly without Vite.
- **Status:** Complete. Vite builds the root home page and 14 multi-page routes. Development routes, shared public/auth/admin layouts, generated assets, and the direct-file home fallback were smoke-tested.

### 2. Guest authentication (approved fast-track)

- Implement registration, login, logout, and authenticated page state using Supabase Auth in the existing MPA.
- Create the guest `profiles` table linked to `auth.users`, with own-row RLS, restricted column grants, and signup profile creation.
- Protect account and booking-related routes with server-verified user checks; use RLS as the data authorization boundary.
- Configure the browser client only with the public Supabase URL and publishable/anon key; never put privileged keys in `VITE_` variables.
- **Acceptance:** responsive auth forms validate input, handle confirmation and failures safely, sessions persist across pages, profiles can be loaded/updated, and unauthenticated protected routes redirect to login.
- **Sequence decision:** the owner approved moving this milestone ahead of the broader hotel/room/reservation schema, shared browse services, and public browsing. The connected `HotelReservations` project was inspected: `public` has no tables, its migration history is empty, and there are no custom `auth.users` triggers. The profile migration is committed but must be reviewed and run in the Supabase SQL Editor. Actual auth/profile/RLS tests remain pending local public-key configuration and applying that migration.
- **Status:** The responsive sign-in and registration forms, password recovery, frontend validation, session-aware navigation, logout, and Supabase Auth service flows are implemented. The optional signup phone is stored as Auth user metadata; the existing `profiles` table stores only first and last names. Profile migrations are installed on the connected project, and rollback-based database checks verify profile ownership and signup creation. End-to-end email-confirmation and remember-me persistence checks remain pending.
- **Existing-account decision:** the owner requested self-service profile creation for existing Auth users whose profiles are missing. Authenticated users can create only their own profile and supply their names themselves; signup still creates profiles for new users.

### 3. Supabase data model, policies, and migrations

- Design and commit migrations for hotels, room types, physical rooms, reservations, and required supporting records.
- Define roles, constraints, indexes, and Row Level Security policies for guest and admin access.
- Provide a database-enforced atomic reservation operation that assigns at most one available physical room and prevents overlapping active reservations.
- Document a migration workflow that checks remote history before applying changes.
- **Acceptance:** migrations apply in a clean local or test database; authorization, reservation integrity, and concurrent booking tests reject unauthorized access and double-booking. Apply remotely only when real credentials and migration history are available and verified.
- **Fast-track decision:** the owner approved the hotel-card administration slice of this milestone. The committed card-management migration creates `hotels` and non-self-assignable `user_roles` tables, row-level authorization, upload policies, and illustrative card records. Room types, physical rooms, reservations, and atomic booking remain deferred to their planned milestones.
- **Status:** The guest-profile, hotel-card, and physical-room/reservation migrations are applied to the verified project. Migration timestamps match verified remote history. The `rooms` and `reservations` tables are empty; the atomic `book_room` operation and overlapping-stay constraint were tested locally. Room types and application booking workflows remain deferred.

### 4. Shared UI and Supabase client services

- Implement accessible, responsive shared navigation, layout, form, feedback, and error-handling patterns.
- Configure the browser Supabase client to accept only the required public project URL and publishable/anon key; rely on database and storage policies for access control.
- **Acceptance:** shared components work across separate pages, configuration errors are clear, and no privileged key is present in browser assets.

### 5. Public hotel browsing and availability search

- Display public hotel and room-type information and support searching by the agreed stay details and guest criteria.
- Show availability and prices in EUR without suggesting payment is collected online.
- **Acceptance:** search results match database availability for the selected criteria; forms and results are keyboard-accessible and responsive.
- **Fast-track decision:** the owner approved an illustrative, sample-only hotel showcase before the hotel schema milestone is complete. The homepage carousel and hotel cards are clearly labeled as samples and do not claim live inventory or availability. Replace the sample data with Supabase-backed listings after the data model and policies are implemented.
- **Status:** Hotel cards load published rows from Supabase when configured, with the illustrative sample fallback retained when configuration is absent. Availability search and live inventory remain deferred.
- **Fast-track decision:** the owner approved a preview-only date and guest selector in the hotel details popup. It does not check availability or create reservations.

### 6. Reservations, booking history, and cancellation

- Let an authenticated guest reserve exactly one physical room through the atomic database operation.
- Confirm immediately only when the operation successfully assigns available inventory; show EUR pricing and payment-at-hotel terms.
- Show the guest's own reservation history and enforce cancellation eligibility in the database.
- **Acceptance:** successful bookings have one room and an immediate confirmation; concurrent attempts cannot book the same room; ineligible cancellations and unauthorized history access are rejected.
- **Fast-track decision:** the owner requested connecting the hotel details Book button to real reservations and chose to leave physical-room inventory empty. The existing reservation table and atomic booking operation are reused; booking history, cancellation, and room administration remain out of scope for this slice.
- **Status:** Booking review, room-type availability, an idempotent atomic confirmation RPC, guest reservation history, and cancellation are implemented. The related migrations are applied to the connected project. The connected project contains labelled sample inventory for each hotel, and rollback-based database checks verified booking and overlapping-stay rejection against it. A complete signed-in browser booking remains to be verified.
- **Owner-requested expansion:** Implement room types, availability, sign-in continuation, booking review, guest history and cancellation. The owner selected a cancellation cutoff 24 hours before the check-in date begins (UTC), asked to preserve existing rooms, and approved test data. The owner subsequently requested explicitly labelled development-only sample inventory in the empty existing tables; these samples are not real stays.

### 7. Admin management

- Implement authorized admin workflows for hotels, room types, physical rooms, image uploads, and reservations.
- Enforce admin-only operations through database policies and Supabase Storage policies; safely render user-managed text and images.
- **Acceptance:** authorized administrators can manage in-scope records, guests cannot perform admin operations, and image access follows the intended policy.
- **Fast-track decision:** the owner approved hotel-card edit, delete, and image upload controls on the homepage and hotel listings. Room, reservation, and other administrative workflows remain deferred.
- **Status:** The initial administrator account is registered in the connected Supabase project. The styled, responsive admin dashboard and Supabase-backed hotel create/edit/delete/image workflows are available to verified admins; database and storage policies remain the authorization boundary. Room and reservation administration remain deferred.

### 8. Production deployment and release checks

- Configure Render Static Site build and publish settings from the verified project setup.
- Verify public page routing, production assets, Supabase connectivity, browser security, and build output.
- Document actual deployment configuration without inventing URLs or credentials.
- **Acceptance:** the production build and configured deployment succeed, all pages work at their deployed paths, and no privileged credential is shipped to the browser.

## Completion workflow

For each milestone, inspect the current workspace and Git status, implement only the milestone's changes, run the relevant checks and build when available, and review the diff. Commit only that milestone's changes and push to the configured remote if available. Report checks, commit, and push status truthfully. Never force-push or rewrite Git history.
