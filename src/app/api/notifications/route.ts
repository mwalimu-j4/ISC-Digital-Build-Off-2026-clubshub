import { NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import { getNotifications, getUnreadCount, markAllNotificationsRead, markNotificationRead } from '@/modules/lost-found/service';

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const { searchParams } = new URL(request.url);

  try {
    if (searchParams.get('count') === 'true') {
      const count = await getUnreadCount(session.user);
      return NextResponse.json({ count });
    }

    const notifications = await getNotifications(session.user, 30);
    return NextResponse.json(notifications);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json();

  try {
    if (body.action === 'mark-read' && body.id) {
      await markNotificationRead(session.user, body.id);
      return NextResponse.json({ success: true });
    }

    if (body.action === 'mark-all-read') {
      await markAllNotificationsRead(session.user);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
