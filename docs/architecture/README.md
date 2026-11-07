# Application Architecture

## Context

The committed application uses HTML entry files under `pages/`, page-level vanilla JavaScript ES modules under `src/pages/`, and Vite to build multiple entries. Bootstrap supplies the UI toolkit, and Supabase is the planned hosted backend. Keep this a multi-page application: do not introduce a client-side SPA router or a frontend framework.

The workspace currently has pre-existing deletions of the application and package files. This document describes the intended architecture based on the committed project; it does not restore or replace those files.

## Folder tree

```text
.
├── docs/
│   ├── architecture/
│   │   └── README.md
│   └── implementation-plan.md
├── pages/                              # Separate Vite HTML entry files
│   ├── index.html
│   ├── hotels/index.html
│   ├── hotel/index.html
│   ├── booking/index.html
│   ├── booking-confirmation/index.html
│   ├── my-bookings/index.html
│   ├── booking-details/index.html
│   ├── login/index.html
│   ├── register/index.html
│   ├── account/index.html
│   └── admin/...
├── src/
│   ├── app/
│   │   ├── routes/
│   │   ├── providers/
│   │   └── layouts/
│   ├── pages/                          # Thin page entry modules
│   ├── features/
│   │   ├── auth/
│   │   ├── hotels/
│   │   ├── rooms/
│   │   ├── bookings/
│   │   ├── payments/
│   │   ├── users/
│   │   └── admin/
│   ├── components/
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
│   ├── styles/                         # Shared CSS and Bootstrap overrides
│   └── config/
├── supabase/
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/
├── .env.example
├── package.json
└── vite.config.js
```

The `pages/` HTML files remain the URLs and independent document entries. `src/pages/` is retained from the existing convention and provides each document's JavaScript composition module. The route map documents/builds those entries; it does not intercept navigation.

## Responsibilities

- **`pages/`:** HTML shells for public, guest, and admin documents. Each entry loads its matching page module and shared styles.
- **`src/pages/`:** Thin page composition modules. They select features and layouts, and should not own database policy or booking integrity.
- **`src/app/routes/`:** Route/entry metadata shared with Vite configuration where practical. In an MPA this is a build-time/document map, not a runtime SPA router.
- **`src/app/providers/`:** Small application startup and dependency initialization modules. No React context/provider convention is implied.
- **`src/app/layouts/`:** Public, authenticated guest, and admin page shells.
- **`src/features/`:** Business capabilities and their feature-specific UI, validation, and operations. Keep related behavior cohesive within a feature.
- **`src/components/`:** Reusable presentation. `ui/` contains generic controls, `common/` contains shared site pieces, and `forms/` contains reusable accessible form elements.
- **`src/services/`:** Shared external integrations, such as a browser Supabase client configured from public environment variables. Feature-specific query behavior should stay with its feature unless it is genuinely shared.
- **`src/hooks/`:** Reusable vanilla JavaScript lifecycle/DOM or async helpers only when they simplify multiple consumers. This name does not imply React hooks.
- **`src/store/`:** Shared in-memory state only when multiple modules need it. Multi-page navigation reloads documents; use Supabase Auth/session mechanisms rather than treating this as a persistent SPA store.
- **`src/utils/`, `src/constants/`, `src/config/`:** Small domain-neutral helpers, stable shared values, and validated environment/application configuration, respectively.
- **`src/types/`:** Optional JSDoc typedefs for shared data contracts. Do not add TypeScript.
- **`src/assets/`:** Local static images, icons, fonts, and other bundled assets. User-managed hotel images belong in Supabase Storage, not source control.
- **`src/styles/`:** Shared CSS and Bootstrap overrides, preserving the existing stylesheet convention.
- **`supabase/migrations/`:** Versioned SQL schema, constraints, Row Level Security policies, and atomic database operations. Check remote migration history before applying.
- **`tests/`:** Unit, database/integration, and browser/end-to-end tests, added with tooling when an implementation milestone needs them.
- **`scripts/`:** Small repeatable development or migration-support commands; never store credentials here.

## Feature boundaries and communication

The normal dependency direction is:

```text
HTML document -> page module -> layout/shared UI + feature -> service -> Supabase
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
2. Add/adjust its HTML entry in `pages/` and build entry configuration if a new document is needed.
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
