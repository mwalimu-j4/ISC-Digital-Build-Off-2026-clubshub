# Join requests audit

| Feature              | Status  | Evidence                                                                                                               | Action                                                                                                   |
| -------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Existing join action | EXISTS  | `src/modules/clubs/service.ts` calls `clubRepository.applyMembership` and the student club page posts a server action. | Keep `ClubMembership` as the request record and route new submissions through the join-requests service. |
| Membership statuses  | EXISTS  | `prisma/enums.prisma` defines `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`, and `LEFT`.                              | Reuse the enum and preserve existing membership rows.                                                    |
| Pending badge query  | EXISTS  | `club-admin-overview` counts pending memberships in its explicit club query.                                           | Keep the count and revalidate the admin surfaces after decisions.                                        |
| Today card           | EXISTS  | The club-admin overview renders `pendingRequests` and links to `/requests`.                                            | Keep the existing live metric and link.                                                                  |
| Notifications        | EXISTS  | `src/modules/notifications` owns the shared notification repository and service.                                       | Reuse it for decision notifications with `GENERAL`.                                                      |
| Audit helper         | EXISTS  | `src/lib/auth/audit.ts` provides transaction-safe `recordAuditLog`.                                                    | Reuse it for submissions, decisions, undo, and school-ID reveals.                                        |
| Shared components    | PARTIAL | The club-admin shell, semantic tokens, typography, and shared buttons already exist.                                   | Extend the shell styles and use existing tokens; add only request-specific components.                   |
| Admin request page   | MISSING | `/club-admin/[slug]/requests` currently renders the generic section placeholder.                                       | Add a server-guarded list/review surface with empty states and decision actions.                         |
| Request details      | MISSING | `ClubMembership` currently stores only status and timestamps.                                                          | Add additive application snapshot and decision fields.                                                   |
| Student detail form  | MISSING | The existing join action has no application fields.                                                                    | Add a Zod-backed request form on top of the existing membership flow.                                    |

## Refactors

- The existing `joinClub` flow remains the compatibility entry point, but new detailed
  submissions use the join-requests service and the same `ClubMembership` row.
- The existing overview pending aggregate remains the source for the sidebar badge and
  Today card; no duplicate count query is introduced.
- Existing requests without snapshot fields remain valid and render as
  “Details not provided”.
