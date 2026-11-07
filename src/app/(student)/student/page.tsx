import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { requireRole } from '@/lib/auth/authorization';
import { listStudentAnnouncements } from '@/modules/announcements';
import { getOwnMemberships, getOwnProposals } from '@/modules/clubs/service';
import { getNextRegisteredEvent, getRegisteredEventCount } from '@/modules/events';
import { getProfileStats } from '@/modules/profile';

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
  const user = await requireRole('STUDENT');
  const [memberships, nextEvent, stats, announcements, registeredEvents, proposals] =
    await Promise.all([
      getOwnMemberships(user),
      getNextRegisteredEvent(user),
      getProfileStats(user.id),
      listStudentAnnouncements(user),
      getRegisteredEventCount(user),
      getOwnProposals(user),
    ]);
  const firstName = (user.name ?? 'student').split(' ')[0];
  const upcoming = nextEvent[0]?.event;

  return (
    <div className="space-y-8">
      <section>
        <p className="eyebrow">Your campus, connected</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Good to see you, {firstName}.
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Find clubs, keep up with campus life, and make your next connection.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Activity summary">
        {[
          ['Clubs joined', stats.clubsJoined],
          ['Events registered', registeredEvents],
          ['Pending applications', memberships.filter((item) => item.status === 'PENDING').length],
          ['Club proposals', proposals.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Up next</p>
            <h2 className="mt-1 text-xl font-semibold">
              {upcoming?.title ?? 'No registered events yet'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {upcoming
                ? `${upcoming.club.name} · ${upcoming.location} · ${upcoming.startsAt.toLocaleString()}`
                : 'Explore events and register for something that interests you.'}
            </p>
          </div>
          <Button asChild variant={upcoming ? 'default' : 'outline'}>
            <Link href={upcoming ? `/student/events/${upcoming.id}` : '/student/events'}>
              {upcoming ? 'View details' : 'Explore events'}
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">My clubs</h2>
            <Link href="/student/clubs/mine" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {memberships.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">You have not joined a club yet.</p>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {memberships.slice(0, 4).map((membership) => (
                <Link
                  key={membership.id}
                  href={`/clubs/${membership.club.slug}`}
                  className="rounded-lg border border-border p-4 hover:bg-secondary"
                >
                  <p className="font-medium">{membership.club.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {membership.role.replace('_', ' ')} · {membership.status}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-dashed border-primary/60 bg-primary/5 p-6">
          <p className="text-sm font-medium text-primary">Make your mark</p>
          <h2 className="mt-2 text-xl font-semibold">Have an idea for a club?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Propose a new community and track its review status.
          </p>
          <Button asChild className="mt-5">
            <Link href="/clubs/propose">Propose a club</Link>
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Announcements</h2>
          <Link href="/student/announcements" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {announcements.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            There are no announcements for you yet.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {announcements.slice(0, 3).map((announcement) => (
              <article
                key={announcement.id}
                className="border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <p className="font-medium">{announcement.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {announcement.body}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
