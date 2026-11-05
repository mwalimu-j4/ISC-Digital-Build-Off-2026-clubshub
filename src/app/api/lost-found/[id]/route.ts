import { NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import { getItemDetail, LostFoundServiceError, runMatching, updateItemStatus } from '@/modules/lost-found/service';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  try {
    const item = await getItemDetail(id);
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Context) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  try {
    if (body.action === 'update-status') {
      await updateItemStatus(session.user, id, { status: body.status, note: body.note });
      return NextResponse.json({ success: true });
    }

    if (body.action === 'run-matching') {
      const result = await runMatching(session.user, id);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof LostFoundServiceError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
