import type { ClubStatus, MembershipRole, MembershipStatus } from '@prisma/client';

export function membershipLabel(
  role: MembershipRole,
  status: MembershipStatus,
): 'Club admin' | 'Member' | 'Pending approval' | 'Suspended' | 'Graduated' {
  if (status === 'PENDING') return 'Pending approval';
  if (status === 'SUSPENDED') return 'Suspended';
  if (status === 'GRADUATED') return 'Graduated';
  if (role === 'CLUB_ADMIN') return 'Club admin';
  return 'Member';
}

export function proposalLabel(status: ClubStatus) {
  if (status === 'ACTIVE') return 'Live';
  if (status === 'REJECTED') return 'Rejected';
  if (status === 'SUSPENDED') return 'Suspended';
  if (status === 'CHANGES_REQUESTED') return 'In review';
  return 'Submitted';
}
