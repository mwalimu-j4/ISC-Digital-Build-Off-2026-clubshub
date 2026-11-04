# Testing strategy

- `tests/unit`: isolated functions and components.
- `tests/integration`: module services, repositories, and boundary interactions.
- `tests/e2e`: critical journeys through the running application.
- `tests/fixtures`: reusable test-only data and setup.

Vitest uses a jsdom environment and V8 coverage. Playwright runs browser tests against
the local Next.js server. Do not add fake passing tests; tests must verify behavior.
