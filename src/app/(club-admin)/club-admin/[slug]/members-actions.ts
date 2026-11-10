'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/database/prisma';
import { requireUser } from '@/lib/auth/authorization';

const statuses = ['APPROVED', 'LEFT', 'SUSPENDED', 'GRADUATED'] as const;

export async function updateMember(formData: FormData) {
  const user = await requireUser();
  const slug = String(formData.get('slug') ?? '');
  const membershipId = String(formData.get('membershipId') ?? '');
  const officialRole = String(formData.get('officialRole') ?? '').trim();
  const club = await prisma.club.findFirst({ where: { slug, memberships: { some: { userId: user.id, role: 'CLUB_ADMIN', status: 'APPROVED' } } }, select: { id: true } });
  if (!club || !membershipId || officialRole.length > 80) throw new Error('Invalid member update.');
  const result = await prisma.clubMembership.updateMany({ where: { id: membershipId, clubId: club.id, status: { in: [...statuses] } }, data: { officialRole: officialRole || null } });
  if (!result.count) throw new Error('Member was not found.');
  revalidatePath(`/club-admin/${slug}/members`);
}

export async function updateMemberStatus(formData: FormData) {
  const user = await requireUser();
  const slug = String(formData.get('slug') ?? '');
  const membershipId = String(formData.get('membershipId') ?? '');
  const nextStatus = String(formData.get('status') ?? '');
  if (!statuses.includes(nextStatus as (typeof statuses)[number])) throw new Error('Invalid membership status.');
  const club = await prisma.club.findFirst({ where: { slug, memberships: { some: { userId: user.id, role: 'CLUB_ADMIN', status: 'APPROVED' } } }, select: { id: true } });
  if (!club || !membershipId) throw new Error('Invalid member update.');
  const result = await prisma.clubMembership.updateMany({ where: { id: membershipId, clubId: club.id, status: { in: [...statuses] } }, data: { status: nextStatus as (typeof statuses)[number] } });
  if (!result.count) throw new Error('Member was not found.');
  revalidatePath(`/club-admin/${slug}/members`);
  revalidatePath(`/club-admin/${slug}`);
}
