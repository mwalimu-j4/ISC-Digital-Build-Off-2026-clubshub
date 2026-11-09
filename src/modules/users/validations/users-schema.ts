import { z } from 'zod';

import {
  REACTIVATION_NOTE_MIN_LENGTH,
  SUSPENSION_REASON_MIN_LENGTH,
} from '@/modules/users/constants';

export const usersQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(''),
  role: z.enum(['ALL', 'STUDENT', 'CLUB_ADMIN', 'SUPER_ADMIN']).default('ALL'),
  status: z.enum(['ALL', 'ACTIVE', 'SUSPENDED']).default('ALL'),
  sort: z.enum(['newest', 'name']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  user: z.string().uuid().optional(),
});

export const changeRoleSchema = z.object({
  targetUserId: z.string().uuid(),
  role: z.enum(['STUDENT', 'SUPER_ADMIN']),
  confirmation: z.string().optional(),
  expectedUpdatedAt: z.coerce.date(),
});

export const suspendUserSchema = z.object({
  targetUserId: z.string().uuid(),
  reason: z.string().trim().min(SUSPENSION_REASON_MIN_LENGTH).max(500),
  expectedUpdatedAt: z.coerce.date(),
});

export const reactivateUserSchema = z.object({
  targetUserId: z.string().uuid(),
  note: z.string().trim().min(REACTIVATION_NOTE_MIN_LENGTH).max(500),
  expectedUpdatedAt: z.coerce.date(),
});

export type UsersQuery = z.infer<typeof usersQuerySchema>;
