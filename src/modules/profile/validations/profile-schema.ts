import { z } from 'zod';

const text = (label: string, max: number) =>
  z.string().trim().min(1, `${label} is required`).max(max);

export const updateProfileSchema = z.object({
  fullName: text('Full name', 160),
  course: z.string().trim().max(100).optional().or(z.literal('')),
  yearOfStudy: z.string().trim().max(20).optional().or(z.literal('')),
  bio: z.string().trim().max(500).optional().or(z.literal('')),
  avatarUrl: z.string().url().max(2048).optional().or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
