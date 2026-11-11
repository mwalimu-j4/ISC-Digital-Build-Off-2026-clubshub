import { requireRole } from '@/lib/auth/authorization';
import { listStudentAnnouncements } from '@/modules/announcements';

export default async function StudentAnnouncementsPage() {
  const user = await requireRole('STUDENT');
  const announcements = await listStudentAnnouncements(user);
  return (
    <div className="space-y-8">
      <section>
        <p className="eyebrow">Stay in the loop</p>
        <h1 className="mt-2 text-3xl font-semibold">Announcements</h1>
        <p className="mt-2 text-muted-foreground">
          Updates from your clubs and the wider university community.
        </p>
      </section>
      {announcements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">No announcements yet. Club announcements appear here after you join a club.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <article key={announcement.id} className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-primary">
                  {announcement.club?.name ?? 'University-wide'}
                </p>
                <time className="text-xs text-muted-foreground">
                  {announcement.createdAt.toLocaleDateString()}
                </time>
              </div>
              <h2 className="mt-2 text-xl font-semibold">{announcement.title}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {announcement.body}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Posted by {announcement.author.fullName}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
