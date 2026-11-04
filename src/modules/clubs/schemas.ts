import { z } from 'zod';

const text = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max);

export const clubProposalSchema = z.object({
  name: text('Name', 160),
  description: text('Description', 5000),
  purpose: text('Purpose', 5000),
  activities: z.array(text('Activity', 160)).min(1).max(12),
  category: text('Category', 80),
  logoUrl: z.string().url().max(2048).optional().or(z.literal('')),
});

export const clubProfileSchema = clubProposalSchema.partial().extend({
  name: text('Name', 160).optional(),
});

export const reviewSchema = z.discriminatedUnion('decision', [
  z.object({ decision: z.literal('approve') }),
  z.object({ decision: z.literal('reject'), reason: text('Rejection reason', 2000) }),
  z.object({ decision: z.literal('request-changes'), reason: text('Change request reason', 2000) }),
]);

export type ClubProposalInput = z.infer<typeof clubProposalSchema>;
export type ClubProfileInput = z.infer<typeof clubProfileSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
