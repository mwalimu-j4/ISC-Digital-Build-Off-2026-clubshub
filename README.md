# ClubsHub

ClubsHub is a planned platform for organizing university clubs, memberships, events,
announcements, notifications, and lost-and-found workflows. The repository contains the Stage 04 club proposal and management workflow on top of
the authentication and database foundation.

## Stack and architecture

- Next.js App Router with React and TypeScript strict mode
- PostgreSQL and Prisma (planned database layer)
- Tailwind CSS and shadcn/ui conventions with semantic design tokens
- Zod for external input validation
- ESLint, Prettier, Vitest, Testing Library, and Playwright
- Modular monolith with route composition, isolated business modules, shared UI, and
  infrastructure layers

The approved visual system uses deep navy foundations and surfaces, orange primary
actions and emphasis, and slate-blue semantic neutrals. UI work must use the shadcn/ui
semantic tokens defined in [`src/app/globals.css`](src/app/globals.css); do not add
unrelated palettes or one-off color literals.

See [`docs/architecture/`](docs/architecture/) and [`docs/project/technology-stack.md`](docs/project/technology-stack.md).
Read the [product requirements](docs/product/product-requirements.md), [roadmap](docs/project/ROADMAP.md),
and [current project status](docs/project/PROJECT_STATUS.md) before contributing.

## Development setup

1. Install Node.js 20+ and pnpm 10.
2. Install dependencies: `pnpm install`.
3. Copy `.env.example` to `.env.local` and provide local values when database work begins.
4. Start the development server: `pnpm dev`.

Available quality commands:

```text
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

## Repository structure

`src/app` contains routing and composition only. `src/components/shared` contains the
visual shell. `src/modules` will contain isolated
business modules following the documented module contract. `src/components` contains
reusable presentation components, `src/lib` contains shared infrastructure, `prisma`
contains database artifacts, and `tests` is split by test level.

## Engineering standards

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`.github/copilot-instructions.md`](.github/copilot-instructions.md)
before contributing. Architectural consistency, server-side authorization, input
validation, explicit module boundaries, and verified changes take priority over speed.

## Project status

Stage 04 is complete: students can submit proposals and see status, super-admins can
review and oversee clubs, approved clubs have a public directory/profile, and approved
club admins can update profiles. Events, announcements, notifications, and
lost-and-found remain future stages.

## Student dashboard

The student experience is available at `/student` for authenticated student accounts.
It includes a responsive dashboard, club discovery and membership actions, upcoming
events with server-enforced registration, announcements, notifications, and links to
the existing profile and proposal workflows. The student data model is introduced by
the additive `20261107000000_student_dashboard_events_announcements` migration.

## Club admin dashboard

Approved members with an active `CLUB_ADMIN` membership land on
`/club-admin/[slug]` after sign-in. The responsive overview uses live club,
membership, event, announcement, and audit data and re-checks membership access
on the server for every requested club. Workflow sections are linked from the
shared shell and show explicit empty states until their supporting domain modules
are implemented.

## Join requests

Students can submit a validated request with a private school-ID snapshot from the
club page. Approved club admins can review live pending, approved, and rejected
requests at `/club-admin/[slug]/requests`; decisions are audited and notify the
applicant. Existing membership requests without application details remain visible
with an explicit empty-detail label.

## Space chooser and switching

After sign-in, users with multiple available spaces can choose from `/choose`.
The shared switcher is available in the club-admin, student, and super-admin
shells. It resolves club roles from current memberships on the server and never
uses the remembered-device cookie as authorization.

## Public landing page

The `/` landing page is a responsive, database-driven discovery surface. It reads
active clubs, approved membership counts, published events, university announcements,
and safe Lost & Found preview fields through the landing module. Empty or unavailable
sources render designed empty states rather than fabricated counts or content.
