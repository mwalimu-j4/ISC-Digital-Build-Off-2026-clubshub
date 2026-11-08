# Club experience audit

| Feature                       | Route                     | Status  | Evidence                                                             | Action                                                                     |
| ----------------------------- | ------------------------- | ------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Public club directory         | `/clubs`                  | EXISTS  | `src/app/clubs/page.tsx`, `modules/clubs/service.ts`                 | Preserve existing discovery flow                                           |
| Public club profile shell     | `/clubs/[slug]`           | PARTIAL | Route only rendered name, description, purpose, activities           | Replace with responsive hero, tabs, cards, and real-data empty states      |
| Student club profile          | `/student/clubs/[slug]`   | EXISTS  | Existing membership action and approved-club lookup                  | Preserve behavior; public page now links into the same flow                |
| Membership join authorization | Service                   | EXISTS  | `joinClub` validates student role, active club, and membership state | Reuse server action on public profile                                      |
| Membership count              | Repository                | PARTIAL | Directory already counted approved memberships                       | Add approved count to profile DTO                                          |
| Events                        | Prisma and student routes | EXISTS  | `Event`, `EventRegistration`, student event routes                   | Read upcoming published events for public profile                          |
| Announcements                 | Prisma and student routes | EXISTS  | `Announcement` with public `UNIVERSITY` audience                     | Read only public club announcements                                        |
| Showcase projects             | Database/module           | MISSING | No model or module exists                                            | Leave as future empty surface; do not fabricate projects                   |
| Members directory             | Database                  | PARTIAL | Memberships exist; no public member directory contract               | Show only approved club-admin names                                        |
| Resources                     | Database/module           | MISSING | No resource model or module exists                                   | Leave out until the module and permissions exist                           |
| Transparency/ledger           | Audit log exists          | PARTIAL | Audit log is internal and has no public read model                   | Show verified status and activity health without exposing private logs     |
| Club admin console            | `(club-admin)` routes     | PARTIAL | Admin route group exists but no publish studio surface               | Defer until publishable modules and permission helpers are added           |
| Shared design tokens          | `src/app/globals.css`     | EXISTS  | Student theme already defines blue/gold/canvas tokens                | Reuse values in club profile styles                                        |
| Typography                    | `src/app/layout.tsx`      | EXISTS  | Inter and Instrument Serif are loaded globally                       | Reuse for UI and display headings                                          |
| Mobile behavior               | Public profile            | MISSING | Existing page has no responsive composition                          | Add stacked columns, horizontally scrollable tabs, and touch-sized actions |

## Scope decision

This phase is additive and limited to the public club profile. It does not add
database models or change existing authentication, dashboard, admin, or Lost &
Found behavior. Sections without an existing data contract render an explicit
empty state or are omitted rather than using mock content.
