import { describe, expect, it } from 'vitest';

import { eventInputSchema } from '@/modules/events/validations/event-schema';

const futureStart = new Date(Date.now() + 86_400_000);
const futureEnd = new Date(futureStart.getTime() + 7_200_000);

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
        startsAt: new Date(Date.now() - 3_600_000),
        status: 'PUBLISHED',
      }),
    ).toThrow('Published events must start in the future');
  });
});
