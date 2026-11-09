# Space switcher audit

| Feature                       | Status  | Evidence                                                         | Action                                                                                      |
| ----------------------------- | ------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Club-admin dashboard          | EXISTS  | `/club-admin/[slug]` and `ClubAdminShell` already existed        | Reused and replaced its static chip                                                         |
| Membership data               | EXISTS  | `ClubMembership` includes role and status per club               | Reused with explicit server DTO selection                                                   |
| Global role/session           | EXISTS  | Auth.js session contains global role                             | Kept global role only; club roles are resolved from memberships                             |
| Post-login routing            | PARTIAL | `/auth/redirect` previously selected student or super-admin only | Added validated remembered-space and chooser resolution                                     |
| Space resolver                | MISSING | No cross-club DTO or role-aware space grouping existed           | Added `src/modules/spaces` with one membership query                                        |
| Chooser page                  | MISSING | No `/choose` route existed                                       | Added responsive real-data chooser                                                          |
| Club switcher                 | MISSING | Club admin chip was static text                                  | Added shared popover/bottom-sheet switcher to admin, student, and super-admin shells        |
| Remembered choice             | MISSING | No preference cookie existed                                     | Added HttpOnly, SameSite=Lax, production-secure cookie containing only a validated space id |
| Open redirect protection      | MISSING | Redirect route had no requested URL resolver                     | Added safe internal path validation and current-space revalidation                          |
| Font system                   | EXISTS  | Root layout loads Inter and Instrument Serif                     | No font change required                                                                     |
| Attendance/certificates/polls | MISSING | No supporting models or modules exist                            | Left out; no fabricated data or alternate architecture added                                |
