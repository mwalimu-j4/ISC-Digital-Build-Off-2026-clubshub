import { describe, expect, it, vi } from 'vitest';

import { ClubServiceError, submitProposal } from '../../src/modules/clubs/service';

describe('club service authorization', () => {
  it('rejects proposal submission by a super-admin', async () => {
    const db = { club: { create: vi.fn() } };
    await expect(
      submitProposal(
        { id: 'admin', role: 'SUPER_ADMIN' },
        {
          name: 'Robotics',
          description: 'Build things',
          purpose: 'Learn together',
          activities: ['Workshops'],
          category: 'Technology',
        },
        db as never,
      ),
    ).rejects.toBeInstanceOf(ClubServiceError);
    expect(db.club.create).not.toHaveBeenCalled();
  });

  it('validates required proposal fields before persistence', async () => {
    const db = { club: { create: vi.fn() } };
    await expect(
      submitProposal(
        { id: 'student', role: 'STUDENT' },
        {
          name: '',
          description: 'Description',
          purpose: 'Purpose',
          activities: ['Meetups'],
          category: 'Community',
        },
        db as never,
      ),
    ).rejects.toThrow();
    expect(db.club.create).not.toHaveBeenCalled();
  });

  it('returns a conflict when the club name already exists', async () => {
    const db = {
      club: {
        findUnique: vi.fn().mockResolvedValue({ id: 'existing-club' }),
        create: vi.fn(),
      },
    };
    await expect(
      submitProposal(
        { id: 'student', role: 'STUDENT' },
        {
          name: 'Robotics',
          description: 'Build things',
          purpose: 'Learn together',
          activities: ['Workshops'],
          category: 'Technology',
        },
        db as never,
      ),
    ).rejects.toThrow('already exists');
    expect(db.club.create).not.toHaveBeenCalled();
  });
});
