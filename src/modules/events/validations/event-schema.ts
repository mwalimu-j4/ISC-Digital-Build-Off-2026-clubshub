import { z } from 'zod';

export const eventIdSchema = z.string().uuid();
export const eventActionSchema = z.object({
  eventId: eventIdSchema,
  action: z.enum(['register', 'cancel']),
});
