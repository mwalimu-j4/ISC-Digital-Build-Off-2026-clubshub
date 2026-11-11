# Clubs for You Refactor Audit

## Current implementation

| Piece                      | Current location                                                 | Current use and issue                                                                                                                                                                |
| -------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Landing discovery section  | `src/app/page.tsx` (`LandingContent`)                            | Renders the interest panel, fallback banner, heading, filters, separate featured/compact grids, empty state, and page link. The controls are cramped and require an explicit submit. |
| Interest picker            | `src/components/landing/interest-picker.tsx`                     | Server-rendered checkbox chips with a server action and explicit “Show matching clubs” submit.                                                                                       |
| Club card                  | `src/components/landing/club-discovery-card.tsx`                 | Has `featured` and `compact` variants. Only the landing page imports it; the two variants hide different data and have different dimensions.                                         |
| Filters and category chips | `src/app/page.tsx` and discovery styles in `src/app/globals.css` | Sort, verification, and category select share a cramped form with an “Update results” button; category links are separate.                                                           |
| Fallback notice            | `src/app/page.tsx`                                               | Conditional on `discovery.usingFallbackData`, but uses the same yellow notice style as invalid links and sits above the interest editor rather than beside results.                  |
| Student Discover clubs     | `src/app/(student)/student/clubs/page.tsx`                       | Uses separate inline cards with student-specific membership status and a server-side join action. It does not import the landing card today.                                         |

The live `site-container` is shared by landing sections and caps at 1160px with 32px side padding. The root layout loads Inter and Instrument Serif; `body` uses Inter. The discovery CSS currently creates a three-column featured grid and a separate four-column compact grid. There are no other imports of `ClubDiscoveryCard`.

## Refactor plan

1. Keep the existing discovery query, recommendation service, event data, URL filter names, membership status, and join flows unchanged.
2. Replace the featured/compact card variants with one equal-height `ClubCard` layout. Use it for landing recommendations and adapt the existing student club data/actions to the same visual component without changing student join or membership behavior.
3. Put selected-interest removal, sort, verified-only, and counted category choices in a spacious two-row control panel. Keep a server-rendered form fallback; enhance controls with immediate client navigation, preserved scroll, URL updates, and a pending state.
4. Render featured and regular cards in one responsive grid, with Featured as a badge only. Use consistent type sizes, reserved content rows, and bottom-aligned actions.
5. Render the fallback notice only for `usingFallbackData`, next to the results, with neutral blue styling. Preserve the empty states and pagination.
6. Add focused rendering and interaction coverage, then run format, lint, typecheck, unit/e2e tests, and the production build. Record any environment-limited checks accurately.

## Implemented

- Replaced the landing page's featured and compact card components with one shared
  responsive card used by both public discovery and the student club list.
- Preserved the student list's membership labels and server-side join action, as well
  as the landing discovery service, URL filters, fallback signal, and page navigation.
- Interest changes and selected-chip removals now persist through the existing account
  preference or HttpOnly-cookie path; the server action continues to support no-JavaScript
  submissions.
- Added responsive filter controls, category counts, a blue fallback notice, reserved
  card content rows, consistent typography, and a pending-state skeleton.
- Added focused unit coverage for the shared card's optional and populated states and
  member-count formatting.

## Validation

- `pnpm typecheck`: passed.
- `pnpm exec vitest run tests/unit/club-card.test.tsx tests/unit/discovery.test.ts`:
  passed (12 tests).
- Focused ESLint: passed.
- `pnpm run build:app`: passed, including the full Next.js lint and type validation.
  Existing `<img>` performance warnings remain in Lost & Found components.
- `pnpm test`: passed (41 tests across 10 files).
- Changed source and documentation files pass Prettier. The repository-wide formatter
  reports 49 unchanged files outside this refactor.
- GitHub Actions could not start the PR quality job because GitHub reports an account
  billing lock; local checks passed.
- Browser screenshots, Lighthouse, and Playwright end-to-end tests were not run during
  this implementation.
