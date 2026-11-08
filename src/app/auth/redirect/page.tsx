import { redirect } from 'next/navigation';

import { requireUser } from '@/lib/auth/authorization';

export default async function AuthRedirectPage() {
  const user = await requireUser();
  redirect(user.role === 'SUPER_ADMIN' ? '/super-admin' : '/student');
}
