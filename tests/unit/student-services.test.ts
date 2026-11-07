import { describe, expect, it, vi } from 'vitest';

import {
  EventServiceError,
  registerForEvent,
} from '../../src/modules/events/services/event-service';
import { createNotification } from '../../src/modules/notifications/services/notification-service';

const eventId = '00000000-0000-4000-8000-000000000001';
const actor = { id: 'student-id', role: 'STUDENT' as const };

function eventDb(overrides: Record<string, unknown> = {}) {
  return {
    event: {
      findUnique: vi.fn().mockResolvedValue({
        id: eventId,
        status: 'PUBLISHED',
        capacity: null,
        registrationDeadline: null,
        ...overrides,
      }),
    },
    eventRegistration: {
      findUnique: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      upsert: vi.fn().mockResolvedValue({ id: 'registration-id' }),
    },
  };
}

describe('student event service', () => {
  it('rejects duplicate registrations', async () => {
    const db = eventDb();
    db.eventRegistration.findUnique.mockResolvedValue({ status: 'REGISTERED' });

    await expect(
      registerForEvent(actor, { eventId, action: 'register' }, db as never),
    ).rejects.toBeInstanceOf(EventServiceError);
    expect(db.eventRegistration.upsert).not.toHaveBeenCalled();
  });

  it('enforces event capacity', async () => {
    const db = eventDb({ capacity: 1 });
    db.eventRegistration.count.mockResolvedValue(1);

    await expect(
      registerForEvent(actor, { eventId, action: 'register' }, db as never),
    ).rejects.toThrow('capacity');
    expect(db.eventRegistration.upsert).not.toHaveBeenCalled();
  });

  it('rejects non-student event access', async () => {
    const db = eventDb();

    await expect(
      registerForEvent(
        { id: 'admin', role: 'SUPER_ADMIN' },
        { eventId, action: 'register' },
        db as never,
      ),
    ).rejects.toThrow('Student access');
  });
});

describe('notification service', () => {
  it('creates a notification through the repository', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'notification-id' });

    await createNotification(
      {
        recipientId: 'student-id',
        type: 'GENERAL',
        title: 'Welcome',
        message: 'A new update is available.',
      },
      { notification: { create } } as never,
    );

    expect(create).toHaveBeenCalledWith({
      data: {
        recipient: { connect: { id: 'student-id' } },
        type: 'GENERAL',
        title: 'Welcome',
        message: 'A new update is available.',
      },
    });
  });
});
