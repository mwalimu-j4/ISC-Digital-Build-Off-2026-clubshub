# Information architecture

## Proposed primary navigation

| Section        | Intended audience                               | Stage 1 status            |
| -------------- | ----------------------------------------------- | ------------------------- |
| Home           | Everyone                                        | Public landing experience |
| Discover Clubs | Everyone, with richer future views for students | Presentation anchor only  |
| Events         | Everyone                                        | Presentation anchor only  |
| Lost & Found   | Everyone                                        | Presentation anchor only  |
| Announcements  | Everyone, with future personalized views        | Presentation anchor only  |
| My Activities  | Authenticated students                          | Planned, not implemented  |
| Profile        | Authenticated users                             | Planned, not implemented  |

Future club-administrator and super-administrator workspaces will be role-restricted
and separated from the student navigation. They are intentionally not built in Stage 1.

## Navigation principles

- Keep discovery and campus-wide information public where possible.
- Make authenticated destinations visibly distinct from public discovery.
- Preserve a stable global shell across mobile and desktop.
- Never treat hidden navigation as authorization; server-side authorization will be
  required when these destinations are implemented.
