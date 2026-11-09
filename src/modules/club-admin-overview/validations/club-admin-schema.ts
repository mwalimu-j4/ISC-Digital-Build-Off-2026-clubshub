import { z } from 'zod';

export const clubAdminSlugSchema = z.string().trim().min(1).max(180);

export const clubAdminOverviewInputSchema = z.object({
  slug: clubAdminSlugSchema,
});
