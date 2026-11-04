# Club management (Stage 04)

Club creation is a proposal workflow. An active student submits the club name,
description, purpose, activities, and category. The service validates input with Zod
and creates a pending club; no client-supplied status or owner is trusted.

Super-admins can approve, reject (with a required reason), or request changes (with a
required reason). Approval creates an approved `CLUB_ADMIN` membership for the
proposer. Only approved club-admin memberships can update an active club profile.
Super-admins can suspend and reactivate clubs. Suspended clubs are excluded from the
public directory and profile routes.

All state transitions write an audit log. API handlers are thin; authorization and
validation live in `src/modules/clubs/service.ts`, and persistence is isolated in
`repository.ts`. PostgreSQL RLS remains defense in depth; production request
boundaries must set transaction-local identity context before database access.

Stage 04 intentionally excludes member applications, events, announcements,
notifications, and analytics.
