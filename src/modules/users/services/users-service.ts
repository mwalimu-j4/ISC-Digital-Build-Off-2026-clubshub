import type { Prisma, UserRole } from '@prisma/client';

import { recordAuditLog } from '@/lib/auth/audit';
import { prisma } from '@/lib/database/prisma';
import { USERS_PAGE_SIZE } from '@/modules/users/constants';
import { type UsersDb, usersRepository } from '@/modules/users/repositories/users-repository';
import type { UserDetail, UserListItem, UsersPageData } from '@/modules/users/types';
import {
  changeRoleSchema,
  reactivateUserSchema,
  suspendUserSchema,
  usersQuerySchema,
} from '@/modules/users/validations/users-schema';

export class UsersServiceError extends Error {}

type SuperAdmin = { id: string; role: UserRole };

function ensureSuperAdmin(actor: SuperAdmin) {
  if (actor.role !== 'SUPER_ADMIN') throw new UsersServiceError('Super admin access is required');
}

function mapListItem(item: {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserListItem['status'];
  createdAt: Date;
  updatedAt: Date;
  _count: { memberships: number };
  memberships: Array<{ id: string }>;
}): UserListItem {
  return {
    ...item,
    clubCount: item._count.memberships,
    isClubAdmin: item.memberships.length > 0,
  };
}

function transaction<T>(db: UsersDb, callback: (tx: Prisma.TransactionClient) => Promise<T>) {
  if ('$transaction' in db) return db.$transaction(callback);
  return callback(db);
}

export async function listUsers(actor: SuperAdmin, input: unknown): Promise<UsersPageData> {
  ensureSuperAdmin(actor);
  const query = usersQuerySchema.parse(input);
  const [rows, total, counts] = await Promise.all([
    usersRepository.list(prisma, query),
    usersRepository.count(prisma, query),
    usersRepository.counts(prisma),
  ]);
  return { users: rows.map(mapListItem), total, counts };
}

export async function getUserDetail(actor: SuperAdmin, id: string): Promise<UserDetail | null> {
  ensureSuperAdmin(actor);
  const user = await usersRepository.detail(prisma, id);
  if (!user) return null;
  return {
    ...mapListItem(user),
    studentRegistrationId: user.studentRegistrationId,
    suspendedAt: user.suspendedAt,
    suspendedReason: user.suspendedReason,
    memberships: user.memberships.map((membership) => ({
      id: membership.id,
      clubId: membership.clubId,
      clubName: membership.club.name,
      clubSlug: membership.club.slug,
      role: membership.role,
      status: membership.status,
    })),
  };
}

function assertVersion(current: { updatedAt: Date } | null, expected: Date) {
  if (!current || current.updatedAt.getTime() !== expected.getTime()) {
    throw new UsersServiceError('This user was updated by someone else, refresh');
  }
}

export async function changeUserRole(actor: SuperAdmin, input: unknown, db: UsersDb = prisma) {
  ensureSuperAdmin(actor);
  const data = changeRoleSchema.parse(input);
  if (data.targetUserId === actor.id) {
    throw new UsersServiceError('You cannot change your own role');
  }
  if (data.role === 'SUPER_ADMIN' && data.confirmation !== 'PROMOTE') {
    throw new UsersServiceError('Type PROMOTE to confirm super-admin access');
  }
  return transaction(db, async (tx) => {
    const target = await usersRepository.findForMutation(tx, data.targetUserId);
    assertVersion(target, data.expectedUpdatedAt);
    if (!target || target.status === 'DEACTIVATED')
      throw new UsersServiceError('User is unavailable');
    if (target.role === 'SUPER_ADMIN' && data.role === 'STUDENT') {
      if ((await usersRepository.countSuperAdmins(tx)) <= 1) {
        throw new UsersServiceError('The last super admin cannot be demoted');
      }
    }
    const updated = await tx.user.updateMany({
      where: { id: data.targetUserId, updatedAt: data.expectedUpdatedAt },
      data: { role: data.role },
    });
    if (updated.count !== 1)
      throw new UsersServiceError('This user was updated by someone else, refresh');
    await recordAuditLog(tx, {
      action: 'USER_ROLE_CHANGED',
      actorId: actor.id,
      targetEntity: 'User',
      targetEntityId: data.targetUserId,
      metadata: { role: data.role },
    });
  });
}

export async function suspendUser(actor: SuperAdmin, input: unknown, db: UsersDb = prisma) {
  ensureSuperAdmin(actor);
  const data = suspendUserSchema.parse(input);
  if (data.targetUserId === actor.id) throw new UsersServiceError('You cannot suspend yourself');
  return transaction(db, async (tx) => {
    const target = await usersRepository.findForMutation(tx, data.targetUserId);
    assertVersion(target, data.expectedUpdatedAt);
    if (!target || target.status === 'DEACTIVATED')
      throw new UsersServiceError('User is unavailable');
    if (target.role === 'SUPER_ADMIN' && (await usersRepository.countSuperAdmins(tx)) <= 1) {
      throw new UsersServiceError('The last super admin cannot be suspended');
    }
    const updated = await tx.user.updateMany({
      where: { id: data.targetUserId, updatedAt: data.expectedUpdatedAt },
      data: { status: 'SUSPENDED', suspendedAt: new Date(), suspendedReason: data.reason },
    });
    if (updated.count !== 1)
      throw new UsersServiceError('This user was updated by someone else, refresh');
    await recordAuditLog(tx, {
      action: 'USER_SUSPENDED',
      actorId: actor.id,
      targetEntity: 'User',
      targetEntityId: data.targetUserId,
      metadata: { reason: data.reason },
    });
  });
}

export async function reactivateUser(actor: SuperAdmin, input: unknown, db: UsersDb = prisma) {
  ensureSuperAdmin(actor);
  const data = reactivateUserSchema.parse(input);
  return transaction(db, async (tx) => {
    const target = await usersRepository.findForMutation(tx, data.targetUserId);
    assertVersion(target, data.expectedUpdatedAt);
    if (!target || target.status !== 'SUSPENDED')
      throw new UsersServiceError('User is not suspended');
    const updated = await tx.user.updateMany({
      where: { id: data.targetUserId, updatedAt: data.expectedUpdatedAt },
      data: { status: 'ACTIVE', suspendedAt: null, suspendedReason: null },
    });
    if (updated.count !== 1)
      throw new UsersServiceError('This user was updated by someone else, refresh');
    await recordAuditLog(tx, {
      action: 'USER_REACTIVATED',
      actorId: actor.id,
      targetEntity: 'User',
      targetEntityId: data.targetUserId,
      metadata: { note: data.note },
    });
  });
}

export { USERS_PAGE_SIZE, usersQuerySchema };
