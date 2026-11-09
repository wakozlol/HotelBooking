# Application Architecture

## Context

The application uses a root `index.html` for the home entry and independent HTML entries under `pages/` for the other routes. Page-level vanilla JavaScript ES modules live under `src/pages/`, and Vite builds these as multiple entries. Bootstrap supplies the UI toolkit, and Supabase provides authentication and the database. Keep this a multi-page application: do not introduce a client-side SPA router or a frontend framework.

The previously deleted route HTML, page modules, shared shell, and Vite configuration have been restored from the committed baseline with owner approval. Other unrelated pre-existing deletions remain untouched.

## Folder tree

```text
.
├── docs/
│   ├── architecture/
│   │   └── README.md
│   └── implementation-plan.md
├── index.html                          # Root home document and app entry
├── public/
│   └── favicon.svg
├── pages/                              # Separate Vite HTML entry files
│   ├── hotels/index.html
│   ├── hotel/index.html
│   ├── login/index.html
│   ├── register/index.html
│   ├── account/index.html
│   └── admin/...
├── src/
│   ├── app/
│   │   ├── App.js
│   │   ├── routes/
│   │   ├── providers/
│   │   └── layouts/
│   │       ├── MainLayout.js / .css
│   │       ├── AuthLayout.js / .css
│   │       ├── AdminLayout.js / .css
│   │       └── PageContent.js
│   ├── pages/                          # Thin page entry modules
│   ├── features/
│   │   ├── auth/                       # Forms, account view, and auth styling
│   │   ├── hotels/
│   │   ├── rooms/
│   │   ├── bookings/
│   │   ├── payments/
│   │   ├── users/
│   │   └── admin/
│   ├── components/
│   │   ├── Header/
│   │   │   ├── Header.js
│   │   │   └── Header.css
│   │   ├── Footer/
│   │   │   ├── Footer.js
│   │   │   └── Footer.css
│   │   ├── ui/
│   │   ├── common/
│   │   └── forms/
│   ├── services/
│   ├── hooks/
│   ├── store/
│   ├── utils/
│   ├── types/                          # JSDoc contracts; no TypeScript
│   ├── constants/
│   ├── assets/
│   ├── styles/                         # Global CSS, tokens, and Bootstrap overrides
│   └── config/
├── supabase/
│   └── migrations/                     # Versioned schema and policy changes
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/
├── .env.example
├── package.json
└── vite.config.js
```

The root `index.html` loads `src/main.js` through Vite, which initializes global styles and calls `src/app/App.js`. `App.js` renders the home page and selects a shared layout for page modules. Other HTML documents remain separate Vite entries under `pages/`; a small Vite mapping preserves their root-level public URLs without client-side routing. `src/pages/` provides each document's JavaScript composition module. A classic-script fallback renders static page content when opened directly or served by a plain static server such as VS Code Live Server. Supabase-backed behavior and full application modules require Vite (`npm run dev`).

## Local Supabase setup

Copy `.env.example` to `.env`, set the Supabase project URL and publishable key (or legacy anon key), and restart Vite. Add the local Vite origin's `/account/` path and the actual deployed origin to Supabase Auth's allowed redirect URLs for email confirmation. Never place a service-role/secret key in `.env` under a `VITE_` name. Review the committed profile migration and run it in the Supabase SQL Editor before using registration or profile management. Authentication and profile operations are unavailable in the plain-file/Live Server fallback.

## Responsibilities

