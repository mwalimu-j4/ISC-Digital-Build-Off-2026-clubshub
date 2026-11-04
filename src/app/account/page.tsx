import { requireUser } from '@/lib/auth/authorization';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const user = await requireUser();
  const displayName = user.name ?? user.email ?? 'ClubsHub member';

  return (
    <main className="account-page site-container">
      <p className="eyebrow">Your account</p>
      <h1>Welcome, {displayName}.</h1>
      <p className="account-lede">
        Your ClubsHub account is ready. This profile was created securely from your authenticated
        university account.
      </p>
      <section className="account-card" aria-labelledby="account-details">
        <h2 id="account-details">Profile details</h2>
        <dl>
          <div>
            <dt>Name</dt>
            <dd>{displayName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Access level</dt>
            <dd>{user.role === 'SUPER_ADMIN' ? 'Super administrator' : 'Student'}</dd>
          </div>
          <div>
            <dt>Account status</dt>
            <dd>{user.status === 'ACTIVE' ? 'Active' : user.status}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
