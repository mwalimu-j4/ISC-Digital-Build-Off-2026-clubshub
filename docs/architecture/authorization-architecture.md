# Authorization architecture

Authorization will use server-side role-based access control for students, club
administrators, and super administrators. Each protected operation must verify the
authenticated identity and resource-level permissions on the server. Hiding a button
or route in the frontend is never sufficient authorization.

Policy decisions should be centralized, tested, and auditable. This document does not
implement roles or permissions.

Super-admin user management re-checks `SUPER_ADMIN` in the page and service layer.
Only `STUDENT` and `SUPER_ADMIN` are assignable as global roles; club-admin access
remains an approved per-club membership. Suspension changes the persisted user
status and is checked by the authentication callbacks before a session is accepted.
