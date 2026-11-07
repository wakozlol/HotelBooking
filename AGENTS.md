# Hotel Booking Workspace Instructions

## Product and technical scope

- Build a hotel-booking website with HTML, CSS, vanilla JavaScript ES modules, Bootstrap, Node.js, npm, and Vite.
- Use Supabase for the database, authentication, and image storage. Deploy the static site to Render.
- Do not introduce TypeScript, React, Vue, or another frontend framework.
- Build a genuine multi-page application with separate HTML entry files and shared components, services, and utilities.
- Support public hotel browsing and availability search; guest registration, login, and logout; one physical room per reservation; immediate confirmation only when inventory is available; EUR pricing and payment at the hotel; guest booking history and eligible cancellation; and admin management of hotels, room types, physical rooms, images, and reservations.

## Implementation rules

- Implement only the current milestone in `docs/implementation-plan.md`. The plan is a roadmap, not permission to implement future milestones.
- Inspect the current workspace and Git status before editing. Preserve working code and unrelated user changes.
- Keep changes focused, accessible, and responsive, and follow existing project conventions.
- Render user-supplied content safely; do not treat untrusted content as executable HTML.
- Never invent credentials, project identifiers, or deployment URLs. Ask the owner for real configuration when needed.
- Never expose Supabase service-role keys, database passwords, or other privileged credentials in browser code or committed files. Browser operations must use only appropriately restricted public credentials and rely on database and storage policies for authorization.
- Enforce authorization and booking integrity in the database, not only in the browser. A reservation must assign at most one eligible physical room, prevent overlapping active reservations, and be confirmed immediately only after an available room is assigned.
- Keep SQL migrations committed and authoritative. Inspect remote migration history and reconcile it with committed migrations before applying changes to a remote Supabase project. Do not reset or overwrite remote data to resolve drift without explicit approval.
- Verify version-specific APIs against official documentation and the versions declared in project manifests.
- Run the smallest relevant checks and the build when available. Report results and unrun checks accurately.

## Milestone workflow

After each successful milestone, review the diff, commit only that milestone's changes, and push to the configured remote if available. Never force-push, backdate commits, or manufacture Git history. Do not include unrelated changes in a milestone commit.
