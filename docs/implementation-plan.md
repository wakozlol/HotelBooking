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
- **Status:** Implementation is ready for project configuration. Full Supabase auth, profile, email-confirmation, and RLS acceptance checks are pending until the migration is run and local public credentials are configured.

### 3. Supabase data model, policies, and migrations

- Design and commit migrations for hotels, room types, physical rooms, reservations, and required supporting records.
- Define roles, constraints, indexes, and Row Level Security policies for guest and admin access.
- Provide a database-enforced atomic reservation operation that assigns at most one available physical room and prevents overlapping active reservations.
- Document a migration workflow that checks remote history before applying changes.
- **Acceptance:** migrations apply in a clean local or test database; authorization, reservation integrity, and concurrent booking tests reject unauthorized access and double-booking. Apply remotely only when real credentials and migration history are available and verified.

### 4. Shared UI and Supabase client services

- Implement accessible, responsive shared navigation, layout, form, feedback, and error-handling patterns.
- Configure the browser Supabase client to accept only the required public project URL and publishable/anon key; rely on database and storage policies for access control.
- **Acceptance:** shared components work across separate pages, configuration errors are clear, and no privileged key is present in browser assets.

### 5. Public hotel browsing and availability search

- Display public hotel and room-type information and support searching by the agreed stay details and guest criteria.
- Show availability and prices in EUR without suggesting payment is collected online.
- **Acceptance:** search results match database availability for the selected criteria; forms and results are keyboard-accessible and responsive.

### 6. Reservations, booking history, and cancellation

- Let an authenticated guest reserve exactly one physical room through the atomic database operation.
- Confirm immediately only when the operation successfully assigns available inventory; show EUR pricing and payment-at-hotel terms.
- Show the guest's own reservation history and enforce cancellation eligibility in the database.
- **Acceptance:** successful bookings have one room and an immediate confirmation; concurrent attempts cannot book the same room; ineligible cancellations and unauthorized history access are rejected.

### 7. Admin management

- Implement authorized admin workflows for hotels, room types, physical rooms, image uploads, and reservations.
- Enforce admin-only operations through database policies and Supabase Storage policies; safely render user-managed text and images.
- **Acceptance:** authorized administrators can manage in-scope records, guests cannot perform admin operations, and image access follows the intended policy.

### 8. Production deployment and release checks

- Configure Render Static Site build and publish settings from the verified project setup.
- Verify public page routing, production assets, Supabase connectivity, browser security, and build output.
- Document actual deployment configuration without inventing URLs or credentials.
- **Acceptance:** the production build and configured deployment succeed, all pages work at their deployed paths, and no privileged credential is shipped to the browser.

## Completion workflow

For each milestone, inspect the current workspace and Git status, implement only the milestone's changes, run the relevant checks and build when available, and review the diff. Commit only that milestone's changes and push to the configured remote if available. Report checks, commit, and push status truthfully. Never force-push or rewrite Git history.
