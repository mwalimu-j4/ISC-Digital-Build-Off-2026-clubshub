# Authentication and authorization

## Identity provider

ClubsHub uses Auth.js with Google OAuth and JWT sessions. OAuth is an access gate, not
user provisioning: the sign-in callback looks up the normalized email in `users` and
admits only an existing `ACTIVE` account. This preserves the required private student
registration identifier and prevents arbitrary Google accounts from becoming campus
users.

Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, and
`NEXTAUTH_URL` in each environment. The Google callback URL is
`/api/auth/callback/google`.

## Authorization

The JWT contains the database user ID, role, and current account status. Middleware
protects `/dashboard`, `/clubs`, `/admin`, and `/api/private` route groups. Server
code must use `requireUser()` or `requireRole()` rather than trusting browser state.
Suspended and deactivated accounts are rejected by both sign-in and session claims.

The `SUPER_ADMIN` role is global. Club-level permissions remain a Stage 04 concern and
must be checked from current membership records, not copied into the session.

## Auditability and database context

`recordAuditLog()` accepts either the shared Prisma client or a transaction client so
state changes and their audit records can be committed atomically. Repository methods
must also set the transaction-local `app.user_id` and `app.role` values required by
PostgreSQL RLS before querying protected records.
