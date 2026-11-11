import { z } from 'zod';

import { schoolIdPattern } from '@/modules/join-requests/constants';

export const joinRequestSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required.').max(160),
  schoolId: z.string().trim().regex(schoolIdPattern, 'Enter a valid school ID.'),
  department: z.string().trim().min(1, 'Department is required.').max(120),
  major: z.string().trim().min(2).max(80),
  saveDetails: z.boolean().default(true),
});

export const decisionSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  note: z.string().trim().max(200).optional(),
  reason: z.string().trim().min(2).max(120).optional(),
});

export type JoinRequestInput = z.infer<typeof joinRequestSchema>;
export type DecisionInput = z.infer<typeof decisionSchema>;
