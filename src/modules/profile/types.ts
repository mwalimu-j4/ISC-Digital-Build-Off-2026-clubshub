import type { User } from '@prisma/client';

export type ProfileUpdateData = {
  fullName?: string;
  course?: string;
  yearOfStudy?: string;
  bio?: string;
  avatarUrl?: string;
};

export type ProfileWithPrivacy = Omit<User, 'studentRegistrationId' | 'email'> & {
  studentRegistrationId?: string;
  email?: string;
};
