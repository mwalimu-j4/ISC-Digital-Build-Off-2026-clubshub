import { z } from 'zod';

export const spaceIdSchema = z.union([
  z.literal('STUDENT_HOME'),
  z.literal('SUPER_ADMIN'),
  z.string().regex(/^CLUB:[a-z0-9-]+$/),
]);

export const rememberSpaceSchema = z.object({
  spaceId: spaceIdSchema,
  remember: z.boolean(),
});
