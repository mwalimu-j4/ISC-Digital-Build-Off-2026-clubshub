import { NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import { getItems, getMyReports, getStats, LostFoundServiceError, submitFoundReport, submitLostReport } from '@/modules/lost-found/service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    if (searchParams.get('stats') === 'true') {
      return NextResponse.json(await getStats());
    }

    if (searchParams.get('my') === 'true') {
      const session = await getCurrentSession();
      if (!session?.user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      const items = await getMyReports(session.user);
      return NextResponse.json(items);
    }

    const items = await getItems({
      reportType: searchParams.get('reportType') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      campusArea: searchParams.get('campusArea') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      cursor: searchParams.get('cursor') ?? undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    });

    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const reportType = body.reportType;

    let item;
    if (reportType === 'LOST') {
      item = await submitLostReport(session.user, body);
    } else if (reportType === 'FOUND') {
      item = await submitFoundReport(session.user, body);
    } else {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof LostFoundServiceError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    // eslint-disable-next-line no-console
    console.error('Report submission failed:', error);
    return NextResponse.json({ error: 'Failed to submit report. Please try again.' }, { status: 400 });
  }
}
