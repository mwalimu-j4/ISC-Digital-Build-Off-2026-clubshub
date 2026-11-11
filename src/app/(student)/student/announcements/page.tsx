import { Bell, CalendarDays, Megaphone, Pin, Users } from 'lucide-react';

import { requireRole } from '@/lib/auth/authorization';
import { listStudentAnnouncements } from '@/modules/announcements';

export default async function StudentAnnouncementsPage() {
  const user = await requireRole('STUDENT');
  const announcements = await listStudentAnnouncements(user);
  const pinnedAnnouncement = announcements.find((announcement) => announcement.pinned);
  const regularAnnouncements = announcements.filter(
    (announcement) => announcement.id !== pinnedAnnouncement?.id,
  );
  const clubAnnouncements = announcements.filter((announcement) => announcement.club).length;
  const universityAnnouncements = announcements.length - clubAnnouncements;

  return (
    <div className="space-y-7 lg:space-y-8">
      <section className="student-hero-card relative overflow-hidden rounded-[22px] p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-[var(--gold-500)] text-[var(--blue-900)]">
              <Megaphone className="size-4" aria-hidden="true" />
            </span>
            <p className="student-eyebrow">Campus updates</p>
          </div>
          <h1 className="student-display mt-5 text-4xl sm:text-5xl">Stay in the loop.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
            The latest news, opportunities, and updates from your clubs and the wider university
            community.
          </p>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'All updates', value: announcements.length, icon: Bell },
          { label: 'University-wide', value: universityAnnouncements, icon: Megaphone },
          { label: 'From your clubs', value: clubAnnouncements, icon: Users },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="student-panel rounded-[18px] border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <Icon className="size-4 text-primary" aria-hidden="true" />
              </div>
              <p className="student-display mt-3 text-3xl">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {announcements.length === 0 ? (
        <section className="student-panel rounded-[22px] border border-dashed p-10 text-center sm:p-14">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-primary">
            <Bell className="size-6" aria-hidden="true" />
          </span>
          <h2 className="student-display mt-5 text-2xl">Nothing new for now.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            When your clubs or the university share an update, it will appear here.
          </p>
        </section>
      ) : (
        <div className="space-y-6">
          {pinnedAnnouncement && (
            <article className="student-invite-card rounded-[22px] border p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="student-chip student-chip-gold">
                  <Pin className="mr-1 inline size-3" aria-hidden="true" />
                  Pinned update
                </span>
                <AnnouncementDate date={pinnedAnnouncement.createdAt} />
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-600)]">
                {pinnedAnnouncement.club?.name ?? 'University-wide'}
              </p>
              <h2 className="student-display mt-2 text-3xl sm:text-4xl">
                {pinnedAnnouncement.title}
              </h2>
              <p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {pinnedAnnouncement.body}
              </p>
              <p className="mt-6 text-xs text-muted-foreground">
                Posted by {pinnedAnnouncement.author.fullName}
              </p>
            </article>
          )}

          {regularAnnouncements.length > 0 && (
            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="student-eyebrow">Your feed</p>
                  <h2 className="student-display mt-1 text-2xl">Recent updates</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  {regularAnnouncements.length}{' '}
                  {regularAnnouncements.length === 1 ? 'update' : 'updates'}
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {regularAnnouncements.map((announcement) => (
                  <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function AnnouncementDate({ date }: { date: Date }) {
  return (
    <time className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <CalendarDays className="size-3.5" aria-hidden="true" />
      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    </time>
  );
}

function AnnouncementCard({
  announcement,
}: {
  announcement: {
    id: string;
    title: string;
    body: string;
    createdAt: Date;
    club: { name: string; slug: string } | null;
    author: { fullName: string };
  };
}) {
  return (
    <article className="student-panel flex h-full flex-col rounded-[20px] border p-5 transition-transform hover:-translate-y-0.5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="student-chip">{announcement.club?.name ?? 'University-wide'}</span>
        <AnnouncementDate date={announcement.createdAt} />
      </div>
      <h3 className="mt-5 text-lg font-semibold leading-7">{announcement.title}</h3>
      <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
        {announcement.body}
      </p>
      <p className="mt-auto pt-6 text-xs text-muted-foreground">
        Posted by {announcement.author.fullName}
      </p>
    </article>
  );
}
