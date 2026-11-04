# ClubsHub

ClubsHub is a planned platform for organizing university clubs, memberships, events,
announcements, notifications, and lost-and-found workflows. This repository currently
contains the professional engineering foundation only; no business features are
implemented or operational.

## Stack and architecture

- Next.js App Router with React and TypeScript strict mode
- PostgreSQL and Prisma (planned database layer)
- Tailwind CSS and shadcn/ui (planned presentation system)
- Zod for external input validation
- ESLint, Prettier, Vitest, Testing Library, and Playwright
- Modular monolith with route composition, isolated business modules, shared UI, and
  infrastructure layers

See [`docs/architecture/`](docs/architecture/) and [`docs/project/technology-stack.md`](docs/project/technology-stack.md).

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

`src/app` contains routing and composition only. `src/modules` will contain isolated
business modules following the documented module contract. `src/components` contains
reusable presentation components, `src/lib` contains shared infrastructure, `prisma`
contains database artifacts, and `tests` is split by test level.

## Engineering standards

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`.github/copilot-instructions.md`](.github/copilot-instructions.md)
before contributing. Architectural consistency, server-side authorization, input
validation, explicit module boundaries, and verified changes take priority over speed.

## Project status

The foundation is ready for approved feature work. Authentication, database models,
API implementations, dashboards, and other domain functionality intentionally remain
unimplemented.
