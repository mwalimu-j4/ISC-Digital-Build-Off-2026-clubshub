import { redirect } from 'next/navigation';

import { requireUser } from '@/lib/auth/authorization';
import { listClubAdminClubs } from '@/modules/club-admin-overview';

export default async function AuthRedirectPage() {
  const user = await requireUser();
  if (user.role === 'SUPER_ADMIN') redirect('/super-admin');
  const clubs = await listClubAdminClubs(user);
  if (clubs[0]) redirect(`/club-admin/${clubs[0].slug}`);
  redirect('/student');
}
