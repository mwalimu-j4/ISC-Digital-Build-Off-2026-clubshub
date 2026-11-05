import type { UserRole } from '@prisma/client';

import { recordAuditLog } from '@/lib/auth/audit';
import { prisma } from '@/lib/database/prisma';
import type { ProfileDb } from '@/modules/profile/repositories/profile-repository';
import { profileRepository } from '@/modules/profile/repositories/profile-repository';
import type { ProfileWithPrivacy } from '@/modules/profile/types';
import {
  type UpdateProfileInput,
  updateProfileSchema,
} from '@/modules/profile/validations/profile-schema';

export class ProfileServiceError extends Error {}

const isSuperAdmin = (role: UserRole) => role === 'SUPER_ADMIN';

function applyPrivacyFilter(
  user: Awaited<ReturnType<typeof profileRepository.findById>>,
  actorId: string,
  actorRole: UserRole,
): ProfileWithPrivacy | null {
  if (!user) return null;

  const isOwner = user.id === actorId;
  const isAdmin = isSuperAdmin(actorRole);

  // Create base profile without sensitive fields
  const { studentRegistrationId, email, ...publicProfile } = user;

  // Build profile with conditional privacy fields
  const profile: ProfileWithPrivacy = {
    ...publicProfile,
    // studentRegistrationId visible only to owner and SUPER_ADMIN
    ...(isOwner || isAdmin ? { studentRegistrationId } : {}),
    // email visible only to owner and admins (not to other students)
    ...(isOwner || isAdmin ? { email } : {}),
  };

  return profile;
}

export async function getProfile(
  actorId: string,
  actorRole: UserRole,
  targetUserId: string,
  db: ProfileDb = prisma,
): Promise<ProfileWithPrivacy | null> {
  const user = await profileRepository.findById(db, targetUserId);
  return applyPrivacyFilter(user, actorId, actorRole);
}

export async function updateProfile(
  actor: { id: string; role: UserRole },
  input: UpdateProfileInput,
  db: ProfileDb = prisma,
) {
  // Only user can update their own profile
  const data = updateProfileSchema.parse(input);

  await profileRepository.update(db, actor.id, {
    ...data,
    avatarUrl: data.avatarUrl || null,
    course: data.course || null,
    yearOfStudy: data.yearOfStudy || null,
    bio: data.bio || null,
  });

  await recordAuditLog(db, {
    action: 'PROFILE_UPDATED',
    actorId: actor.id,
    targetEntity: 'User',
    targetEntityId: actor.id,
  });

  // Fetch updated profile with memberships
  const updated = await profileRepository.findById(db, actor.id);
  return applyPrivacyFilter(updated, actor.id, actor.role);
}
