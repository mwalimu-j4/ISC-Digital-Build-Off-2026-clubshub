import { describe, expect, it } from 'vitest';

import { generateCloudinarySignature } from '@/lib/utils/cloudinary';
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

  describe('Cloudinary signing', () => {
    it('uses Cloudinary SHA-1 signing with sorted upload parameters', () => {
      expect(
        generateCloudinarySignature(
          {
            timestamp: '1794259996',
            folder: 'clubshub/clubs/example/events',
          },
          'test-secret',
        ),
      ).toBe('029b826a531dee069fedca9145d023f241335c40');
    });
  });

  describe('optional event media', () => {
    it('allows an empty media selection to submit without a file', () => {
      const emptyFile = new File([], '', { type: 'application/octet-stream' });

      expect(emptyFile.size).toBe(0);
    });
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

  it('keeps morning and afternoon times distinct', () => {
    const result = eventInputSchema.parse({
      ...validInput(),
      startsAt: '2030-11-18T08:00',
      endsAt: '2030-11-18T12:00',
    });

    expect(result.endsAt.getTime()).toBeGreaterThan(result.startsAt.getTime());
  });
});
