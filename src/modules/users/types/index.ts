import type { MembershipRole, MembershipStatus, UserRole, UserStatus } from '@prisma/client';

export type UserListItem = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  clubCount: number;
  isClubAdmin: boolean;
};

export type UserDetail = UserListItem & {
  studentRegistrationId: string;
  suspendedAt: Date | null;
  suspendedReason: string | null;
  memberships: Array<{
    id: string;
    clubId: string;
    clubName: string;
    clubSlug: string;
    role: MembershipRole;
    status: MembershipStatus;
  }>;
};

export type UsersPageData = {
  users: UserListItem[];
  total: number;
  counts: {
    students: number;
    clubAdmins: number;
    superAdmins: number;
    suspended: number;
  };
};
