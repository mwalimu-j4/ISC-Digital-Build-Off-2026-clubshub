# Student Dashboard Redesign Plan

## Existing surfaces to restyle

- `src/app/(student)/layout.tsx` and `src/components/student/student-navigation.tsx`
  become the Campus Pulse responsive shell.
- `src/app/(student)/student/page.tsx` becomes the dashboard composition while
  retaining the existing server-side service calls.
- Existing student route pages keep their data fetching and receive shared student
  typography, cards, buttons, chips, and footer styling through the shell and tokens.
- `src/app/globals.css` receives the UEAB palette and responsive student visual tokens
  without changing non-student themes.

## New student presentation components

- Shared `SectionCard`, `EmptyState`, `StatusChip`, `ProgressRing`, `WeekStrip`,
  `ClubRow`, `CampusPassport`, and dashboard section components.
- A pure Campus Passport milestone calculator and friendly membership/proposal status
  mappers with focused unit tests.
- Responsive mobile header/menu and bottom navigation presentation.

## Dashboard data sources

| Section                       | Existing source                                                             |
| ----------------------------- | --------------------------------------------------------------------------- |
| Greeting and account identity | `requireRole('STUDENT')` user session                                       |
| Campus Passport               | Existing profile stats, memberships, registered events, and owned proposals |
| Campus week                   | `listUpcomingEvents`, registered events, and existing membership club IDs   |
| My clubs                      | `getOwnMemberships` and club relation data                                  |
| Proposal tracker              | `getOwnProposals`                                                           |
| Announcements                 | `listStudentAnnouncements`                                                  |
| Notifications badge           | `getUnreadNotificationCount`                                                |
| Picked for you                | `discoverClubs`, excluding active/pending memberships                       |

No sample values will be introduced. Sections show designed empty states when the
existing data sources have no records.
