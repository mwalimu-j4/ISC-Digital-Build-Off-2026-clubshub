# Product and architecture decisions

## 2026-11-04 — Stage 1 remains presentation-only

The first product increment establishes the shell and product language without
inventing backend behavior. This keeps the UX reviewable while preserving the agreed
modular architecture and scope boundary.

## 2026-11-04 — Mobile-first responsive shell

The public experience starts from a compact layout and progressively enhances for
tablet and desktop. Campus discovery needs to be useful on phones, where students are
most likely to encounter events and communities.

## 2026-11-04 — Restrained institutional visual language

ClubsHub uses deep navy foundations and surfaces with orange primary actions and
accessible slate-blue neutrals. This matches the approved visual direction, gives the
product a confident institutional identity, and keeps hierarchy clear.

## 2026-11-04 — Enforced shadcn/ui semantic palette

All UI uses shadcn/ui conventions and the semantic tokens in `src/app/globals.css`.
Future components must consume those tokens rather than introduce arbitrary colors,
so the visual system remains consistent across every development stage.

## 2026-11-04 — Anchors instead of dead links

Stage 1 navigation points to implemented page sections or clearly marked future
anchors. No fake submission, authentication, or workflow buttons were added.
