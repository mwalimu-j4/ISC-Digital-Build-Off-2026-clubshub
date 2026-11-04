# Authentication architecture

Authentication will use secure account credentials and server-managed sessions. Student
identity verification will be a separate, auditable step. Session cookies must be
secure, HTTP-only, appropriately scoped, and invalidated on sign-out or compromise.

This document is a design boundary only; no authentication functionality is implemented.
