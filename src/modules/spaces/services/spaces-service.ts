import type { UserRole } from '@prisma/client';

import { prisma } from '@/lib/database/prisma';
import { spacesRepository } from '@/modules/spaces/repositories/spaces-repository';
import type { UserSpace } from '@/modules/spaces/types';
import { spaceIdSchema } from '@/modules/spaces/validations/spaces-schema';

type SpaceActor = { id: string; role: UserRole };

function clubSpaceId(slug: string) {
  return `CLUB:${slug}`;
}

export async function getUserSpaces(actor: SpaceActor): Promise<UserSpace[]> {
  const account = await spacesRepository.findForUser(prisma, actor.id);
  if (!account) return [];

  const spaces: UserSpace[] = [];
  if (actor.role === 'STUDENT') {
    spaces.push({
      id: 'STUDENT_HOME',
      kind: 'student',
      label: 'Student home',
      href: '/student',
      club: null,
      attentionCount: 0,
    });
  }
  if (actor.role === 'SUPER_ADMIN') {
    spaces.push({
      id: 'SUPER_ADMIN',
      kind: 'super-admin',
      label: 'Super admin console',
      href: '/super-admin',
      club: null,
      attentionCount: 0,
    });
  }

  for (const membership of account.memberships) {
    const club = membership.club;
    const clubInfo = {
      name: club.name,
      slug: club.slug,
      logoUrl: club.logoUrl,
      memberCount: club._count.memberships,
    };
    const admin = membership.role === 'CLUB_ADMIN' && membership.status === 'APPROVED';
    const approvedMember = membership.status === 'APPROVED';
    const pending = membership.status === 'PENDING';
    const suspended = membership.status === 'SUSPENDED' || club.status === 'SUSPENDED';

    spaces.push({
      id: clubSpaceId(club.slug),
      kind:
        admin && club.status === 'ACTIVE'
          ? 'admin'
          : suspended
            ? 'suspended'
            : pending
              ? 'pending'
              : 'member',
      label:
        admin && club.status === 'ACTIVE'
          ? 'Club admin'
          : suspended
            ? 'Suspended'
            : pending
              ? 'Pending approval'
              : 'Member',
      href:
        admin && club.status === 'ACTIVE'
          ? `/club-admin/${club.slug}`
          : approvedMember && !suspended
            ? `/clubs/${club.slug}`
            : null,
      club: clubInfo,
      attentionCount: admin && club.status === 'ACTIVE' ? club.memberships.length : 0,
      ...(pending ? { disabledReason: 'Waiting for the club admin to approve you' } : {}),
      ...(suspended ? { disabledReason: 'Suspended' } : {}),
    });
  }

  return spaces;
}

export function getSpaceById(spaces: UserSpace[], spaceId: string) {
  const parsed = spaceIdSchema.safeParse(spaceId);
  if (!parsed.success) return null;
  return spaces.find((space) => space.id === parsed.data) ?? null;
}

export async function resolvePostLoginDestination(
  actor: SpaceActor,
  requestedUrl?: string,
  rememberedChoice?: string,
) {
  const spaces = await getUserSpaces(actor);
  const safeRequested =
    requestedUrl && /^\/(?!\/)[a-zA-Z0-9/_?=&.-]*$/.test(requestedUrl) ? requestedUrl : null;
  if (safeRequested) {
    const allowed = spaces.some(
      (space) =>
        space.href && (safeRequested === space.href || safeRequested.startsWith(`${space.href}/`)),
    );
    if (allowed) return safeRequested;
  }
  const remembered = rememberedChoice ? getSpaceById(spaces, rememberedChoice) : null;
  if (remembered?.href) return remembered.href;
  const enterable = spaces.filter((space) => space.href);
  return enterable.length === 1 && enterable[0]?.href ? enterable[0].href : '/choose';
}
