# Events audit

| Feature                                                 | Status  | Evidence                                                                                               | Action                                                                                         |
| ------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Event and registration persistence                      | EXISTS  | `prisma/events.prisma` contains `Event` and `EventRegistration` with capacity and deadline fields.     | Reuse the existing schema.                                                                     |
| Student event listing and registration                  | PARTIAL | `src/app/(student)/student/events` and `src/modules/events` support published events and registration. | Preserve the flow and extend visibility safely.                                                |
| Club-admin event list                                   | MISSING | The club-admin section route renders a generic placeholder.                                            | Add an authorized, filterable event list.                                                      |
| Create and edit event form                              | MISSING | No event mutation service or form route exists.                                                        | Add shared Zod validation, service mutations, and form pages.                                  |
| Event audience visibility                               | PARTIAL | Existing `PUBLISHED`/`DRAFT` status distinguishes public and draft events.                             | Map the existing status to public/member-safe queries without adding an unreviewed migration.  |
| Event media uploads                                     | MISSING | Cloudinary utilities exist for lost-and-found uploads, but no event media model or workflow exists.    | Defer until an additive media migration and signed upload design are reviewed.                 |
| Public event detail and listing                         | MISSING | Public club pages only show the next event and link to the student detail route.                       | Keep the current public surface stable; schedule the slug/media work with the media migration. |
| Notifications, check-in, certificates, and cancellation | MISSING | No event-specific implementation exists.                                                               | Leave unrelated workflows unchanged and add in a follow-up vertical slice.                     |

This implementation covers the partial and missing admin CRUD/listing rows that can
be delivered against the current reviewed schema. It intentionally does not invent
database columns or a media upload contract.
