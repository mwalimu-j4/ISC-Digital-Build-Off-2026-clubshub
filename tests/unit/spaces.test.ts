import { describe, expect, it, vi } from 'vitest';

import { getSpaceById, resolvePostLoginDestination } from '@/modules/spaces';
import { spacesRepository } from '@/modules/spaces/repositories/spaces-repository';

const spaces = [
  {
    id: 'STUDENT_HOME',
    kind: 'student' as const,
    label: 'Student',
    href: '/student',
    club: null,
    attentionCount: 0,
  },
  {
    id: 'CLUB:robotics',
    kind: 'admin' as const,
    label: 'Club admin',
    href: '/club-admin/robotics',
    club: { name: 'Robotics', slug: 'robotics', logoUrl: null, memberCount: 2 },
    attentionCount: 1,
  },
];

describe('space routing', () => {
  it('rejects invalid remembered space identifiers', () => {
    expect(getSpaceById(spaces, 'https://evil.example')).toBeNull();
    expect(getSpaceById(spaces, 'CLUB:unknown')).toBeNull();
  });

  it('honours a currently allowed internal requested path', async () => {
    vi.spyOn(spacesRepository, 'findForUser').mockResolvedValue({
      role: 'STUDENT',
      memberships: [],
    } as never);
    await expect(
      resolvePostLoginDestination({ id: 'user', role: 'STUDENT' }, '/student'),
    ).resolves.toBe('/student');
  });

  it('does not use an unsafe requested URL as a redirect', async () => {
    vi.spyOn(spacesRepository, 'findForUser').mockResolvedValue({
      role: 'STUDENT',
      memberships: [],
    } as never);
    await expect(
      resolvePostLoginDestination({ id: 'user', role: 'STUDENT' }, 'https://evil.example'),
    ).resolves.toBe('/student');
  });
});
