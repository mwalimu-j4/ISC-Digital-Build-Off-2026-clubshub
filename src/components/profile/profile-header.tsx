import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requireUser } from '@/lib/auth/authorization';
import { getProfile } from '@/modules/profile';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export async function ProfileHeader() {
  const user = await requireUser();
  const profile = await getProfile(user.id, user.role, user.id);

  if (!profile) {
    return null;
  }

  return (
    <div className="profile-header-card rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        <Avatar size="lg" className="size-20 sm:size-24">
          {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />}
          <AvatarFallback className="text-lg">{getInitials(profile.fullName)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{profile.fullName}</h1>
              {profile.role !== 'STUDENT' && (
                <Badge variant="secondary" className="text-xs">
                  {profile.role.replace('_', ' ')}
                </Badge>
              )}
            </div>

            {(profile.course || profile.yearOfStudy) && (
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {profile.course && <span>{profile.course}</span>}
                {profile.course && profile.yearOfStudy && <span>•</span>}
                {profile.yearOfStudy && <span>{profile.yearOfStudy}</span>}
              </div>
            )}

            {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
          </div>

          <div>
            <Button asChild>
              <Link href="/profile/settings">Edit Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
