# Database architecture

PostgreSQL and Prisma are the persistence stack. The Prisma schema is split into
domain files in `prisma/`, with `schema.prisma` containing the datasource and client
generator. The initial migration contains normalized models, explicit foreign keys,
unique constraints, query indexes, and forced row-level security policies.

Repositories will own Prisma access in later stages. Multi-record changes must use
transactions, and each schema change must be a reviewed migration. Credentials stay
in environment variables; local database files and dumps are ignored. RLS context
must be set transaction-locally by the authenticated server layer; RLS complements,
but does not replace, service authorization.

The student dashboard adds `events`, `event_registrations`, and `announcements` in
the reviewed `20261107000000_student_dashboard_events_announcements` migration.
Registrations use a database-enforced `(event_id, user_id)` uniqueness constraint;
capacity and registration deadlines are enforced again in the event service. The
existing notification table remains the shared notification store for Lost & Found
and student activity.

Event audience visibility uses the additive `MEMBERS` value in `EventStatus`;
student queries only return those events when the user has an approved membership
in the club. Optional event images and videos are stored in `event_media` after
server-side Cloudinary validation, with the event owning their ordering and
cascade-delete relationship.

The additive `20261109000000_super_admin_users_roles` migration adds nullable
`users.suspended_at` and `users.suspended_reason` fields plus lookup indexes. The
users module keeps registration numbers out of list DTOs and audit metadata.

Public club discovery adds the normalized `interests`, `club_interests`, and
`user_interests` tables in `20261110100000_landing_discovery_interests`. The migration
seeds the eight shared taxonomy values, not club or student records. Club and user
associations use composite primary keys and cascading foreign keys. Discovery queries
select only public club fields, approved membership counts, published events, and
explicitly assigned chairperson names/titles.
