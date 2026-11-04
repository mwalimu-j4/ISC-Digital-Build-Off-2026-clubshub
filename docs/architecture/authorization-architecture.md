# Authorization architecture

Authorization will use server-side role-based access control for students, club
administrators, and super administrators. Each protected operation must verify the
authenticated identity and resource-level permissions on the server. Hiding a button
or route in the frontend is never sufficient authorization.

Policy decisions should be centralized, tested, and auditable. This document does not
implement roles or permissions.
