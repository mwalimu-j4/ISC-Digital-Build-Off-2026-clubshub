# Modular architecture

ClubsHub uses a modular monolith. `src/app` owns routing and composition, `src/modules`
owns business capabilities, `src/components` owns reusable presentation, and `src/lib`
owns shared infrastructure. Modules are independently understandable but deploy as one
application.

## Module contract

Every business module follows:

```text
example-module/
├── components/
├── services/
├── repositories/
├── validations/
├── hooks/
├── types/
├── constants/
├── utils/
└── index.ts
```

Repositories handle persistence, services implement business rules, validations parse
external input with Zod, and `index.ts` is the explicit public API. Cross-module code
uses public interfaces only. Avoid circular dependencies and direct database access
from components.
