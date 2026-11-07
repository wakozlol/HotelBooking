# Hotel Booking Workspace Instructions

## Project scope and stack

- Build a hotel-booking website using HTML, CSS, vanilla JavaScript ES modules, Bootstrap, Node.js, npm, and Vite.
- Use Supabase for the database, authentication, and image storage. Deploy the static site to Render.
- Do not introduce TypeScript, React, Vue, or another frontend framework.
- Build a genuine multi-page application with separate HTML entry files, and share common components, services, and utilities where appropriate.
- The product scope is public hotel browsing and availability search; guest registration, login, and logout; booking one physical room per reservation with immediate confirmation when inventory is available; EUR prices and payment at the hotel; guest booking history and eligible cancellation; and admin management of hotels, room types, physical rooms, images, and reservations.

## Working practices

- Inspect relevant files, project conventions, and the current Git status before changing anything. Preserve working code and unrelated user changes.
- Implement only the current, explicitly requested milestone. Use `docs/implementation-plan.md` as the roadmap, not as permission to implement future milestones.
- Make focused, complete changes. Follow existing patterns and prefer accessible, responsive interfaces.
- Render user-supplied content safely. Do not insert untrusted content as executable HTML.
- Never invent credentials, project identifiers, or deployment URLs. Ask the user when required configuration is missing.
- Never expose Supabase service-role keys, database passwords, or other privileged credentials in browser code or committed files. Browser operations must rely on appropriately restricted public credentials and database/storage policies.
- Enforce authorization and booking integrity in the database, not only in browser code. Design reservation creation to prevent double-booking and to confirm immediately only when an eligible physical room is actually available.
- Keep SQL migrations committed and authoritative. Before applying migrations to a remote Supabase project, inspect its migration history and keep local and remote histories synchronized; do not reset or overwrite remote data to resolve drift without explicit approval.
- Verify version-specific APIs against official documentation when using them, and follow the versions recorded in the project's dependency manifests.
- Add or update focused tests for behavior changes when practical. Run the smallest relevant checks and the build when available; report failures and unrun checks accurately.
- After each successful milestone, review the diff, commit only that milestone's changes, and push to the configured remote if it is available. Never force-push, backdate commits, or manufacture Git history. Do not include unrelated changes in a milestone commit.

## Current project status

- This repository is being initialized. Confirm the files, dependencies, configuration, and completed milestone status in the workspace before assuming an application feature exists.
