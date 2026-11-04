# ClubsHub AI engineering contract

Before making changes, read the root README and relevant architecture documentation.
Respect the existing directory structure and module contract; never introduce an
alternative architecture without approval or combine unrelated functionality in one
module.

Use strict TypeScript and follow ESLint and Prettier. Validate every external input
with Zod. Keep database operations in repositories, business logic in services, and
UI in reusable shared or module components. Enforce authorization on the server side;
frontend visibility is not authorization.

Never expose secrets, credentials, or private environment variables. Write tests for
new business logic and update documentation when architectural decisions change.
Never suppress lint or type errors, add unnecessary dependencies, modify unrelated
files, use fake implementations, or hardcode production data. Run relevant lint,
format, typecheck, tests, and build checks before declaring work complete.
