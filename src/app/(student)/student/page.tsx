import { revalidatePath } from 'next/cache';
import Link from 'next/link';

import {
  ClubRow,
  EmptyState,
  EventPreview,
  PassportCard,
  ProposalTracker,
  SectionCard,
  StatusChip,
  SuggestedClubRow,
  WeekStrip,
} from '@/components/student/student-dashboard-components';
import { Button } from '@/components/ui/button';
import { requireRole } from '@/lib/auth/authorization';
import { listStudentAnnouncements } from '@/modules/announcements';
import {
  discoverClubs,
  getOwnMemberships,
  getOwnProposals,
  joinClub,
} from '@/modules/clubs/service';
import {
  getNextRegisteredEvent,
  getRegisteredEventCount,
  listStudentWeekEvents,
} from '@/modules/events';
import { getUnreadNotificationCount } from '@/modules/notifications';
import { getProfile, getProfileStats } from '@/modules/profile';
import { buildCampusWeek } from '@/modules/student';

export const dynamic = 'force-dynamic';

async function joinClubAction(formData: FormData) {
  'use server';
  const user = await requireRole('STUDENT');
  await joinClub(user, String(formData.get('clubId')));
  revalidatePath('/student');
  revalidatePath('/student/clubs');
}

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

export default async function StudentDashboardPage() {
  const user = await requireRole('STUDENT');
  const [
    memberships,
    nextEvent,
    stats,
    announcements,
    registeredEvents,
    proposals,
    weekEvents,
    unread,
    profile,
    suggestions,
  ] = await Promise.all([
    getOwnMemberships(user),
    getNextRegisteredEvent(user),
    getProfileStats(user.id),
    listStudentAnnouncements(user),
    getRegisteredEventCount(user),
    getOwnProposals(user),
    listStudentWeekEvents(user),
    getUnreadNotificationCount(user),
    getProfile(user.id, user.role, user.id),
    discoverClubs(user, {}),
  ]);
  const activeMemberships = memberships.filter((item) => item.status !== 'LEFT');
  const suggestedClubs = suggestions
    .filter((club) => !activeMemberships.some((item) => item.club.id === club.id))
    .slice(0, 3);
  const firstName = (user.name ?? 'student').split(' ')[0];
  const profileComplete = Boolean(
    profile?.fullName && profile.course && profile.yearOfStudy && profile.bio,
  );
  const campusWeek = buildCampusWeek(new Date(), weekEvents);
  const waiting = activeMemberships.filter((item) => item.status === 'PENDING').length;
  const summary =
    weekEvents.length || waiting
      ? `${weekEvents.length} upcoming ${weekEvents.length === 1 ? 'event' : 'events'} and ${waiting} application${waiting === 1 ? '' : 's'} in review.`
      : 'Your campus is ready for your next connection.';

  return (
    <div className="space-y-6 lg:space-y-7">
      <section className="student-hero-card rounded-[22px] p-6 sm:p-8">
        <p className="student-eyebrow">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        <h1 className="student-display mt-2 text-4xl sm:text-5xl">
          {greeting()}, <span className="student-highlight">{firstName}.</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-blue-100">{summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            asChild
            className="bg-[var(--gold-500)] text-[var(--blue-900)] hover:bg-[var(--gold-500)]/90"
          >
            <Link href="/student/events">Explore this week</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/student/clubs/mine">My clubs</Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <SectionCard title="Your campus week" href="/student/events">
          {weekEvents.length === 0 ? (
            <EmptyState href="/student/events" label="Explore events">
              There are no events from your clubs this week yet.
            </EmptyState>
          ) : (
            <WeekStrip days={campusWeek} />
          )}
        </SectionCard>
        <section className="student-panel rounded-[22px] border p-5 sm:p-6">
          <PassportCard
            counts={{
              profileComplete,
              clubsJoined: stats.clubsJoined,
              eventsRegistered: registeredEvents,
              proposalsSubmitted: proposals.length,
            }}
          />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="My clubs" href="/student/clubs/mine">
          {activeMemberships.length === 0 ? (
            <EmptyState href="/student/clubs" label="Discover clubs">
              You have not joined a club yet.
            </EmptyState>
          ) : (
            <div className="mt-4">
              {activeMemberships.slice(0, 4).map((membership) => (
                <ClubRow key={membership.id} membership={membership} />
              ))}
            </div>
          )}
        </SectionCard>
        <SectionCard title="Club proposal tracker" href="/clubs/propose">
          {proposals.length === 0 ? (
            <EmptyState href="/clubs/propose" label="Propose a club">
              Have an idea for a new campus community?
            </EmptyState>
          ) : (
            <ProposalTracker proposals={proposals} />
          )}
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Announcements" href="/student/announcements">
          {announcements.length === 0 ? (
            <EmptyState href="/student/announcements" label="Explore updates">
              There are no announcements for you yet.
            </EmptyState>
          ) : (
            <div className="mt-4 space-y-3">
              {announcements.slice(0, 3).map((announcement) => (
                <article
                  key={announcement.id}
                  className="border-b border-border pb-3 last:border-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-sm">{announcement.title}</strong>
                    {announcement.pinned && <StatusChip tone="gold">Pinned</StatusChip>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {announcement.body}
                  </p>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
        <SectionCard title="Picked for you" href="/student/clubs">
          {suggestedClubs.length === 0 ? (
            <EmptyState href="/student/clubs" label="Explore clubs">
              You are connected to every club currently available.
            </EmptyState>
          ) : (
            <div className="mt-4">
              {suggestedClubs.map((club) => (
                <SuggestedClubRow key={club.id} club={club} action={joinClubAction} />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {nextEvent[0]?.event && (
        <SectionCard title="Up next">
          <EventPreview
            title={nextEvent[0].event.title}
            club={nextEvent[0].event.club.name}
            startsAt={nextEvent[0].event.startsAt}
          />
        </SectionCard>
      )}
      {unread > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          <Link className="student-inline-link" href="/student/notifications">
            {unread} unread notification{unread === 1 ? '' : 's'} <span aria-hidden="true">→</span>
          </Link>
        </p>
      )}
    </div>
  );
}
