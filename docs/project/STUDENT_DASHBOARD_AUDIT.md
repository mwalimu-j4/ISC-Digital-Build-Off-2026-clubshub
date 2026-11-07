# Student dashboard audit

| Feature | Route | Status | Evidence (file paths) | Action |
|---|---|---|---|---|
| Student layout with sidebar and mobile navigation | `/student/*` | EXISTS | `src/app/(student)/layout.tsx`, `src/components/student/student-navigation.tsx`, `src/components/shared/mobile-bottom-nav.tsx` | Reuse the guarded student shell. |
| Account menu in header | `/profile`, `/profile/settings` | EXISTS | `src/components/shared/site-header.tsx`, `src/app/profile/layout.tsx` | Reuse the existing account menu and profile settings links. |
| Dashboard home | `/student` | EXISTS | `src/app/(student)/student/page.tsx`, `src/app/(student)/student/loading.tsx`, `src/app/(student)/student/error.tsx` | Reuse the server-rendered dashboard and its loading/error boundaries. |
| Discover Clubs | `/student/clubs` | EXISTS | `src/app/(student)/student/clubs/page.tsx`, `src/modules/clubs/service.ts`, `src/modules/clubs/repository.ts` | Reuse the server-rendered search, category filtering, membership states, and join actions. |
| Club detail page | `/student/clubs/[slug]` | EXISTS | `src/app/(student)/student/clubs/[slug]/page.tsx`, `src/modules/clubs/service.ts` | Reuse the student membership-aware detail page. |
| Propose a Club and proposal status | `/clubs/propose`, `/dashboard/clubs` | EXISTS | `src/app/clubs/propose/page.tsx`, `src/app/dashboard/clubs/page.tsx`, `src/modules/clubs/service.ts` | Link existing proposal and status experience from the student area. |
| My Clubs with status, role, and leave | `/student/clubs/mine` | EXISTS | `src/app/(student)/student/clubs/mine/page.tsx`, `src/modules/clubs/service.ts` | Reuse the server-authorized membership actions. |
| Events list, detail, registration, cancellation | `/student/events` | EXISTS | `src/app/(student)/student/events/`, `src/modules/events/` | Reuse the event module and server-enforced registration rules. |
| Announcements feed | `/student/announcements` | EXISTS | `src/app/(student)/student/announcements/page.tsx`, `src/modules/announcements/` | Reuse the member-scoped and university-wide feed. |
| Notifications list, unread count, mark read | `/student/notifications` | EXISTS | `src/app/(student)/student/notifications/page.tsx`, `src/modules/notifications/` | Reuse the existing notification table through the student module API. |
| Profile and settings | `/profile`, `/profile/settings` | EXISTS | `src/app/profile/page.tsx`, `src/app/profile/settings/page.tsx`, `src/modules/profile/` | Reuse existing profile experience and link it from the student shell. |
| Server-side student role guard | `/student/*` | EXISTS | `src/app/(student)/layout.tsx`, `src/lib/auth/authorization.ts` | Reuse `requireRole('STUDENT')` for layout and actions. |
| Event, registration, announcement, notification tables and optional user fields | Prisma schema | EXISTS | `prisma/events.prisma`, `prisma/announcements.prisma`, `prisma/lost-found.prisma`, `prisma/user.prisma`, `prisma/migrations/20261107000000_student_dashboard_events_announcements/` | Reuse the additive migration and existing notification/profile fields. |
