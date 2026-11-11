import { z } from 'zod';

export const announcementIdSchema = z.string().uuid();
export const announcementAudienceSchema = z.enum(['MEMBERS', 'UNIVERSITY']);

export const announcementInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(1).max(5000),
  audience: announcementAudienceSchema.default('MEMBERS'),
  pinned: z.boolean().default(false),
});
