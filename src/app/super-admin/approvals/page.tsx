import Link from 'next/link';

import { AdminReviewList } from '@/components/clubs/admin-review-list';
import { requireRole } from '@/lib/auth/authorization';
import { listReviewable } from '@/modules/clubs/service';

export const dynamic = 'force-dynamic';

export default async function SuperAdminApprovalsPage() {
  const user = await requireRole('SUPER_ADMIN');
  const proposals = await listReviewable(user);
  return (
    <main className="admin-content">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">Governance</p>
          <h1 className="admin-display">
            Club <em>approvals</em>
          </h1>
          <p className="admin-lede">
            Review proposals, record a decision, and keep the campus directory trusted.
          </p>
        </div>
        <Link className="admin-secondary-button" href="/super-admin">
          ← Overview
        </Link>
      </div>
      <div className="admin-filter-pills" aria-label="Approval filters">
        <span className="admin-filter-active">
          Pending <b>{proposals.length}</b>
        </span>
        <span>Changes requested</span>
        <span>Approved</span>
        <span>Rejected</span>
      </div>
      <AdminReviewList proposals={proposals} />
    </main>
  );
}
