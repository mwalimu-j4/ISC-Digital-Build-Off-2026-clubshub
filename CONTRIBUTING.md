# Contributing

## Before opening a change

Read the root README, the relevant architecture documentation, and
[`.github/copilot-instructions.md`](.github/copilot-instructions.md). Keep changes
focused and do not introduce business functionality without an approved design.

## Module contract

Each business module uses:

```text
components/ services/ repositories/ validations/ hooks/ types/ constants/ utils/ index.ts
```

Only `index.ts` is a module's public surface. Other modules must not import internal
files directly. Repositories own persistence, services own business rules, and UI
components remain presentation-focused.

## Workflow

Use a short-lived branch from `main`. Use conventional commit prefixes:
`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, and `security:`.
Pull requests must explain the change, testing performed, and any architectural
impact. Do not commit secrets, local environment files, generated artifacts, or
unreviewed migrations.

## Required checks

Run the checks relevant to the change, at minimum:

```text
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

Add unit or integration tests for new business logic and end-to-end coverage for
critical user journeys once those features exist.
