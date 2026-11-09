# Product and architecture decisions

## 2026-11-04 — Stage 1 remains presentation-only

The first product increment establishes the shell and product language without
inventing backend behavior. This keeps the UX reviewable while preserving the agreed
modular architecture and scope boundary.

## 2026-11-04 — Mobile-first responsive shell

The public experience starts from a compact layout and progressively enhances for
tablet and desktop. Campus discovery needs to be useful on phones, where students are
most likely to encounter events and communities.

## 2026-11-04 — Restrained institutional visual language

ClubsHub uses deep navy foundations and surfaces with orange primary actions and
accessible slate-blue neutrals. This matches the approved visual direction, gives the
product a confident institutional identity, and keeps hierarchy clear.

## 2026-11-04 — Enforced shadcn/ui semantic palette

All UI uses shadcn/ui conventions and the semantic tokens in `src/app/globals.css`.
Future components must consume those tokens rather than introduce arbitrary colors,
so the visual system remains consistent across every development stage.

## 2026-11-04 — Anchors instead of dead links

Stage 1 navigation points to implemented page sections or clearly marked future
anchors. No fake submission, authentication, or workflow buttons were added.

## 2026-11-04 — Split Prisma schema with one generated client

Prisma models are divided into readable domain `.prisma` files while sharing one
datasource and generated client. This preserves a single relational schema and
migration history without making developers navigate one large model file or maintain
multiple clients.

## 2026-11-04 — PostgreSQL RLS as defense in depth

The initial migration enables and forces row-level security and uses transaction-local
`app.user_id` and `app.role` context. Authentication and authorization remain Stage 03
work; the policies ensure that missing server identity context fails closed rather than
turning the database into an authorization boundary that the UI must enforce.

## 2026-11-04 — Vercel deploys reviewed migrations

Vercel uses the `vercel-build` script to generate Prisma Client, run
`prisma migrate deploy`, and then build Next.js. Runtime and migration connection
values are supplied as environment variables; no database URL is committed.

## 2026-11-04 — Club proposals are clubs with explicit review state

Stage 04 keeps the existing club aggregate as the proposal record. Purpose,
activities, and review reasons remain on that aggregate, while approval creates the
proposer's approved club-admin membership. This avoids a second source of truth and
keeps public reads restricted to active clubs.

## 2026-11-06 — Profile privacy is enforced in the service layer

Profile reads remove email and student registration identifiers by default, returning
those fields only to the profile owner or a super administrator. Profile updates are
restricted to the authenticated user's own record and validated with the module's
Zod schema before persistence.

## 2026-11-06 — Unsupported security controls are omitted

The current Google OAuth and JWT session implementation does not provide password
changes or server-side session revocation. The profile experience therefore does not
expose misleading security controls until the authentication contract supports them.

## 2026-11-07 — Student routes are additive

The student experience is composed under a dedicated `(student)` route group and
uses the existing profile, club proposal, public club, and notification foundations.
The student layout enforces the role server-side; existing public routes remain
available and are not duplicated or restyled.

## 2026-11-07 — Event registration is service-enforced

Event capacity, registration deadlines, duplicate registration, and cancellation are
validated in the event service in addition to the database uniqueness constraint.
This keeps authorization and business rules independent of client controls.

## 2026-11-07 — Campus Pulse uses UEAB blue and gold

The student dashboard redesign uses UEAB blue and gold tokens, Inter for interface
copy, and Instrument Serif for display headings. The palette is scoped to the student
theme so club-admin, super-admin, landing, auth, and Lost & Found surfaces retain
their existing presentation contracts.

## 2026-11-07 — Campus Passport is derived

Campus Passport progress is calculated from existing profile, membership, event
registration, and proposal data by a pure function. It is intentionally not stored
in Prisma, which keeps the progress explainable and prevents a second source of
truth.

## 2026-11-07 — Public landing data is DTO-only

The public landing page uses explicit read-only DTO queries and never serializes full
Prisma records. Lost & Found previews intentionally expose only safe discovery fields;
reporter, contact, identity, and claim data remain private.

## 2026-11-07 — Public landing palette follows UEAB tokens

The public landing page uses the existing UEAB blue, gold, canvas, surface, border,
ink, and muted tokens rather than the previous orange-on-navy marketing palette.

## 2026-11-09 — Super-admin users use additive suspension metadata

Global user role management is limited to student and super-admin roles. Club-admin
authority remains a club membership concern. Suspension metadata is nullable and
added without changing existing auth or membership columns; the JWT auth contract
re-checks persisted status because this project does not store server sessions.
