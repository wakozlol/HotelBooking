# Hotel Booking Workspace Instructions

## Product and technical scope

- Build a modern, responsive hotel-booking website with HTML5, CSS3, vanilla JavaScript ES modules, Bootstrap 5.3.8, Node.js, npm, and Vite 7.
- Use Supabase for the database, authentication, and image storage. Deploy the static site to Render.
- Do not introduce TypeScript, React, Vue, or another frontend framework.
- Build a genuine multi-page application with separate HTML entry files and shared components, services, and utilities.
- Support public hotel browsing and availability search; hotel details; guest registration, login, logout, session persistence, and password reset; one physical room per reservation; immediate confirmation only when inventory is available; EUR pricing and payment at the hotel; guest booking history and eligible cancellation; and admin management of hotels, room types, physical rooms, images, and reservations.

## Implementation rules

- Implement only the current milestone in `docs/implementation-plan.md`. The plan is a roadmap, not permission to implement future milestones.
- Inspect the relevant project files, structure, and Git status before editing. Preserve working code and unrelated user changes.
- Follow the existing project architecture and conventions. Reuse existing components, services, and utilities; avoid duplicate functionality and broad reorganizations.
- Keep changes focused, accessible, responsive, and consistent with the existing premium hotel design and Bootstrap styling. Do not redesign unrelated pages or remove features without permission.
- Keep responsibilities separated across pages, components, services, utilities, and styles. Use ES modules, `const`/`let`, focused functions, and `async`/`await`.
- Validate form input, provide clear validation and loading/success/error feedback, and ensure all interactive elements work with keyboard navigation.
- Render user-supplied content safely; do not treat untrusted content as executable HTML.
- Never invent credentials, project identifiers, or deployment URLs. Ask the owner for real configuration when needed.
- Never expose Supabase service-role keys, database passwords, or other privileged credentials in browser code or committed files. Browser operations must use only appropriately restricted public credentials and rely on database and storage policies for authorization.
- Read Supabase configuration from Vite using `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`. Preserve `VITE_SUPABASE_ANON_KEY` compatibility where the existing client supports it. Never hardcode credentials; show a clear, helpful message when configuration is missing.
- Use the existing Supabase client and authentication services for registration, login, logout, session state, and password reset. Respect Row Level Security and do not manually store passwords or bypass database permissions.
- Never create database tables or columns without checking the existing schema. Inspect remote migration history and committed migrations before applying database changes.
- Enforce authorization and booking integrity in the database, not only in the browser. A reservation must assign at most one eligible physical room, prevent overlapping active reservations, and be confirmed immediately only after an available room is assigned.
- Keep SQL migrations committed and authoritative. Inspect remote migration history and reconcile it with committed migrations before applying changes to a remote Supabase project. Do not reset or overwrite remote data to resolve drift without explicit approval.
- Verify version-specific APIs against official documentation and the versions declared in project manifests.
- Use Vite for development; do not rely on VS Code Live Server. Run the smallest relevant checks and `npm run build` when available. Report results and unrun checks accurately.

## Milestone workflow

After each successful milestone, review the diff, commit only that milestone's changes, and push to the configured remote if available. Never force-push, backdate commits, or manufacture Git history. Do not include unrelated changes in a milestone commit. Explain which files changed and why, and report any remaining errors or configuration steps honestly.
