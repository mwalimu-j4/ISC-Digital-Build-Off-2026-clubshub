import Link from 'next/link';
import { Suspense } from 'react';

import { Badge } from '@/components/ui/badge';
import { requireUser } from '@/lib/auth/authorization';
import { getProfileMemberships, getProfileProposedClubs } from '@/modules/profile';

async function MyMemberships() {
  const user = await requireUser();
  const memberships = await getProfileMemberships(user.id);

  if (memberships.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          You haven&apos;t joined any clubs yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {memberships.map((membership) => (
        <Link
          key={membership.id}
          href={`/clubs/${membership.club.slug}`}
          className="group rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
        >
          <div className="flex items-start gap-3">
            {membership.club.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={membership.club.logoUrl}
                alt=""
                className="size-12 rounded-md object-cover"
              />
            )}
            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="font-semibold group-hover:text-primary">
                {membership.club.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {membership.role.replace('_', ' ')}
                </Badge>
                <Badge
                  variant={
                    membership.status === 'APPROVED'
                      ? 'default'
                      : membership.status === 'PENDING'
                        ? 'secondary'
                        : 'destructive'
                  }
                  className="text-xs"
                >
                  {membership.status}
                </Badge>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

async function ProposedClubs() {
  const user = await requireUser();
  const clubs = await getProfileProposedClubs(user.id);

  if (clubs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Clubs You Proposed</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clubs.map((club) => (
          <div
            key={club.id}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-start gap-3">
              {club.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={club.logoUrl}
                  alt=""
                  className="size-12 rounded-md object-cover"
                />
              )}
              <div className="flex-1 min-w-0 space-y-2">
                <h4 className="font-semibold">{club.name}</h4>
                <Badge
                  variant={
                    club.status === 'ACTIVE'
                      ? 'default'
                      : club.status === 'PENDING'
                        ? 'secondary'
                        : club.status === 'REJECTED'
                          ? 'destructive'
                          : 'outline'
                  }
                  className="text-xs"
                >
                  {club.status}
                </Badge>
                {club.rejectionReason && (
                  <p className="text-xs text-destructive">
                    Rejected: {club.rejectionReason}
                  </p>
                )}
                {club.changeRequestReason && (
                  <p className="text-xs text-muted-foreground">
                    Changes requested: {club.changeRequestReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MembershipsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4">
          <div className="h-20 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export default function ClubsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">My Club Memberships</h2>
        <Suspense fallback={<MembershipsSkeleton />}>
          <MyMemberships />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <ProposedClubs />
      </Suspense>
    </div>
  );
}
