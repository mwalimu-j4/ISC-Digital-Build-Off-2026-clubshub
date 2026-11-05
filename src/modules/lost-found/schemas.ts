import { z } from 'zod';

const text = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max);

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(''));

export const lostReportSchema = z.object({
  category: z.enum([
    'IDENTIFICATION', 'ELECTRONICS', 'CLOTHING', 'BAGS_WALLETS',
    'BOOKS_STATIONERY', 'KEYS', 'JEWELRY_ACCESSORIES', 'SPORTS_EQUIPMENT',
    'DOCUMENTS', 'WATER_BOTTLES', 'HEADPHONES_EARBUDS', 'OTHER',
  ]),
  name: text('Item name', 200),
  description: text('Description', 3000),
  color: optionalText(80),
  brand: optionalText(120),
  model: optionalText(120),
  distinguishing: optionalText(2000),
  serialNumber: optionalText(160),
  campusArea: text('Campus area', 160),
  building: optionalText(160),
  specificLocation: optionalText(2000),
  locationNotes: optionalText(2000),
  dateOccurred: z.string().min(1, 'Date is required'),
  timeOccurred: optionalText(40),
  images: z.array(z.object({
    url: z.string().url(),
    publicId: z.string(),
  })).max(4).default([]),
});

export const foundReportSchema = lostReportSchema.extend({
  itemCondition: optionalText(80),
  currentHolding: optionalText(2000),
});

export const statusUpdateSchema = z.object({
  status: z.enum([
    'PENDING_REVIEW', 'VERIFIED', 'SEARCHING', 'POSSIBLE_MATCH',
    'OWNERSHIP_VERIFICATION', 'READY_FOR_COLLECTION', 'HANDED_OVER',
    'RECOVERED', 'CLOSED', 'EXPIRED', 'REJECTED',
  ]),
  note: optionalText(2000),
});

export const claimSchema = z.object({
  verificationData: z.object({
    description: text('Description', 2000),
    identifyingFeature: optionalText(1000),
    exactLocation: optionalText(500),
    approximateTime: optionalText(100),
    additionalInfo: optionalText(2000),
  }),
});

export const claimReviewSchema = z.discriminatedUnion('decision', [
  z.object({ decision: z.literal('approve') }),
  z.object({ decision: z.literal('reject'), reason: text('Reason', 2000) }),
  z.object({ decision: z.literal('request-info') }),
]);

export const recoveryTaskUpdateSchema = z.object({
  action: z.enum(['start', 'complete-found', 'complete-not-found', 'escalate', 'cancel']),
  notes: optionalText(3000),
});

export const checkpointUpdateSchema = z.object({
  checkpointId: z.string().uuid(),
  searched: z.boolean(),
  notes: optionalText(2000),
});

export const matchActionSchema = z.object({
  matchId: z.string().uuid(),
  action: z.enum(['confirm', 'reject']),
  notes: optionalText(2000),
});

export type LostReportInput = z.infer<typeof lostReportSchema>;
export type FoundReportInput = z.infer<typeof foundReportSchema>;
export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;
export type ClaimInput = z.infer<typeof claimSchema>;
export type ClaimReviewInput = z.infer<typeof claimReviewSchema>;
export type RecoveryTaskUpdateInput = z.infer<typeof recoveryTaskUpdateSchema>;
export type CheckpointUpdateInput = z.infer<typeof checkpointUpdateSchema>;
export type MatchActionInput = z.infer<typeof matchActionSchema>;
