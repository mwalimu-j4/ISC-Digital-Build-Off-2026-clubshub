import Link from 'next/link';

import { UserActions } from '@/components/admin/users-actions';
import { requireRole } from '@/lib/auth/authorization';
import { getUserDetail, listUsers } from '@/modules/users';
import { usersQuerySchema } from '@/modules/users/validations/users-schema';

import { changeRoleAction, reactivateUserAction, suspendUserAction } from './actions';

export const dynamic = 'force-dynamic';

type SearchParams = Record<string, string | string[] | undefined>;

function value(params: SearchParams, key: string) {
  const result = params[key];
  return Array.isArray(result) ? result[0] : result;
}

function roleLabel(role: string, isClubAdmin: boolean) {
  if (isClubAdmin) return 'Club admin';
  if (role === 'SUPER_ADMIN') return 'Super admin';
  if (role === 'RECOVERY_OFFICER') return 'Recovery officer';
  return 'Student';
}

function statusLabel(status: string) {
  return status === 'SUSPENDED' ? 'Suspended' : 'Active';
}

function UserAvatar({ name, src }: { name: string; src: string | null }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt="" className="users-avatar" src={src} />
  ) : (
    <span aria-hidden="true" className="users-avatar users-avatar-initial">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const actor = await requireRole('SUPER_ADMIN');
  const params = await searchParams;
  const query = usersQuerySchema.parse({
    q: value(params, 'q'),
    role: value(params, 'role'),
    status: value(params, 'status'),
    sort: value(params, 'sort'),
    page: value(params, 'page'),
    user: value(params, 'user'),
  });
  const [data, selected] = await Promise.all([
    listUsers(actor, query),
    query.user ? getUserDetail(actor, query.user) : Promise.resolve(null),
  ]);
  const pageCount = Math.max(1, Math.ceil(data.total / 10));
  const makeUrl = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    if (query.q) next.set('q', query.q);
    if (query.role !== 'ALL') next.set('role', query.role);
    if (query.status !== 'ALL') next.set('status', query.status);
    if (query.sort !== 'newest') next.set('sort', query.sort);
    if (query.page > 1) next.set('page', String(query.page));
    if (query.user) next.set('user', query.user);
    Object.entries(changes).forEach(([key, item]) => {
      if (item) next.set(key, item);
      else next.delete(key);
    });
    return `/super-admin/users?${next.toString()}`;
  };

  return (
    <main className="admin-content users-page">
      <header className="users-header">
        <div>
          <p className="admin-eyebrow">People on the platform</p>
          <h1 className="admin-display">
            Users and <em>roles</em>
          </h1>
          <p className="admin-lede">
            Find anyone, see what they belong to, and step in when something goes wrong.
          </p>
        </div>
      </header>

      <section aria-label="User summary" className="users-summary">
        <span>{data.counts.students.toLocaleString()} students</span>
        <span>{data.counts.clubAdmins.toLocaleString()} club admins</span>
        <span>{data.counts.superAdmins.toLocaleString()} super admins</span>
        <span className={data.counts.suspended > 0 ? 'users-summary-alert' : ''}>
          {data.counts.suspended.toLocaleString()} suspended
        </span>
      </section>

      <div className="users-layout">
        <section aria-label="Platform users" className="users-list-card">
          <form className="users-filters" method="get">
            <label className="users-search">
              <span aria-hidden="true">⌕</span>
              <input defaultValue={query.q} name="q" placeholder="Search by name or email" />
            </label>
            <label>
              <span className="sr-only">Role</span>
              <select defaultValue={query.role} name="role">
                <option value="ALL">Role: All</option>
                <option value="STUDENT">Role: Student</option>
                <option value="CLUB_ADMIN">Role: Club admin</option>
                <option value="SUPER_ADMIN">Role: Super admin</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Status</span>
              <select defaultValue={query.status} name="status">
                <option value="ALL">Status: All</option>
                <option value="ACTIVE">Status: Active</option>
                <option value="SUSPENDED">Status: Suspended</option>
              </select>
            </label>
            <input name="sort" type="hidden" value={query.sort} />
            <button className="users-filter-submit" type="submit">
              Apply
            </button>
          </form>
          <div className="users-rows">
            {data.users.length === 0 ? (
              <p className="users-empty">No users found.</p>
            ) : (
              data.users.map((user) => (
                <Link
                  className={`users-row${selected?.id === user.id ? ' users-row-selected' : ''}`}
                  href={makeUrl({ user: user.id, page: undefined })}
                  key={user.id}
                >
                  <UserAvatar name={user.fullName} src={user.avatarUrl} />
                  <span className="users-row-copy">
                    <strong>{user.fullName}</strong>
                    <small>
                      {user.email} · {user.clubCount} clubs
                    </small>
                  </span>
                  <span
                    className={`users-chip users-role-${user.isClubAdmin ? 'club_admin' : user.role.toLowerCase()}`}
                  >
                    {roleLabel(user.role, user.isClubAdmin)}
                  </span>
                  <span className={`users-chip users-status-${user.status.toLowerCase()}`}>
                    {statusLabel(user.status)}
                  </span>
                </Link>
              ))
            )}
          </div>
          <footer className="users-footer">
            <span>
              Showing {data.users.length} of {data.total}
            </span>
            <span>
              Page {query.page} of {pageCount}
            </span>
            {query.page < pageCount ? (
              <Link href={makeUrl({ page: String(query.page + 1) })}>Next →</Link>
            ) : null}
          </footer>
        </section>

        <aside aria-label="Selected user" className="users-detail-card">
          {selected ? (
            <>
              <Link className="users-back-link" href={makeUrl({ user: undefined })}>
                ← Back to users
              </Link>
              <p className="admin-eyebrow">Selected user</p>
              <div className="users-detail-heading">
                <UserAvatar name={selected.fullName} src={selected.avatarUrl} />
                <div>
                  <h2>{selected.fullName}</h2>
                  <p>{selected.email}</p>
                  <small>Joined {selected.createdAt.toLocaleDateString()}</small>
                </div>
              </div>
              <p className="users-detail-label">Belongs to</p>
              {selected.memberships.length === 0 ? (
                <p className="users-muted">No club memberships.</p>
              ) : (
                <ul className="users-memberships">
                  {selected.memberships.map((membership) => (
                    <li key={membership.id}>
                      <Link href={`/clubs/${membership.clubSlug}`}>{membership.clubName}</Link>
                      <span>
                        {membership.role === 'CLUB_ADMIN'
                          ? 'Club admin'
                          : membership.status.charAt(0) + membership.status.slice(1).toLowerCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="users-registration">
                Registration number: {selected.studentRegistrationId}
                <br />
                Visible to super admins only.
              </p>
              <UserActions
                changeRole={changeRoleAction}
                reactivate={reactivateUserAction}
                role={
                  selected.role === 'SUPER_ADMIN' || selected.role === 'STUDENT'
                    ? selected.role
                    : null
                }
                status={selected.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE'}
                suspend={suspendUserAction}
                updatedAt={selected.updatedAt.toISOString()}
                userId={selected.id}
              />
              <p className="users-detail-note">
                Suspending needs a written reason and is saved to the audit log. Club admin roles
                are given inside each club, not here.
              </p>
            </>
          ) : (
            <p className="users-empty">Pick a user to see their details and take action.</p>
          )}
        </aside>
      </div>
    </main>
  );
}
