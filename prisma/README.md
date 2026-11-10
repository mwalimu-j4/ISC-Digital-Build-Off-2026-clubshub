# Database foundation

ClubsHub uses PostgreSQL with Prisma. The schema is split into readable domain files
inside this directory and is compiled into one Prisma Client:

- `schema.prisma` contains the datasource and generator.
- `enums.prisma` contains shared controlled values.
- `user.prisma`, `club.prisma`, `membership.prisma`, and `audit-log.prisma` contain
  the Stage 02 models.
- `interests.prisma` models shared discovery interests and their club/user joins.

Schema changes belong in reviewed migrations under `migrations/`. Run
`pnpm db:validate` and `pnpm db:generate` after schema changes. Use
`pnpm db:migrate:deploy` to apply committed migrations to a reachable PostgreSQL
database.

`DATABASE_URL` is the runtime connection string. `DIRECT_URL` should be an unpooled
Neon connection for migration tooling when the deployment provider supplies pooled
connections. Vercel Preview builds generate Prisma and build the app without running
migrations or seeding a super-admin; only Production builds need `DIRECT_URL` and run
database writes. Configure `DATABASE_URL` for any deployment whose app needs database
access. Never commit either value.