- **`index.html` and `pages/`:** The root document is the home page; separate files in `pages/` are the other public, guest, and admin documents. Each loads its page module and shared styles.
- **`src/pages/`:** Thin page composition modules. They select features and layouts, and should not own database policy or booking integrity.
- **`src/app/routes/`:** Route/entry documentation and metadata where useful. In an MPA this is a build-time/document map, not a runtime SPA router.
- **`src/app/providers/`:** Small application startup and dependency initialization modules. No React context/provider convention is implied.
- **`src/app/layouts/`:** Public, auth, and admin page shells. `MainLayout` composes the reusable header and footer; auth/admin shells use their own navigation framing.
- **`src/features/`:** Business capabilities and their feature-specific UI, validation, and operations. Keep related behavior cohesive within a feature.
- **`src/components/`:** Reusable presentation. `Header/` and `Footer/` are shared site components; `ui/` contains generic controls, `common/` contains shared site pieces, and `forms/` contains reusable accessible form elements.
- **`src/services/`:** The browser Supabase client and shared Auth operations. Profile queries live in `profile-service.js`; keep feature-specific data access here only when shared.
- **`src/hooks/`:** Reusable vanilla JavaScript lifecycle/DOM or async helpers only when they simplify multiple consumers. This name does not imply React hooks.
- **`src/store/`:** Shared in-memory state only when multiple modules need it. Multi-page navigation reloads documents; use Supabase Auth/session mechanisms rather than treating this as a persistent SPA store.
- **`src/utils/`, `src/constants/`, `src/config/`:** Small domain-neutral helpers, stable shared values, and validated environment/application configuration, respectively.
- **`src/types/`:** Optional JSDoc typedefs for shared data contracts. Do not add TypeScript.
- **`src/assets/`:** Local static images, icons, fonts, and other bundled assets. User-managed hotel images belong in Supabase Storage, not source control.
- **`src/styles/`:** Shared CSS and Bootstrap overrides, preserving the existing stylesheet convention.
- **`supabase/migrations/`:** Versioned SQL schema, constraints, Row Level Security policies, and atomic database operations. Check remote migration history before applying. The guest profile migration is `20261107203000_create_guest_profiles.sql`; review it and execute it in the Supabase SQL Editor before using signup or profile management.
- **`tests/`:** Unit, database/integration, and browser/end-to-end tests, added with tooling when an implementation milestone needs them.
- **`scripts/`:** Small repeatable development or migration-support commands; never store credentials here.

## Feature boundaries and communication

The normal dependency direction is:

```text
HTML document -> src/main.js -> App/page module -> layout/shared UI + feature -> service -> Supabase
                                                               |
                                                               v
                                                 database/storage policies
```

Page modules assemble UI; features coordinate their own presentation and operations; shared services isolate external clients. Database policies and SQL operations remain authoritative for permissions and booking concurrency. Avoid imports from one feature's internals into another; extract genuinely shared behavior into a neutral module.

Feature responsibilities:

- **`auth/`:** registration, login, logout, password recovery/reset, session-facing behavior, and role-aware UI. Database policies must enforce authorization.
- **`hotels/`:** public hotel listings/details, amenities, location, images, reviews/ratings if approved and modeled.
- **`rooms/`:** room types, physical rooms, room details/images, pricing display, and availability queries. Availability checks in the UI are informational.
- **`bookings/`:** search criteria, reservation creation, details, history, status, and cancellation. The database must atomically assign one physical room and reject overlapping active stays.
- **`payments/`:** only payment-at-hotel terms/status or records if required by the agreed schema. The current product scope does not collect online payments or authorize gateway charges.
- **`users/`:** guest profile and preferences. Do not duplicate booking ownership/history rules from `bookings/`.
- **`admin/`:** authorized administration workflows that compose hotel, room, booking, and user capabilities; authorization is still enforced by policies.

There is no application server in the current stack, so do not add empty controllers, repositories, server models, DTOs, middleware, or exception layers. If Edge Functions or a separate backend are later approved, define their boundaries separately and keep business rules out of transport handlers.

## Adding a feature

1. Confirm the feature is part of the current milestone in `docs/implementation-plan.md`.
2. Add/adjust its HTML entry in `pages/` and Vite's build/URL map if a new document is needed. The home document remains at the project root.
3. Keep the corresponding `src/pages/` module focused on composing the feature and layout.
4. Put domain behavior in the appropriate `src/features/<name>/`; share UI only when it is domain-neutral.
5. Add SQL migrations and policy/integrity tests for data access or booking behavior before relying on client-side controls.
6. Add focused tests and update this guide only when boundaries or conventions change.

## Development workflow

Inspect Git status and existing code first. Work only on the active milestone, reuse established Vite and naming conventions, and do not overwrite unrelated changes. Validate the smallest relevant tests and production build, review the complete diff, and commit only milestone changes. Push only when the configured remote is available; never force-push. Use placeholders for environment examples and never place privileged Supabase keys in browser code.

## Considerations

- The current availability/booking design needs database-enforced constraints and an atomic operation; a browser availability check cannot prevent concurrent double-booking.
- Admin capabilities are in scope, but a separate hotel-owner role and owner-specific authorization are not yet defined.
- Online payment processing and refunds conflict with the current pay-at-hotel product rule. Revisit scope and security requirements before adding a payment provider.
- `hooks`, `store`, and `types` are generic organizational names, not reasons to add framework dependencies, global state, or TypeScript preemptively.
- Keep Vite's existing multi-entry build model and direct page URLs intact when restructuring.
