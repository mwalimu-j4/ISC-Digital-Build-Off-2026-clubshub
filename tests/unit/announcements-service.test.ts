import { describe, expect, it, vi } from 'vitest';

import {
  AnnouncementServiceError,
  createAnnouncement,
  deleteAnnouncement,
  listClubAnnouncements,
  updateAnnouncement,
} from '../../src/modules/announcements';

describe('announcement service', () => {
  it('creates an announcement for an approved club admin', async () => {
    const db = {
      clubMembership: {
        findFirst: vi.fn().mockResolvedValue({ id: 'membership-1' }),
      },
      announcement: {
        create: vi.fn().mockResolvedValue({ id: 'announcement-1' }),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };

    await createAnnouncement(
      { id: 'actor-1', role: 'STUDENT' },
      '00000000-0000-4000-8000-000000000010',
      { title: 'Welcome week', body: 'Check the club update board.', audience: 'MEMBERS', pinned: true },
      db as never,
    );

    expect(db.clubMembership.findFirst).toHaveBeenCalledWith({
      where: { clubId: '00000000-0000-4000-8000-000000000010', userId: 'actor-1', role: 'CLUB_ADMIN', status: 'APPROVED' },
    });
    expect(db.announcement.create).toHaveBeenCalledWith({
      data: {
        club: { connect: { id: '00000000-0000-4000-8000-000000000010' } },
        author: { connect: { id: 'actor-1' } },
        title: 'Welcome week',
        body: 'Check the club update board.',
        audience: 'MEMBERS',
        pinned: true,
      },
    });
  });

  it('rejects listing announcements when the actor is not an approved club admin', async () => {
    const db = {
      clubMembership: { findFirst: vi.fn().mockResolvedValue(null) },
      announcement: { findMany: vi.fn() },
    };

    await expect(
      listClubAnnouncements({ id: 'actor-1', role: 'STUDENT' }, 'club-1', db as never),
    ).rejects.toBeInstanceOf(AnnouncementServiceError);
    expect(db.announcement.findMany).not.toHaveBeenCalled();
  });

  it('updates the target announcement only for the right club', async () => {
    const db = {
      clubMembership: { findFirst: vi.fn().mockResolvedValue({ id: 'membership-1' }) },
      announcement: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-1' }) },
    };

    await updateAnnouncement(
      { id: 'actor-1', role: 'STUDENT' },
      '00000000-0000-4000-8000-000000000010',
      '00000000-0000-4000-8000-000000000011',
      { title: 'Updated', body: 'New details', audience: 'UNIVERSITY', pinned: false },
      db as never,
    );

    expect(db.announcement.updateMany).toHaveBeenCalledWith({
      where: {
        id: '00000000-0000-4000-8000-000000000011',
        clubId: '00000000-0000-4000-8000-000000000010',
      },
      data: {
        title: 'Updated',
        body: 'New details',
        audience: 'UNIVERSITY',
        pinned: false,
      },
    });
  });

  it('deletes announcements only for the club admin and club context', async () => {
    const db = {
      clubMembership: { findFirst: vi.fn().mockResolvedValue({ id: 'membership-1' }) },
      announcement: {
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-1' }) },
    };

    await deleteAnnouncement(
      { id: 'actor-1', role: 'STUDENT' },
      '00000000-0000-4000-8000-000000000010',
      '00000000-0000-4000-8000-000000000011',
      db as never,
    );

    expect(db.announcement.deleteMany).toHaveBeenCalledWith({
      where: {
        id: '00000000-0000-4000-8000-000000000011',
        clubId: '00000000-0000-4000-8000-000000000010',
      },
    });
  });

  it('rejects deleting a missing announcement', async () => {
    const db = {
      clubMembership: { findFirst: vi.fn().mockResolvedValue({ id: 'membership-1' }) },
      announcement: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    };

    await expect(
      deleteAnnouncement(
        { id: 'actor-1', role: 'STUDENT' },
        '00000000-0000-4000-8000-000000000010',
        '00000000-0000-4000-8000-000000000011',
        db as never,
      ),
    ).rejects.toThrow('Announcement not found');
  });
});
