# Hotel Booking Website Implementation Plan

## Product and architecture constraints

- Frontend: HTML, CSS, vanilla JavaScript ES modules, Bootstrap, and Vite; no TypeScript or frontend frameworks.
- Application shape: separate HTML entry files for real, independently addressable pages, with shared components, services, and utilities.
- Backend services: Supabase Database, Auth, and Storage. Authorization and booking integrity must be enforced by database policies and operations, not just by the UI.
- Hosting: Render Static Site.
- Booking rules: one physical room per reservation; immediately confirm a reservation only when a physical room is available; prices are in EUR; guests pay at the hotel.
- User capabilities: browse hotels, search availability, register, log in/out, view booking history, and cancel eligible reservations.
- Admin capabilities: manage hotels, room types, physical rooms, images, and reservations.
- Do not commit credentials or expose privileged keys in browser code. Obtain real project configuration from the owner; never invent credentials, project identifiers, or deployment URLs.
- Keep Supabase SQL migrations committed and synchronized with remote migration history.

## Milestones

Complete and validate one milestone at a time. Do not begin a later milestone until it is explicitly in scope. Update this plan when implementation decisions or verified completion status change.

### 0. Workspace guidance and implementation plan

- Establish repository-specific working and security instructions.
- Record the agreed product scope, architecture constraints, and sequenced milestones.
- **Acceptance:** guidance is consistent, the plan is committed, and no application features have been implemented.

### 1. Application foundation

- Establish the Node.js/npm project and Vite configuration using JavaScript ES modules.
- Define separate HTML entry files and build configuration for the required public, guest, and admin areas, including `/booking/` for the specified booking URL.
- Add the shared CSS/Bootstrap and JavaScript structure needed by the pages without implementing future product behavior.
- Document required local configuration using placeholders only; do not add real credentials.
- **Acceptance:** dependencies install reproducibly, the production build emits each configured page, and the pages load their shared assets.
- **Status:** Complete. Vite 7.3.7 builds all 15 HTML entries, and production preview returned HTTP 200 for every page and its built assets, including nested pages with query parameters.

### 2. Supabase data model, policies, and migrations

- Design and commit migrations for hotels, room types, physical rooms, reservations, and any required supporting records.
- Define roles, constraints, indexes, and Row Level Security policies for guest and admin access.
- Define a database-enforced atomic reservation operation that assigns at most one available physical room and prevents overlapping active reservations.
- Establish and document a migration workflow that checks remote history before applying changes.
- **Acceptance:** migrations apply in a clean local/test database; policy and concurrency/integrity tests show unauthorized access and double-booking are rejected. Apply to a remote project only when its real credentials and migration history are available and verified.

### 3. Shared UI and Supabase client services

- Implement accessible, responsive shared navigation, layout, form, feedback, and error-handling patterns.
- Configure the browser Supabase client to accept only the required public project URL and publishable/anon key; rely on database policies for access control.
- **Acceptance:** shared components work across the separate pages, configuration errors are clear, and no privileged key is present in browser assets.

### 4. Public hotel browsing and availability search

- Display public hotel and room-type information and support searching by the agreed stay details and guest criteria.
- Show availability and prices in EUR without suggesting payment is collected online.
- **Acceptance:** search results match database availability for the selected criteria; forms and results are keyboard accessible and responsive.

### 5. Guest authentication

- Implement registration, login, logout, and authenticated page state using Supabase Auth.
- Provide clear loading, validation, and failure states without exposing sensitive data.
- **Acceptance:** guest sessions work across the pages and guests cannot access another user's protected data.

### 6. Reservations, booking history, and cancellation

- Let an authenticated guest reserve exactly one physical room through the atomic database operation.
- Confirm immediately only when the operation successfully assigns available inventory; show EUR pricing and payment-at-hotel terms.
- Show the guest's own reservation history and enforce eligibility rules for cancellations in the database.
- **Acceptance:** successful bookings have one room and an immediate confirmation; concurrent attempts cannot book the same room; ineligible cancellations and unauthorized history access are rejected.

### 7. Admin management

- Implement authorized admin workflows for hotels, room types, physical rooms, image uploads, and reservations.
- Enforce admin-only operations through database policies and Supabase Storage policies; safely render user-managed text and images.
- **Acceptance:** authorized administrators can manage in-scope records, guests cannot perform admin operations, and image access follows the intended policy.

### 8. Production deployment and release checks

- Configure the Render Static Site build and publish settings from the verified project setup.
- Verify public page routing, production assets, Supabase connectivity, browser security, and build output.
- Document the actual deployment configuration without inventing URLs or credentials.
- **Acceptance:** the production build and configured deployment succeed, all pages work at their deployed paths, and no privileged credential is shipped to the browser.

## Milestone completion workflow

For each milestone, inspect the current workspace and Git status, implement only the milestone's changes, run the relevant checks and build when available, and review the diff. Commit only those milestone changes and push to the configured remote if it is available. Report the checks, commit, and push status truthfully. Never force-push or rewrite history.
