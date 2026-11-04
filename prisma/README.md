# Database foundation

ClubsHub will use PostgreSQL with Prisma. No application models or migrations are
defined yet. The database design is documented in
[`docs/architecture/database-architecture.md`](../docs/architecture/database-architecture.md).

When the first approved model is introduced, keep schema changes in `prisma/schema.prisma`,
review generated migrations, and never commit local database files or credentials.
