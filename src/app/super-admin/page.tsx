import Link from 'next/link';

import { requireRole } from '@/lib/auth/authorization';
import { getAdminOverview } from '@/modules/admin-overview';

export const dynamic = 'force-dynamic';

function relativeAge(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  return days > 0 ? `${days} day${days === 1 ? '' : 's'} ago` : 'Today';
}

export default async function SuperAdminOverviewPage() {
  const user = await requireRole('SUPER_ADMIN');
  const overview = await getAdminOverview(user);
  return (
    <main className="admin-content">
      <header className="admin-topbar">
        <div>
          <p className="admin-eyebrow">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <h1 className="admin-display">
            Platform <em>overview</em>
          </h1>
        </div>
        <label className="admin-search">
          <span aria-hidden="true">⌕</span>
          <input aria-label="Search clubs, users, logs" placeholder="Search clubs, users, logs" />
          <kbd>Ctrl K</kbd>
        </label>
      </header>

      <section className="admin-kpi-grid" aria-label="Platform metrics">
        <article className={overview.pendingApprovals ? 'admin-kpi admin-kpi-alert' : 'admin-kpi'}>
          <span>Pending approvals</span>
          <strong>{overview.pendingApprovals}</strong>
          <small>
            {overview.oldestWaitingDays
              ? `Oldest waiting ${overview.oldestWaitingDays} days`
              : 'Queue is clear'}
          </small>
        </article>
        <article className="admin-kpi">
          <span>Active clubs</span>
          <strong>{overview.activeClubs}</strong>
          <small>{overview.newMembersThisMonth} added this month</small>
        </article>
        <article className="admin-kpi">
          <span>Registered students</span>
          <strong>{overview.registeredStudents.toLocaleString()}</strong>
          <small>{overview.newStudentsThisWeek} new this week</small>
        </article>
        <article className="admin-kpi">
          <span>Events this month</span>
          <strong>{overview.eventsThisMonth}</strong>
          <small>{overview.registrationsThisMonth} registrations</small>
        </article>
      </section>

      <section className="admin-feature-grid">
        <article className="admin-panel admin-queue-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-eyebrow">Waiting for you</p>
              <h2>Club approval queue</h2>
            </div>
            <Link href="/super-admin/approvals">Open queue →</Link>
          </div>
          {overview.pending.length === 0 ? (
            <p className="admin-empty">All proposals have been reviewed.</p>
          ) : (
            <div className="admin-queue">
              {overview.pending.map((proposal) => (
                <div className="admin-queue-row" key={proposal.id}>
                  <span className="admin-initial">{proposal.name.charAt(0)}</span>
                  <div>
                    <strong>{proposal.name}</strong>
                    <small>
                      {proposal.category} · submitted {relativeAge(proposal.createdAt)}
                    </small>
                  </div>
                  <span className="admin-chip">{relativeAge(proposal.createdAt)}</span>
                  <Link className="admin-button" href="/super-admin/approvals">
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </article>
        <article className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-eyebrow">Needs attention</p>
              <h2>Governance alerts</h2>
            </div>
          </div>
          {overview.alerts.approvalsOver48Hours > 0 ? (
            <div className="admin-alert-row">
              <div>
                <strong>Approvals waiting over 48h</strong>
                <small>{overview.alerts.approvalsOver48Hours} clubs</small>
              </div>
              <Link href="/super-admin/approvals">View</Link>
            </div>
          ) : (
            <p className="admin-empty">No governance alerts right now.</p>
          )}
          <div className="admin-alert-row">
            <div>
              <strong>Audit activity</strong>
              <small>Recent decisions are recorded</small>
            </div>
            <a href="#audit">View</a>
          </div>
        </article>
      </section>

      <section className="admin-lower-grid" id="analytics">
        <article className="admin-panel">
          <p className="admin-eyebrow">Growth</p>
          <h2>New members by month</h2>
          <div className="admin-bars" aria-label="New members by month">
            {overview.memberTrend.map((month) => (
              <div className="admin-bar-column" key={month.label}>
                <div
                  className="admin-bar"
                  style={{ height: `${Math.max(8, month.count * 12)}px` }}
                  title={`${month.count} new members`}
                />
                <small>{month.label}</small>
              </div>
            ))}
          </div>
        </article>
        <article className="admin-panel">
          <p className="admin-eyebrow">Categories</p>
          <h2>Clubs by category</h2>
          {overview.categories.length === 0 ? (
            <p className="admin-empty">No active clubs yet.</p>
          ) : (
            overview.categories.map((category) => (
              <div className="admin-category-row" key={category.name}>
                <div>
                  <span>{category.name}</span>
                  <b>{category.count}</b>
                </div>
                <i>
                  <span
                    style={{
                      width: `${Math.max(8, (category.count / (overview.categories[0]?.count ?? 1)) * 100)}%`,
                    }}
                  />
                </i>
              </div>
            ))
          )}
        </article>
        <article className="admin-panel" id="audit">
          <p className="admin-eyebrow">Audit log</p>
          <h2>Latest decisions</h2>
          {overview.decisions.length === 0 ? (
            <p className="admin-empty">No decisions recorded yet.</p>
          ) : (
            overview.decisions.map((decision) => (
              <div className="admin-decision" key={decision.id}>
                <strong>{decision.action.replaceAll('_', ' ').toLowerCase()}</strong>
                <small>
                  {decision.actor?.fullName ?? 'System'} · {relativeAge(decision.createdAt)}
                </small>
              </div>
            ))
          )}
          <a className="admin-inline-link" href="#audit">
            Open full audit log →
          </a>
        </article>
      </section>
    </main>
  );
}
