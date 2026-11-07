# Public landing page plan

| Section               | Data source                                                      | Exists? | Public fields allowed                                               | Cache strategy                                                           |
| --------------------- | ---------------------------------------------------------------- | ------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Clubs and categories  | `Club`, `ClubMembership` via `landingRepository`                 | Yes     | Active club identity, category, logo URL, approved membership count | Dynamic read; short-term caching can be added when mutations expose tags |
| Live statistics       | Aggregates from `Club`, `Event`, `Announcement`, `LostFoundItem` | Yes     | Counts only                                                         | Dynamic read                                                             |
| Upcoming events       | `Event` and active `Club` relation                               | Yes     | Title, date, location, club name and slug                           | Dynamic read                                                             |
| Announcements         | `Announcement`                                                   | Yes     | University-audience title, body, date                               | Dynamic read                                                             |
| Lost & Found preview  | `LostFoundItem`                                                  | Yes     | Report type, category, campus area, date                            | Dynamic read                                                             |
| Authenticated actions | Existing auth and routes                                         | Yes     | No private identity data on the public page                         | Existing auth/session behavior                                           |

The page uses read-only, explicit DTO queries and returns empty states when a source
is unavailable or has no records. No schema or migration changes are required because
the existing indexes cover the status, category, date, and membership queries.
