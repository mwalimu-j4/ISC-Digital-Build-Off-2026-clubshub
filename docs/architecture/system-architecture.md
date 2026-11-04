# System architecture

The system is a Next.js App Router modular monolith. Server Components are the
default; Client Components are limited to interactions that require a browser.
Routes compose module services and presentation components, while persistence remains
behind repositories. PostgreSQL is the planned durable store.

Security-sensitive decisions, authorization, and validation are server-side concerns.
The application will be designed for students, club administrators, and super
administrators without exposing secrets or private environment values to the client.
