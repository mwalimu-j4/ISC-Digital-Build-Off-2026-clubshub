# ClubsHub roadmap

| Stage | Focus                                                   | Status      |
| ----- | ------------------------------------------------------- | ----------- |
| 01    | Product Foundation & Responsive UX                      | Completed   |
| 02    | Database Architecture & Data Modelling                  | Implemented |
| 03    | Authentication & Authorization                          | Implemented |
| 04    | Core Club and Membership Modules                        | Implemented |
| 05    | Events, Announcements, Notifications, Student Dashboard | Implemented |
| 06    | Club Admin Dashboard                                    | In progress |
| 07    | Administration, Analytics, and Auditability             | Not started |
| 08    | Production readiness                                    | Not started |

Stage 04 implements proposal submission, review, approved directory/profile,
approved club-admin profile updates, suspension/reactivation, and audit history.

Stage 05 implements the server-guarded student shell, dashboard, club discovery and
membership actions, event registration, announcements, and student notifications.

Stage 06 is in progress. The server-guarded club-admin overview, join request form,
and join-request review page are implemented. The post-login landing route is
implemented without adding a migration. Remaining club-admin
workflows will be added only with their supporting modules and authorization tests.

## Public landing discovery

Smart discovery extends the live landing page with URL-based interest filters,
persisted user preferences, club-admin interest tagging, featured/recommended cards,
activity labels derived from the existing club-health formula, and public event
highlights. The additive interest migration seeds taxonomy values only. Existing search,
membership request, public event, announcement, Lost & Found, and live-stat flows are
reused. Interest tagging by club admins is required before interest matches appear.
