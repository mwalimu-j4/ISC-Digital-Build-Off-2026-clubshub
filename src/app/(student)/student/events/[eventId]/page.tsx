import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, MapPin, Users } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { requireRole } from '@/lib/auth/authorization';
import {
  cancelEventRegistration,
  EventServiceError,
  getEvent,
  getEventRegistration,
  registerForEvent,
} from '@/modules/events';
import { eventActionSchema, eventIdSchema } from '@/modules/events/validations/event-schema';

async function eventAction(formData: FormData) {
  'use server';
  const user = await requireRole('STUDENT');
  const eventId = String(formData.get('eventId') ?? '');
  const parsed = eventActionSchema.safeParse({
    eventId,
    action: String(formData.get('action') ?? ''),
  });

  if (!parsed.success) {
    redirect(
      `/student/events/${eventId}?error=${encodeURIComponent('That registration request is not valid.')}`,
    );
  }

  try {
    if (parsed.data.action === 'register') await registerForEvent(user, parsed.data);
    else await cancelEventRegistration(user, parsed.data);
  } catch (error) {
    if (error instanceof EventServiceError) {
      redirect(`/student/events/${eventId}?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  revalidatePath(`/student/events/${eventId}`);
  redirect(`/student/events/${eventId}`);
}

export default async function StudentEventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireRole('STUDENT');
  const eventId = eventIdSchema.parse((await params).eventId);
  const { error } = await searchParams;
  const [event, registration] = await Promise.all([
    getEvent(user, eventId),
    getEventRegistration(user, eventId),
  ]);
  if (!event) notFound();

  const isRegistered = registration?.status === 'REGISTERED';
  const startsAt = event.startsAt.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Africa/Nairobi',
    weekday: 'long',
    year: 'numeric',
  });
  const startsTime = event.startsAt.toLocaleTimeString('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi',
  });
  const endsTime = event.endsAt.toLocaleTimeString('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi',
  });
  const remainingSpots =
    event.capacity === null ? null : Math.max(event.capacity - event._count.registrations, 0);

  return (
    <article className="student-event-page">
      <Link className="student-event-back-link" href="/student/events">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to events
      </Link>
      <header className="student-event-hero">
        <div className="student-event-hero-copy">
          <span className="student-chip student-chip-gold">{event.club.name}</span>
          <p className="student-eyebrow">Campus event</p>
          <h1 className="student-display">{event.title}</h1>
          <p className="student-event-intro">
            {event.description || 'Connect, learn, and make the most of campus life.'}
          </p>
        </div>
        <div className="student-event-hero-mark" aria-hidden="true">
          <CalendarDays className="size-10" />
        </div>
      </header>
      <div className="student-event-content">
        <section
          className="student-event-card student-event-details"
          aria-labelledby="event-details-heading"
        >
          <div className="student-event-section-heading">
            <div>
              <p className="student-eyebrow">Plan your visit</p>
              <h2 id="event-details-heading">Event details</h2>
            </div>
            <span className="student-event-status">
              {event.status === 'MEMBERS' ? 'Members only' : 'Open to students'}
            </span>
          </div>
          <dl className="student-event-detail-list">
            <div>
              <dt>
                <CalendarDays className="size-4" aria-hidden="true" /> Date
              </dt>
              <dd>{startsAt}</dd>
            </div>
            <div>
              <dt>
                <Clock3 className="size-4" aria-hidden="true" /> Time
              </dt>
              <dd>
                {startsTime} – {endsTime} EAT
              </dd>
            </div>
            <div>
              <dt>
                <MapPin className="size-4" aria-hidden="true" /> Location
              </dt>
              <dd>{event.location}</dd>
            </div>
            <div>
              <dt>
                <Users className="size-4" aria-hidden="true" /> Attendance
              </dt>
              <dd>
                {event._count.registrations}
                {event.capacity ? ` of ${event.capacity}` : ''} registered
              </dd>
            </div>
          </dl>
          {event.description ? (
            <div className="student-event-description">
              <h2>About this event</h2>
              <p className="whitespace-pre-wrap">{event.description}</p>
            </div>
          ) : null}
        </section>
        <aside
          className="student-event-card student-event-registration"
          aria-labelledby="registration-heading"
        >
          <p className="student-eyebrow">Your spot</p>
          <h2 id="registration-heading">{isRegistered ? 'You are going' : 'Join this event'}</h2>
          <p>
            {isRegistered
              ? 'Your registration is confirmed. Add the event to your calendar so you do not miss it.'
              : remainingSpots === 0
                ? 'This event is currently full. Check back later for availability.'
                : 'Reserve your place in a few seconds. You can cancel your registration any time.'}
          </p>
          {error ? (
            <p aria-live="polite" className="student-event-error" role="alert">
              {error}
            </p>
          ) : null}
          {remainingSpots !== null && remainingSpots > 0 ? (
            <p className="student-event-capacity">
              {remainingSpots} {remainingSpots === 1 ? 'spot' : 'spots'} remaining
            </p>
          ) : null}
          <div className="student-event-actions">
            <form action={eventAction}>
              <input type="hidden" name="eventId" value={event.id} />
              <input type="hidden" name="action" value={isRegistered ? 'cancel' : 'register'} />
              <Button
                className="w-full"
                disabled={!isRegistered && remainingSpots === 0}
                type="submit"
                variant={isRegistered ? 'outline' : 'default'}
              >
                {isRegistered ? <CheckCircle2 className="size-4" aria-hidden="true" /> : null}
                {isRegistered ? 'Cancel registration' : 'Register for event'}
              </Button>
            </form>
            <Button asChild className="w-full" variant="outline">
              <a href={`/student/events/${event.id}/calendar`}>Add to calendar</a>
            </Button>
          </div>
        </aside>
      </div>
    </article>
  );
}
