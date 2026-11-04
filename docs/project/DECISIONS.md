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
