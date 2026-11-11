import Link from 'next/link';

import { createAnnouncementAction } from '@/app/(club-admin)/club-admin/[slug]/announcements-actions';
import { ClubAdminAnnouncementForm } from '@/components/club-admin/announcement-form';
import { requireUser } from '@/lib/auth/authorization';
import { getClubAdminOverview } from '@/modules/club-admin-overview';

export default async function NewClubAdminAnnouncementPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { slug } = await params;
  const { error } = await searchParams;
  const overview = await getClubAdminOverview(user, slug);

  return (
    <div className="club-admin-content club-admin-editor-page">
      <Link className="club-admin-back-link" href={`/club-admin/${slug}/announcements`}>
        ← Back to announcements
      </Link>
      <p className="club-admin-eyebrow">Announcements</p>
      <h1 className="club-admin-display">
        New <em>announcement</em>
      </h1>
      <section className="club-admin-panel club-admin-event-editor">
        <ClubAdminAnnouncementForm
          action={createAnnouncementAction}
          error={error}
          submitLabel="Save announcement"
          values={{ clubId: overview.id, slug }}
        />
      </section>
    </div>
  );
}
