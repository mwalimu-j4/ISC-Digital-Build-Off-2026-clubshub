# Public club discovery

## Inputs

The home page accepts `interests`, `category`, `sort`, `verified`, `q`, and `page` as
URL parameters. This keeps filters shareable and allows the experience to work without
client-side JavaScript. `interests` contains known taxonomy slugs. The eight shared
interest names are seeded by the reviewed database migration; no test clubs or student
records are seeded.

Signed-in preferences are stored in `user_interests`. Anonymous preferences use the
HttpOnly, first-party `club-discovery-interests` cookie. Both preferences remain
optional; the URL value controls the current result view.

## Ranking

`rankClubs` is a pure function. It uses the following weighted components, each
normalized to a 0–100 range:

| Signal                    | Weight | Meaning                                                                                                                  |
| ------------------------- | -----: | ------------------------------------------------------------------------------------------------------------------------ |
| Selected-interest overlap |    60% | Number of selected interests assigned to the club divided by the number selected                                         |
| Activity                  |    20% | The existing club-admin health score, derived from approved members, upcoming published events, and public announcements |
| Reviewed                  |     8% | 100 for active clubs with `reviewedAt`, otherwise 0                                                                      |
| Latest public event       |     8% | Linear decay from 100 to 0 over 90 days after the latest published event                                                 |
| Active membership         |     4% | `log1p(memberCount)` normalized against the largest matching club                                                        |

The combined score is shown as a match percentage only when interests are selected.
Stable name and slug tie-breakers keep ordering deterministic. When no interests are
selected, the default order is by activity.

Activity labels reuse the shared health score: 70–100 is Very active, 40–69 is Active,
and 0–39 is Quiet. The five-dot display is accompanied by a text label and an accessible
activity description. The three featured cards are the highest-ranked active/reviewed
clubs rated Active or Very active.

## Public data and privacy

Only active clubs are eligible. “Verified” is the existing approval state (`status =
ACTIVE` and `reviewedAt` present), not a second verification record. Member counts use
approved memberships only. Event cards use published upcoming events from active clubs.
Leadership appears only when an approved member has an explicitly assigned official
title containing “chairperson”. The club model has no public contact field, so discovery
does not show contact details.

The discovery repository selects an explicit public DTO; it does not select user email,
student ID, private membership messages, or member lists. Clubs need admin-assigned
interest tags before a selected-interest filter can match them. Empty states explain
this naturally without substituting example data.

## Performance and limitations

The discovery read is batched: matching clubs and their public related summaries are
loaded in one Prisma query, categories are grouped in one query, and latest events are
resolved for the matched club IDs in one parameterized PostgreSQL query. There is no
per-club read loop. The application uses dynamic reads to keep public events, member
counts, and status changes fresh; result caching is not enabled yet. Ranking is currently
performed across the full filtered active-club set before 12-result pagination, which
is appropriate for the current campus directory but should be revisited if the data
volume grows substantially.
