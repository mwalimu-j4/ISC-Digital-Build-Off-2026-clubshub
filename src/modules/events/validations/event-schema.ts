import { z } from 'zod';

export const eventIdSchema = z.string().uuid();
export const eventActionSchema = z.object({
  eventId: eventIdSchema,
  action: z.enum(['register', 'cancel']),
});

export const eventVisibilitySchema = z.enum(['DRAFT', 'MEMBERS', 'PUBLISHED']);

const localDateTimeSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Enter a valid date and time');

function parseEastAfricaTime(value: string) {
  return new Date(`${value}:00+03:00`);
}

export const eventInputSchema = z
  .object({
    clubId: eventIdSchema,
    title: z.string().trim().min(3).max(120),
    description: z.string().trim().max(5000),
    location: z.string().trim().min(1).max(200),
    startsAt: localDateTimeSchema.transform(parseEastAfricaTime),
    endsAt: localDateTimeSchema.transform(parseEastAfricaTime),
    capacity: z
      .union([z.coerce.number().int().positive(), z.literal(''), z.null()])
      .transform((value) => (value === '' || value === null ? null : value)),
    registrationDeadline: z
      .union([localDateTimeSchema, z.literal(''), z.null()])
      .transform((value) => (value === '' || value === null ? null : parseEastAfricaTime(value))),
    status: eventVisibilitySchema,
  })
  .superRefine((value, context) => {
    if (value.endsAt <= value.startsAt) {
      context.addIssue({
        code: 'custom',
        path: ['endsAt'],
        message: 'End time must be after the start time',
      });
    }
    if (value.registrationDeadline && value.registrationDeadline >= value.startsAt) {
      context.addIssue({
        code: 'custom',
        path: ['registrationDeadline'],
        message: 'Registration must close before the event starts',
      });
    }
    if (value.status === 'PUBLISHED' && value.startsAt <= new Date()) {
      context.addIssue({
        code: 'custom',
        path: ['startsAt'],
        message: 'Published events must start in the future',
      });
    }
  });
