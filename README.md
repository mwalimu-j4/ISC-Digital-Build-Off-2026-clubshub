# ClubsHub

ClubsHub is a planned platform for organizing university clubs, memberships, events,
announcements, notifications, and lost-and-found workflows. The repository currently contains the Stage 1 product foundation and responsive UX
shell. Business features are not implemented or operational.

## Stack and architecture

- Next.js App Router with React and TypeScript strict mode
- PostgreSQL and Prisma (planned database layer)
- Tailwind CSS and shadcn/ui conventions with semantic design tokens
- Zod for external input validation
- ESLint, Prettier, Vitest, Testing Library, and Playwright
- Modular monolith with route composition, isolated business modules, shared UI, and
  infrastructure layers

The approved visual system uses deep navy foundations and surfaces, orange primary
actions and emphasis, and slate-blue semantic neutrals. UI work must use the shadcn/ui
semantic tokens defined in [`src/app/globals.css`](src/app/globals.css); do not add
unrelated palettes or one-off color literals.

See [`docs/architecture/`](docs/architecture/) and [`docs/project/technology-stack.md`](docs/project/technology-stack.md).
Read the [product requirements](docs/product/product-requirements.md), [roadmap](docs/project/ROADMAP.md),
and [current project status](docs/project/PROJECT_STATUS.md) before contributing.

## Development setup

1. Install Node.js 20+ and pnpm 10.
2. Install dependencies: `pnpm install`.
3. Copy `.env.example` to `.env.local` and provide local values when database work begins.
4. Start the development server: `pnpm dev`.

Available quality commands:

```text
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

## Repository structure

`src/app` contains routing and composition only. `src/components/shared` contains the
visual shell. `src/modules` will contain isolated
business modules following the documented module contract. `src/components` contains
reusable presentation components, `src/lib` contains shared infrastructure, `prisma`
contains database artifacts, and `tests` is split by test level.

## Engineering standards

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`.github/copilot-instructions.md`](.github/copilot-instructions.md)
before contributing. Architectural consistency, server-side authorization, input
validation, explicit module boundaries, and verified changes take priority over speed.

## Project status

Stage 1 is complete and ready for product review. Authentication, database models,
API implementations, dashboards, and other domain functionality intentionally remain
unimplemented until later approved stages.
