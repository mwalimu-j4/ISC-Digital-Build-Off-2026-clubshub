# Coding standards

Use strict TypeScript, meaningful names, small single-responsibility functions, and
explicit types at boundaries. Validate external input with Zod. Keep business logic in
services, persistence in repositories, and presentation in components. Prefer server
components and avoid unnecessary client state or effects.

Run ESLint and Prettier before review. Do not use `any`, `console.log`, dead code,
unexplained magic values, ignored errors, or disabled rules without an approved reason.
