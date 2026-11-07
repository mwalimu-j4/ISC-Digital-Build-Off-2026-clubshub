import { describe, expect, it } from 'vitest';

import { buildCampusWeek,calculatePassport, membershipLabel } from '@/modules/student';

describe('Campus Passport', () => {
  it('counts available milestones and returns the next hint', () => {
    expect(
      calculatePassport({
        profileComplete: true,
        clubsJoined: 1,
        eventsRegistered: 0,
        proposalsSubmitted: 0,
      }),
    ).toEqual({
      level: 'Explorer',
      completed: 2,
      total: 5,
      nextHint: 'Attend your first event to unlock Connector.',
    });
  });
});

describe('student labels', () => {
  it('maps membership enums to friendly labels', () => {
    expect(membershipLabel('CLUB_ADMIN', 'APPROVED')).toBe('Club admin');
    expect(membershipLabel('MEMBER', 'PENDING')).toBe('Pending approval');
    expect(membershipLabel('MEMBER', 'SUSPENDED')).toBe('Suspended');
  });
});

describe('campus week builder', () => {
  it('starts today and places events on their local day', () => {
    const today = new Date(2026, 10, 7, 9);
    const event = { id: 'event-1', title: 'Welcome', startsAt: new Date(2026, 10, 9, 12) };
    const week = buildCampusWeek(today, [event]);
    expect(week).toHaveLength(7);
    expect(week[0]?.isToday).toBe(true);
    expect(week[2]?.events).toEqual([event]);
  });
});
