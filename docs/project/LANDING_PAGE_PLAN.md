# Public landing page plan

| Section                             | Data source                                                                                        | Exists?  | Public fields allowed                                                | Cache strategy                                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Clubs and categories                | `Club`, `ClubMembership` via `landingRepository`                                                   | Yes      | Active club identity, category, logo URL, approved membership count  | Dynamic read; short-term caching can be added when mutations expose tags                  |
| Live statistics                     | Aggregates from `Club`, `Event`, `Announcement`, `LostFoundItem`                                   | Yes      | Counts only                                                          | Dynamic read                                                                              |
| Upcoming events                     | `Event` and active `Club` relation                                                                 | Yes      | Title, date, location, club name and slug                            | Dynamic read                                                                              |
| Announcements                       | `Announcement`                                                                                     | Yes      | University-audience title, body, date                                | Dynamic read                                                                              |
| Lost & Found preview                | `LostFoundItem`                                                                                    | Yes      | Report type, category, campus area, date                             | Dynamic read                                                                              |
| Authenticated actions               | Existing auth and routes                                                                           | Yes      | No private identity data on the public page                          | Existing auth/session behavior                                                            |
| Interest picker and recommendations | `interests`, `club_interests`, `user_interests` via `src/modules/discovery`                        | Added    | Taxonomy, current user's preferences, and active club discovery DTOs | URL filters are shareable; user preference writes are authenticated; discovery is dynamic |
| Verified / featured club cards      | Active club review state, approved membership count, public events, and existing club health score | Extended | Reviewed active clubs; no member identifiers                         | Aggregate values returned in one club query plus a batched latest-event query             |
| Club-to-interest tagging            | Club-admin membership check and `ClubInterest` records                                             | Added    | Tags appear only for active clubs                                    | Mutations require approved club-admin membership                                          |

The page uses read-only, explicit DTO queries and returns empty states when a source
is unavailable or has no records. The additive `20261110100000_landing_discovery_interests`
migration adds only the interest taxonomy and associations. Existing live statistics
remain on the existing aggregate methods.

The home page accepts `interests`, `category`, `sort`, `verified`, `q`, and `page` in
the URL. Interest choices are saved for signed-in users and stored in an HttpOnly
first-party preference cookie for anonymous visitors. Clubs with no admin-assigned
interests are not falsely matched to a selected interest. “Verified” means active and
reviewed through the existing club approval workflow. A chairperson is shown only
when a club admin has assigned an official title containing “chairperson”. No public
contact field currently exists, so the landing page does not show contact details.
