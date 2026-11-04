# Coding standards

Use strict TypeScript, meaningful names, small single-responsibility functions, and
explicit types at boundaries. Validate external input with Zod. Keep business logic in
services, persistence in repositories, and presentation in components. Prefer server
components and avoid unnecessary client state or effects.

Use shadcn/ui components and semantic theme tokens rather than one-off color values.
The product palette is navy for foundations and surfaces, orange for primary actions
and emphasis, and accessible slate-blue neutrals for text and borders. Keep all new UI
consistent with the tokens in `src/app/globals.css`.

Run ESLint and Prettier before review. Do not use `any`, `console.log`, dead code,
unexplained magic values, ignored errors, or disabled rules without an approved reason.
