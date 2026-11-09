import { z } from 'zod';

import { DEPARTMENTS, schoolIdPattern } from '@/modules/join-requests/constants';

export const joinRequestSchema = z.object({
  schoolId: z.string().trim().regex(schoolIdPattern, 'Enter a valid school ID.'),
  department: z.enum(DEPARTMENTS),
  major: z.string().trim().min(2).max(80),
  yearOfStudy: z.string().trim().max(20).optional(),
  message: z.string().trim().max(280).optional(),
  saveDetails: z.boolean().default(true),
});

export const decisionSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  note: z.string().trim().max(200).optional(),
  reason: z.string().trim().min(2).max(120).optional(),
});

export type JoinRequestInput = z.infer<typeof joinRequestSchema>;
export type DecisionInput = z.infer<typeof decisionSchema>;
