# Project status

**Last updated:** 2026-11-11

## Current stage

Stage 04 — Core Club and Membership Modules: **Implemented**

Profile and account experience: **Implemented**

Student dashboard experience: **Implemented**
Campus Pulse student dashboard visual redesign: **Implemented**

## Objective

Deliver the first production business workflow on top of the identity and database
foundation.

## Completed tasks

- Product requirements, personas, journeys, and information architecture documented.
- Responsive ClubsHub landing page and shared navigation shell implemented.
- Design tokens, typography, color palette, cards, buttons, and responsive breakpoints
  established.
- Tailwind CSS and shadcn/ui conventions retained in the existing foundation.
- Live viewport review completed at 360px, 390px, 768px, 1024px, and 1440px with no
  horizontal overflow.
- Logged-in account menu, responsive profile navigation, profile data, memberships,
  proposals, activity, server-validated profile settings, and the student dashboard
  experience are implemented.
- Public and student club discovery now use one responsive, equal-height card component;
  landing filters preserve URL state and interest preferences persist to the account or
  anonymous preference cookie.

## Pending tasks

- Validate product assumptions with university stakeholders and representative users.
- Configure Neon `DATABASE_URL` and `DIRECT_URL` in Vercel before deployment.
- Configure Google OAuth credentials and `NEXTAUTH_SECRET` in Vercel before deployment.

## Testing results

- `pnpm lint`: passed
- `pnpm format:check`: passed
- `pnpm typecheck`: passed
- `pnpm test`: passed (2 focused club-service tests)
- `pnpm build`: passed
- Manual viewport review: passed at 360px, 390px, 768px, 1024px, and 1440px

## Clubs for You discovery refactor (2026-11-11)

- `pnpm typecheck`: passed.
- Focused discovery and shared-card unit tests: passed (12 tests).
- Focused ESLint: passed.
- `pnpm run build:app`: passed, including the full Next.js lint and type validation.
  The build reports existing `<img>` performance warnings in Lost & Found components.
- Responsive layout uses a three-column desktop grid, two columns at tablet widths,
  and one column on phones; filter submissions retain a native server-rendered GET form.

## Known limitations

Club-admin event and announcement authoring remains out of scope. Password changes
and session revocation remain omitted because the
current Google OAuth/JWT authentication flow does not support them. RLS policies
require request code to set transaction-local identity context.

## Join requests validation

- The additive `20261110000000_join_request_details` migration extends existing
  memberships with nullable application snapshots and decision metadata.
- Student submissions and club-admin reads/decisions are server-authorized and
  Zod-validated.
- The responsive student request form and `/club-admin/[slug]/requests` review page
  use live membership data and designed empty states.

## Stage 02 validation

- `pnpm exec prisma validate`: passed with local placeholder environment values.
- `pnpm exec prisma generate`: passed.
- Migration SQL was generated from the split Prisma schema without a database
  connection. Applying it requires a reachable PostgreSQL/Neon database.

## Stage 03 validation

- Google OAuth is configured through Auth.js with JWT sessions.
- Suspended, deactivated, unknown, and email-less accounts are rejected at sign-in.
- Protected route groups are guarded by middleware; server components can enforce
  identity and role checks with shared authorization helpers.
- Audit entries can be written through Prisma or a transaction-scoped Prisma client.

## Stage 04 validation

- Prisma schema validation and client generation pass.
- Focused club service tests cover role and input validation.
- Production build compiles successfully; runtime database rendering requires configured
  `DATABASE_URL` and `DIRECT_URL`.

## Student dashboard validation

- Student route layout enforces the `STUDENT` role on the server.
- Discover clubs, membership states, leave actions, event registration rules,
  announcements, and notifications use server-side services and repositories.
- The additive migration `20261107000000_student_dashboard_events_announcements`
  adds events, registrations, and announcements.
- Campus Pulse uses the existing services and models for the responsive UEAB
  dashboard, passport milestones, campus week, proposals, announcements, and
  suggested clubs. No migration or hardcoded business data was added.

## Public landing page validation

- Landing content is composed through read-only DTO queries in `src/modules/landing`.
- Public Lost & Found cards exclude reporter identity, contact details, and claim data.
- No migration was required; existing indexes cover the landing queries.

## Super-admin users and roles validation

- `/super-admin/users` uses server-side role checks, explicit DTO selects, URL-validated
  search/filter parameters, transactional role/suspension audit entries, and a
  responsive list/detail layout.
- The additive `20261109000000_super_admin_users_roles` migration adds suspension
  metadata and lookup indexes.

## Club admin dashboard validation

- Approved club administrators are routed to their first active club after sign-in.
- `/club-admin/[slug]` re-checks the requested club and approved `CLUB_ADMIN`
  membership server-side.
- The overview uses live membership, event, announcement, and audit data with
  explicit empty states where supporting models do not yet exist.
- No migration was required for this first dashboard slice.

## Space switcher validation

- `/choose` resolves real student, member, club-admin, pending, suspended, and
  super-admin spaces from current database memberships.
- The shared switcher is wired into the club-admin, student, and super-admin shells.
- Post-login routing validates safe internal destinations and revalidates the
  remembered-space cookie; the cookie never stores a role.
- No migration was required.
- Contextual `/spaces` pages are now rendered inside the student, club-admin, and
  super-admin dashboard layouts, with contextual back buttons and no account logout
  required to switch workspaces.

## Public smart discovery validation

- `/` keeps the existing live campus stats, announcements, event strip, and Lost & Found
  preview while adding server-rendered interest, category, sort, verified, search, and
  pagination filters.
- Interest choices are saved to the signed-in user or an HttpOnly first-party cookie;
  club admins can assign one to five discovery interests from the existing profile area.
- Match ranking uses assigned club interests, the shared club-health score, reviewed
  status, approved member counts, and published public events. Cards use explicit
  public DTOs and show leadership only where an approved member has an assigned
  chairperson title.
- The additive migration is `20261110100000_landing_discovery_interests`; no sample
  clubs or member records are seeded.
- Verified means active and reviewed in the existing approval workflow. Public contact
  details remain omitted because the current club model has no public contact field.

## Next approved stage

Stage 06 — Club Admin Dashboard.
