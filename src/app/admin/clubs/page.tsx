import { AdminReviewList } from '@/components/clubs/admin-review-list';
import { requireRole } from '@/lib/auth/authorization';
import { listReviewable } from '@/modules/clubs/service';

export const dynamic = 'force-dynamic';

export default async function AdminClubsPage() {
  const user = await requireRole('SUPER_ADMIN');
  const clubs = await listReviewable(user);
  return (
    <main className="site-container" style={{ paddingBlock: '4rem' }}>
      <p className="eyebrow">Oversight</p>
      <h1>Club proposals</h1>
      <AdminReviewList proposals={clubs} />
    </main>
  );
}
