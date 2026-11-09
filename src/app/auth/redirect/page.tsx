import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { requireUser } from '@/lib/auth/authorization';
import { REMEMBERED_SPACE_COOKIE, resolvePostLoginDestination } from '@/modules/spaces';

export default async function AuthRedirectPage() {
  const user = await requireUser();
  const rememberedChoice = (await cookies()).get(REMEMBERED_SPACE_COOKIE)?.value;
  redirect(await resolvePostLoginDestination(user, undefined, rememberedChoice));
}
