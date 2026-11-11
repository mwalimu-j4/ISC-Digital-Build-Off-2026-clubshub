import Link from 'next/link';
import { notFound } from 'next/navigation';

import { updateAnnouncementAction } from '@/app/(club-admin)/club-admin/[slug]/announcements-actions';
import { ClubAdminAnnouncementForm } from '@/components/club-admin/announcement-form';
import { requireUser } from '@/lib/auth/authorization';
import { listClubAnnouncements } from '@/modules/announcements';

export default async function EditClubAdminAnnouncementPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; announcementId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { slug, announcementId } = await params;
  const { error } = await searchParams;
  const announcements = await listClubAnnouncements(user, slug);
  const announcement = announcements.find((item) => item.id === announcementId);

  if (!announcement) {
    notFound();
  }

  return (
    <div className="club-admin-content club-admin-editor-page">
      <Link className="club-admin-back-link" href={`/club-admin/${slug}/announcements`}>
        ← Back to announcements
      </Link>
      <p className="club-admin-eyebrow">Announcements</p>
      <h1 className="club-admin-display">
        Edit <em>announcement</em>
      </h1>
      <section className="club-admin-panel club-admin-event-editor">
        <ClubAdminAnnouncementForm
          action={updateAnnouncementAction}
          error={error}
          submitLabel="Update announcement"
          values={{
            announcementId: announcement.id,
            audience: announcement.audience,
            body: announcement.body,
            clubId: announcement.clubId ?? '',
            pinned: announcement.pinned,
            slug,
            title: announcement.title,
          }}
        />
      </section>
    </div>
  );
}
