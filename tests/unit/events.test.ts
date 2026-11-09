import { describe, expect, it } from 'vitest';

import { eventInputSchema } from '@/modules/events/validations/event-schema';

const futureStart = '2030-11-18T18:00';
const futureEnd = '2030-11-18T20:00';

function validInput() {
  return {
    clubId: '00000000-0000-4000-8000-000000000001',
    title: 'Build night',
    description: 'Bring your laptop and build together.',
    location: 'Innovation Lab',
    startsAt: futureStart,
    endsAt: futureEnd,
    capacity: '',
    registrationDeadline: '',
    status: 'DRAFT',
  };
}

describe('eventInputSchema', () => {
  it('accepts a draft and normalizes optional values to null', () => {
    const result = eventInputSchema.parse(validInput());

    expect(result.capacity).toBeNull();
    expect(result.registrationDeadline).toBeNull();
    expect(result.startsAt.toISOString()).toBe('2030-11-18T15:00:00.000Z');
  });

  it('accepts members-only visibility', () => {
    expect(eventInputSchema.parse({ ...validInput(), status: 'MEMBERS' }).status).toBe('MEMBERS');
  });

  it('rejects an event whose end is not after its start', () => {
    expect(() => eventInputSchema.parse({ ...validInput(), endsAt: futureStart })).toThrow(
      'End time must be after the start time',
    );
  });

  it('rejects publishing an event that has already started', () => {
    expect(() =>
      eventInputSchema.parse({
        ...validInput(),
        startsAt: '2020-11-18T18:00',
        status: 'PUBLISHED',
      }),
    ).toThrow('Published events must start in the future');
  });
});
