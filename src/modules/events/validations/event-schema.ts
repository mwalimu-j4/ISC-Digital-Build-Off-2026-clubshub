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
  const [datePart, timePart] = value.split('T');
  if (!datePart || !timePart) {
    throw new Error('Enter a valid date and time');
  }
  const [year = Number.NaN, month = Number.NaN, day = Number.NaN] = datePart.split('-').map(Number);
  const [hour = Number.NaN, minute = Number.NaN] = timePart.split(':').map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error('Enter a valid date and time');
  }
  const timestamp = Date.UTC(year, month - 1, day, hour - 3, minute);
  const result = new Date(timestamp);
  if (!Number.isFinite(timestamp) || Number.isNaN(result.getTime())) {
    throw new Error('Enter a valid date and time');
  }
  return result;
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
