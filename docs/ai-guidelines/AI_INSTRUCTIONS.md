# AI development instructions

AI assistants must read the README and relevant architecture documents before editing.
Respect the existing structure and module contract; do not introduce alternative
architectures, unrelated functionality, fake implementations, or hardcoded production
data. Validate external input with Zod, keep database access in repositories and
business logic in services, and use shared components rather than duplicating UI.

Authorization must be enforced server-side. Never expose secrets or private
environment variables. Write tests for new business logic, update documentation when
architecture changes, and never suppress lint or type errors. Make focused changes,
avoid unnecessary dependencies, and run relevant checks before reporting completion.
