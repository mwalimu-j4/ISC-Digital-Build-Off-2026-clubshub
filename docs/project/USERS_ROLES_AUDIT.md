# Users and roles audit

| Feature                    | Status  | Evidence                                                                                                    | Action                                                                        |
| -------------------------- | ------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Super-admin layout         | EXISTS  | `src/app/super-admin/layout.tsx` and `src/components/admin/admin-shell.tsx`                                 | Reuse shell; add active users link                                            |
| Admin users page           | MISSING | No `/super-admin/users` route existed                                                                       | Add route and responsive page                                                 |
| User services/repositories | MISSING | No users module existed                                                                                     | Add isolated module with DTO queries and services                             |
| Audit-logs module          | PARTIAL | `src/lib/auth/audit.ts` provides `recordAuditLog`; no standalone UI module                                  | Reuse helper for transactional user actions                                   |
| Shared admin components    | PARTIAL | Admin shell, CSS panels and skeleton primitive exist; named KPI/table/filter/dialog/empty components do not | Reuse existing shell and CSS; add page-local accessible controls              |
| Session revocation         | PARTIAL | Auth uses JWT and has no persisted session table                                                            | Enforce status on sign-in and JWT refresh; no unsupported session store added |
| Database suspension fields | MISSING | User model had status but no suspension metadata                                                            | Add nullable fields and additive indexes                                      |
