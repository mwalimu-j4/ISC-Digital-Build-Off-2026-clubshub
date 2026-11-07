import { NextResponse } from 'next/server';

import { requireRole } from '@/lib/auth/authorization';
import { getEvent } from '@/modules/events';
import { eventIdSchema } from '@/modules/events/validations/event-schema';

export async function GET(_request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const user = await requireRole('STUDENT');
  const eventId = eventIdSchema.parse((await params).eventId);
  const event = await getEvent(user, eventId);
  if (!event) return new NextResponse('Event not found', { status: 404 });

  const escapeIcs = (value: string) =>
    value.replace(/\\/g, '\\\\').replace(/[,;]/g, '\\$&').replace(/\n/g, '\\n');
  const formatDate = (date: Date) =>
    date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ClubsHub//Student Events//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@clubshub`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(event.startsAt)}`,
    `DTEND:${formatDate(event.endsAt)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `LOCATION:${escapeIcs(event.location)}`,
    `DESCRIPTION:${escapeIcs(event.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${event.id}.ics"`,
    },
  });
}
