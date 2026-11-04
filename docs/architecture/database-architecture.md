# Database architecture

PostgreSQL and Prisma are the planned persistence stack. Models will use normalized
relational design, explicit foreign keys, unique constraints for business invariants,
and indexes based on measured query patterns. Referential actions and nullability must
be intentional.

Repositories own Prisma access. Multi-record changes use transactions, and all schema
changes are reviewed migrations. Credentials stay in environment variables; local
database files and dumps are ignored. No application models or migrations exist yet.
