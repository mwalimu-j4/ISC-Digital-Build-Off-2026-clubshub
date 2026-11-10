import { ArrowUpRight, CalendarDays, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  calculatePassport,
  membershipLabel,
  type PassportResult,
  proposalLabel,
  type WeekDay,
} from '@/modules/student';

export type StudentAction = (formData: FormData) => void | Promise<void>;

export function SectionCard({
  title,
  href,
  children,
  className = '',
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`student-panel rounded-[22px] border p-5 sm:p-6 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="student-display text-2xl">{title}</h2>
        {href && (
          <Link className="student-inline-link" href={href}>
            View all <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({
  children,
  href,
  label,
}: {
  children: string;
  href: string;
  label: string;
}) {
  return (
    <div className="student-empty mt-5 rounded-xl border border-dashed p-5 text-center">
      <p className="text-sm text-muted-foreground">{children}</p>
      <Link href={href} className="student-inline-link mt-3 inline-flex">
        {label} <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

export function StatusChip({
  children,
  tone = 'default',
}: {
  children: string;
  tone?: 'default' | 'gold' | 'danger';
}) {
  return <span className={`student-chip student-chip-${tone}`}>{children}</span>;
}

export function ProgressRing({ passport }: { passport: PassportResult }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = (passport.completed / passport.total) * circumference;
  return (
    <div className="flex items-center gap-4">
      <div
        className="relative size-[82px] shrink-0"
        role="img"
        aria-label={`${passport.completed} of ${passport.total} passport milestones complete`}
      >
        <svg className="-rotate-90" viewBox="0 0 82 82" aria-hidden="true">
          <circle
            cx="41"
            cy="41"
            r={radius}
            fill="none"
            stroke="var(--passport-track)"
            strokeWidth="8"
          />
          <circle
            cx="41"
            cy="41"
            r={radius}
            fill="none"
            stroke="var(--gold-500)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-sm font-semibold">
          {passport.completed}/{passport.total}
        </span>
      </div>
      <div>
        <p className="student-eyebrow">Campus passport</p>
        <h2 className="student-display text-xl">{passport.level}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{passport.nextHint}</p>
      </div>
    </div>
  );
}

export function WeekStrip({ days }: { days: WeekDay[] }) {
  return (
    <div className="student-week-scroll mt-5" aria-label="Your campus week">
      <div className="student-week-grid">
        {days.map((day) => {
          const event = day.events[0];
          return (
            <Link
              key={day.date.toISOString()}
              href={event ? `/student/events/${event.id}` : '/student/events'}
              className={`student-day-tile ${day.isToday ? 'student-day-today' : event ? 'student-day-event' : ''}`}
            >
              <span>{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
              <strong>{day.date.getDate()}</strong>
              <small>{day.isToday ? 'Today' : (event?.title ?? 'Open')}</small>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

type Membership = {
  id: string;
  role: 'MEMBER' | 'CLUB_ADMIN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'LEFT' | 'GRADUATED';
  club: {
    id: string;
    name: string;
    slug: string;
    category: string;
    logoUrl: string | null;
    _count: { memberships: number };
  };
};

export function ClubRow({ membership }: { membership: Membership }) {
  const label = membershipLabel(membership.role, membership.status);
  return (
    <Link href={`/student/clubs/${membership.club.slug}`} className="student-club-row">
      <span className="student-club-mark">{membership.club.name.slice(0, 1).toUpperCase()}</span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate">{membership.club.name}</strong>
        <small>
          {membership.club.category} · {membership.club._count.memberships} members
        </small>
      </span>
      <StatusChip>{label}</StatusChip>
    </Link>
  );
}

export function PassportCard({ counts }: { counts: Parameters<typeof calculatePassport>[0] }) {
  return <ProgressRing passport={calculatePassport(counts)} />;
}

export function ProposalTracker({
  proposals,
}: {
  proposals: Array<{
    name: string;
    status: Parameters<typeof proposalLabel>[0];
    rejectionReason: string | null;
    changeRequestReason: string | null;
  }>;
}) {
  return (
    <div className="mt-5 space-y-4">
      {proposals.slice(0, 3).map((proposal) => {
        const label = proposalLabel(proposal.status);
        const rejected = label === 'Rejected' || label === 'Suspended';
        return (
          <div key={proposal.name} className="border-b border-border pb-4 last:border-0 last:pb-0">
            <div className="flex items-center justify-between gap-3">
              <strong className="truncate">{proposal.name}</strong>
              <StatusChip tone={rejected ? 'danger' : label === 'Live' ? 'gold' : 'default'}>
                {label}
              </StatusChip>
            </div>
            {rejected && (
              <p className="mt-1 text-xs text-muted-foreground">
                {proposal.rejectionReason ?? proposal.changeRequestReason ?? 'No reason provided.'}
              </p>
            )}
            {!rejected && (
              <div className="student-proposal-steps mt-3">
                <span className="complete">
                  <Check className="size-3" />
                </span>
                <span className={label === 'In review' || label === 'Live' ? 'complete' : ''} />
                <span className={label === 'Live' ? 'complete' : ''} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SuggestedClubRow({
  club,
  action,
}: {
  club: { id: string; name: string; category: string; _count: { memberships: number } };
  action: StudentAction;
}) {
  return (
    <div className="student-club-row">
      <span className="student-club-mark student-club-mark-gold">
        {club.name.slice(0, 1).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate">{club.name}</strong>
        <small>
          {club.category} · {club._count.memberships} members
        </small>
      </span>
      <form action={action}>
        <input type="hidden" name="clubId" value={club.id} />
        <Button type="submit" size="sm">
          Join
        </Button>
      </form>
    </div>
  );
}

export function EventPreview({
  title,
  club,
  startsAt,
}: {
  title: string;
  club: string;
  startsAt: Date;
}) {
  return (
    <div className="flex items-center gap-3">
      <CalendarDays className="size-4 text-primary" aria-hidden="true" />
      <span>
        <strong className="block">{title}</strong>
        <small className="text-muted-foreground">
          {club} · {startsAt.toLocaleDateString()}
        </small>
      </span>
    </div>
  );
}
