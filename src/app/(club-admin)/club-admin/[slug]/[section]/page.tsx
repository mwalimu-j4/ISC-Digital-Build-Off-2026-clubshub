import Link from 'next/link';

import { requireUser } from '@/lib/auth/authorization';
import { clubAdminSlugSchema } from '@/modules/club-admin-overview/validations/club-admin-schema';

const sectionLabels: Record<string, string> = {
  requests: 'Join requests',
  members: 'Members and roles',
  events: 'Events and check-in',
  publishing: 'Publish studio',
  showcase: 'Showcase',
  polls: 'Polls and roles',
  certificates: 'Certificates',
  analytics: 'Analytics',
  profile: 'Club profile',
};

export const dynamic = 'force-dynamic';

export default async function ClubAdminSectionPage({
  params,
}: {
  params: Promise<{ slug: string; section: string }>;
}) {
  await requireUser();
  const { slug, section } = await params;
  const parsedSlug = clubAdminSlugSchema.parse(slug);
  const label = sectionLabels[section];

  if (!label) {
    return (
      <div className="club-admin-content">
        <p className="club-admin-eyebrow">Club admin</p>
        <h1 className="club-admin-display">Page not found</h1>
        <Link className="club-admin-navy-button" href={`/club-admin/${parsedSlug}`}>
          Back to overview
        </Link>
      </div>
    );
  }

  return (
    <div className="club-admin-content">
      <p className="club-admin-eyebrow">Club admin</p>
      <h1 className="club-admin-display">{label}</h1>
      <section className="club-admin-panel club-admin-section-placeholder">
        <h2>This section is not part of the current demo.</h2>
        <p className="club-admin-muted">
          The overview is live with your club&apos;s real membership, event, announcement, and
          activity data. This workspace will be enabled as its supporting workflow is added.
        </p>
        <Link className="club-admin-navy-button" href={`/club-admin/${parsedSlug}`}>
          Back to club admin
        </Link>
      </section>
    </div>
  );
}
