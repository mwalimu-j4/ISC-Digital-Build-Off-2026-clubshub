import { describe, expect, it, vi } from 'vitest';

import { getProfile } from '../../src/modules/profile/services/profile-service';

const user = {
  id: 'student-id',
  fullName: 'Student User',
  email: 'student@example.com',
  studentRegistrationId: 'REG-001',
  role: 'STUDENT',
  status: 'ACTIVE',
  avatarUrl: null,
  bio: null,
  course: null,
  yearOfStudy: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  memberships: [],
};

describe('profile service privacy', () => {
  it('hides private identity fields from another student', async () => {
    const db = { user: { findUnique: vi.fn().mockResolvedValue(user) } };

    const profile = await getProfile('other-id', 'STUDENT', user.id, db as never);

    expect(profile).not.toHaveProperty('email');
    expect(profile).not.toHaveProperty('studentRegistrationId');
  });

  it('returns private identity fields to the profile owner', async () => {
    const db = { user: { findUnique: vi.fn().mockResolvedValue(user) } };

    const profile = await getProfile(user.id, 'STUDENT', user.id, db as never);

    expect(profile?.email).toBe(user.email);
    expect(profile?.studentRegistrationId).toBe(user.studentRegistrationId);
  });
});
