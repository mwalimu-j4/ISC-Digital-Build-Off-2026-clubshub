import Link from 'next/link';

import { JoinRequestDecisionForm } from '@/components/club-admin/join-request-decision-form';
import { requireUser } from '@/lib/auth/authorization';
import { getClubAdminOverview } from '@/modules/club-admin-overview';
import { listRequests } from '@/modules/join-requests';

import { decideAction } from './actions';

export const dynamic = 'force-dynamic';

function relativeTime(date: Date) {
  const hours = Math.max(0, Math.floor((Date.now() - date.getTime()) / 3_600_000));
  return hours < 24 ? `${hours || 1}h waiting` : `${Math.floor(hours / 24)}d waiting`;
}

export default async function JoinRequestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string; selected?: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const query = await searchParams;
  const overview = await getClubAdminOverview(user, slug);
  const status =
    query.status === 'APPROVED' || query.status === 'REJECTED' ? query.status : 'PENDING';
  const result = await listRequests(user, overview.id, status);
  const selected =
    result.requests.find((request) => request.id === query.selected) ?? result.requests[0];
  const counts = new Map(result.counts.map((item) => [item.status, item._count._all]));

  return (
    <div className="club-admin-content">
      <header className="club-admin-header join-requests-header">
        <div>
          <p className="club-admin-eyebrow">Club admin · {overview.name}</p>
          <h1 className="club-admin-display">
            Join <em>requests</em>
          </h1>
          <p className="club-admin-muted">
            Review applications and welcome the right people into your club.
          </p>
        </div>
      </header>
      <nav aria-label="Request status" className="club-admin-event-filters">
        {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((filter) => (
          <Link
            className={status === filter ? 'active' : ''}
            href={`/club-admin/${slug}/requests?status=${filter}`}
            key={filter}
          >
            {filter === 'PENDING' ? 'Pending' : filter === 'APPROVED' ? 'Approved' : 'Rejected'} (
            {counts.get(filter) ?? 0})
          </Link>
        ))}
      </nav>
      <div className="join-requests-layout">
        <section className="join-request-list" aria-label="Applicants">
          {result.requests.length === 0 ? (
            <div className="club-admin-panel join-request-empty">
              <h2>
                {status === 'PENDING'
                  ? 'No pending requests'
                  : `No ${status.toLowerCase()} requests`}
              </h2>
              <p className="club-admin-muted">
                {status === 'PENDING'
                  ? 'You are all caught up.'
                  : 'Reviewed requests will appear here.'}
              </p>
            </div>
          ) : (
            result.requests.map((request) => (
              <Link
                className={`join-request-list-item${selected?.id === request.id ? ' selected' : ''}`}
                href={`/club-admin/${slug}/requests?status=${status}&selected=${request.id}`}
                key={request.id}
              >
                <span className="join-request-avatar">
                  {(request.fullName ?? request.user.fullName).charAt(0).toUpperCase()}
                </span>
                <span className="join-request-list-copy">
                  <strong>{request.fullName ?? request.user.fullName}</strong>
                  <small>
                    {request.department ?? 'Details not provided'} ·{' '}
                    {request.major ?? 'Details not provided'}
                  </small>
                </span>
                <span className="join-request-time">{relativeTime(request.appliedAt)}</span>
              </Link>
            ))
          )}
        </section>
        {selected ? (
          <section className="club-admin-panel join-request-review" aria-label="Request review">
            <div className="join-request-review-heading">
              <span className="join-request-avatar large">
                {(selected.fullName ?? selected.user.fullName).charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="club-admin-eyebrow">Application</p>
                <h2>{selected.fullName ?? selected.user.fullName}</h2>
                <p className="club-admin-muted">
                  Requested {selected.appliedAt.toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="join-request-detail-grid">
              <div>
                <span>School ID</span>
                <strong>••••••••</strong>
                <small>Private and admin-only</small>
              </div>
              <div>
                <span>Department</span>
                <strong>{selected.department ?? 'Details not provided'}</strong>
              </div>
              <div>
                <span>Major</span>
                <strong>{selected.major ?? 'Details not provided'}</strong>
              </div>
              <div>
                <span>Year</span>
                <strong>{selected.yearOfStudy ?? 'Details not provided'}</strong>
              </div>
            </div>
            <div className="join-request-message">
              <p className="club-admin-eyebrow">Message</p>
              <p>{selected.message ?? 'Details not provided'}</p>
            </div>
            {status === 'PENDING' ? (
              <JoinRequestDecisionForm action={decideAction} requestId={selected.id} slug={slug} />
            ) : (
              <div className="join-request-decision-summary">
                <strong>{status === 'APPROVED' ? 'Approved' : 'Rejected'}</strong>
                <p>{selected.decisionNote ?? selected.decisionReason ?? 'No note provided.'}</p>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
