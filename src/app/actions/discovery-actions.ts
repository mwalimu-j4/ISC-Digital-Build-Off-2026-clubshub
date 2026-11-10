'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getCurrentSession } from '@/lib/auth/session';
import { INTEREST_COOKIE, parseDiscoveryQuery, saveUserInterests } from '@/modules/discovery';

export async function saveInterestPreferences(formData: FormData) {
  const clear = formData.get('clear') === '1';
  const selected = clear ? [] : formData.getAll('interest').map(String);
  const query = parseDiscoveryQuery({
    interests: selected.join(','),
    category: String(formData.get('category') ?? ''),
    sort: String(formData.get('sort') ?? 'match'),
    verified: String(formData.get('verified') ?? '0'),
    q: String(formData.get('q') ?? ''),
  });
  const cookieStore = await cookies();
  const session = await getCurrentSession();
  if (session?.user?.id) await saveUserInterests(session.user.id, query.interests);
  cookieStore.set(INTEREST_COOKIE, query.interests.join(','), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath('/');
  const params = new URLSearchParams();
  if (query.interests.length) params.set('interests', query.interests.join(','));
  if (query.category) params.set('category', query.category);
  if (query.sort !== 'match') params.set('sort', query.sort);
  if (query.verifiedOnly) params.set('verified', '1');
  if (query.q) params.set('q', query.q);
  redirect(`/${params.size ? `?${params.toString()}` : ''}#clubs-for-you`);
}
