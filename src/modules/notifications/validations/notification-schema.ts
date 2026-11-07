import { z } from 'zod';

export const notificationActionSchema = z.object({
  action: z.enum(['mark-read', 'mark-all-read']),
  id: z.string().uuid().optional(),
});
