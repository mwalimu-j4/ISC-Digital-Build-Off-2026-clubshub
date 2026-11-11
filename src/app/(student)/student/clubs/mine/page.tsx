import { ArrowRight, Check, Clock3, Compass, LogOut, Users } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { requireRole } from '@/lib/auth/authorization';
import { ClubServiceError, getOwnMemberships, leaveClub } from '@/modules/clubs/service';

const statusDetails = {
  APPROVED: {
    label: 'Active member',
    description: 'You are part of this community.',
    className: 'student-my-club-status-approved',
  },
  PENDING: {
    label: 'Application pending',
    description: 'Your request is waiting for review.',
    className: 'student-my-club-status-pending',
  },
  REJECTED: {
    label: 'Application declined',
    description: 'Review the club details before applying again.',
    className: 'student-my-club-status-rejected',
  },
  SUSPENDED: {
    label: 'Access paused',
    description: 'Contact a club administrator for help.',
    className: 'student-my-club-status-suspended',
  },
  GRADUATED: {
    label: 'Alumni record',
    description: 'Your membership history is preserved.',
    className: 'student-my-club-status-graduated',
  },
  LEFT: {
    label: 'Former member',
    description: 'You have left this club.',
    className: 'student-my-club-status-left',
  },
} as const;

async function leaveClubAction(formData: FormData) {
  'use server';
  const user = await requireRole('STUDENT');
  const clubId = String(formData.get('clubId') ?? '');
  try {
    await leaveClub(user, clubId);
  } catch (error) {
    if (error instanceof ClubServiceError) {
      redirect(`/student/clubs/mine?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }
  revalidatePath('/student/clubs/mine');
  revalidatePath('/student');
  redirect('/student/clubs/mine');
}

export default async function MyStudentClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireRole('STUDENT');
  const { error } = await searchParams;
  const memberships = await getOwnMemberships(user);
  const activeCount = memberships.filter((membership) => membership.status === 'APPROVED').length;
  const pendingCount = memberships.filter((membership) => membership.status === 'PENDING').length;
  const totalMembers = memberships.reduce(
    (total, membership) => total + membership.club._count.memberships,
    0,
  );

  return (
    <div className="student-my-clubs-page">
      <Link className="student-my-clubs-back" href="/student">
        ← Back to dashboard
      </Link>
      <section className="student-my-clubs-hero">
        <div>
          <p className="student-eyebrow">Your communities</p>
          <h1 className="student-display">My clubs</h1>
          <p>
            Keep your campus communities close, follow your membership progress, and find your next
            place to belong.
          </p>
        </div>
        <div className="student-my-clubs-hero-mark" aria-hidden="true">
          <Users className="size-8" />
        </div>
      </section>

      {error ? (
        <p aria-live="polite" className="student-my-clubs-error" role="alert">
          {error}
        </p>
      ) : null}

      <section aria-label="Membership summary" className="student-my-clubs-summary">
        <article>
          <span className="student-my-clubs-summary-icon student-my-clubs-summary-icon-active">
            <Check className="size-4" aria-hidden="true" />
          </span>
          <div>
            <strong>{activeCount}</strong>
            <span>Active {activeCount === 1 ? 'club' : 'clubs'}</span>
          </div>
        </article>
        <article>
          <span className="student-my-clubs-summary-icon student-my-clubs-summary-icon-pending">
            <Clock3 className="size-4" aria-hidden="true" />
          </span>
          <div>
            <strong>{pendingCount}</strong>
            <span>Pending {pendingCount === 1 ? 'request' : 'requests'}</span>
          </div>
        </article>
        <article>
          <span className="student-my-clubs-summary-icon student-my-clubs-summary-icon-members">
            <Users className="size-4" aria-hidden="true" />
          </span>
          <div>
            <strong>{totalMembers}</strong>
            <span>Members across your clubs</span>
          </div>
        </article>
      </section>

      <div className="student-my-clubs-heading">
        <div>
          <p className="student-eyebrow">Your membership portfolio</p>
          <h2>Clubs you belong to</h2>
        </div>
        <Button asChild size="sm">
          <Link href="/student/clubs">
            <Compass className="size-4" aria-hidden="true" />
            Discover clubs
          </Link>
        </Button>
      </div>

      {memberships.length === 0 ? (
        <section className="student-my-clubs-empty">
          <span className="student-my-clubs-empty-icon">
            <Compass className="size-7" aria-hidden="true" />
          </span>
          <p className="student-eyebrow">A new chapter starts here</p>
          <h2>Find your community</h2>
          <p>Explore active student communities and submit your first membership request.</p>
          <Button asChild className="mt-2">
            <Link href="/student/clubs">
              Explore club directory <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </section>
      ) : (
        <section aria-label="Your club memberships" className="student-my-clubs-grid">
          {memberships.map((membership) => {
            const details = statusDetails[membership.status];
            return (
              <article className="student-my-club-card" key={membership.id}>
                <div className="student-my-club-card-top">
                  <div className="student-my-club-logo">
                    {membership.club.logoUrl ? (
                      <Image alt="" height={56} src={membership.club.logoUrl} width={56} />
                    ) : (
                      membership.club.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className={`student-my-club-status ${details.className}`}>
                    {details.label}
                  </span>
                </div>
                <div className="student-my-club-copy">
                  <p>{membership.club.category}</p>
                  <h3>{membership.club.name}</h3>
                  <span>{details.description}</span>
                </div>
                <div className="student-my-club-meta">
                  <span>
                    <Users className="size-4" aria-hidden="true" />
                    {membership.club._count.memberships}{' '}
                    {membership.club._count.memberships === 1 ? 'member' : 'members'}
                  </span>
                  <span>{membership.role.replace('_', ' ')}</span>
                </div>
                <div className="student-my-club-actions">
                  <Button asChild className="flex-1" size="sm">
                    <Link href={`/student/clubs/${membership.club.slug}`}>
                      View club <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  {membership.status === 'APPROVED' ? (
                    <form action={leaveClubAction}>
                      <input name="clubId" type="hidden" value={membership.club.id} />
                      <Button
                        aria-label={`Leave ${membership.club.name}`}
                        size="sm"
                        type="submit"
                        variant="outline"
                      >
                        <LogOut className="size-4" aria-hidden="true" />
                        Leave
                      </Button>
                    </form>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
