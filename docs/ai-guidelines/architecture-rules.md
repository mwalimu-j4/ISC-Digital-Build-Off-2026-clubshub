# AI architecture rules

Use module public exports only across module boundaries. Keep route handlers thin,
avoid circular dependencies, and separate infrastructure from domain logic. Prefer
Server Components and server-side authorization. Any proposed architectural change
requires explicit review before implementation.
