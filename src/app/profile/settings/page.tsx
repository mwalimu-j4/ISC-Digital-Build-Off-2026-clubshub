import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { requireUser } from '@/lib/auth/authorization';
import { getProfile, updateProfile } from '@/modules/profile';

async function handleUpdateProfile(formData: FormData) {
  'use server';

  const user = await requireUser();

  const fullName = formData.get('fullName') as string;
  const avatarUrl = formData.get('avatarUrl') as string;
  const bio = formData.get('bio') as string;
  const course = formData.get('course') as string;
  const yearOfStudy = formData.get('yearOfStudy') as string;

  try {
    await updateProfile(
      { id: user.id, role: user.role },
      {
        fullName,
        avatarUrl: avatarUrl || undefined,
        bio: bio || undefined,
        course: course || undefined,
        yearOfStudy: yearOfStudy || undefined,
      },
    );

    revalidatePath('/profile');
    revalidatePath('/profile/settings');
    redirect('/profile?updated=true');
  } catch (error) {
    // In production, would use a toast notification system
    // For now, redirect with error parameter
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    redirect(`/profile/settings?error=${encodeURIComponent(message)}`);
  }
}

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id, user.role, user.id);

  if (!profile) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Profile Settings</h2>
        <p className="text-sm text-muted-foreground">
          Update your personal information and profile details
        </p>
      </div>

      <form action={handleUpdateProfile} className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              defaultValue={profile.fullName}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              minLength={2}
              maxLength={160}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="avatarUrl" className="text-sm font-medium">
              Avatar URL
            </label>
            <input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              defaultValue={profile.avatarUrl || ''}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              maxLength={2048}
              placeholder="https://example.com/avatar.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Optional: URL to your profile picture
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="course" className="text-sm font-medium">
              Course
            </label>
            <input
              id="course"
              name="course"
              type="text"
              defaultValue={profile.course || ''}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              maxLength={100}
              placeholder="e.g., Bachelor of Science in Computer Science"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="yearOfStudy" className="text-sm font-medium">
              Year of Study
            </label>
            <input
              id="yearOfStudy"
              name="yearOfStudy"
              type="text"
              defaultValue={profile.yearOfStudy || ''}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              maxLength={20}
              placeholder="e.g., Year 3"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={profile.bio || ''}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              maxLength={500}
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-muted-foreground">
              Maximum 500 characters
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit">Save Changes</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/profile">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
