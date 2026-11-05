import { NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import {
  getAllRecoveryTasks,
  getRecoveryTask,
  LostFoundServiceError,
  updateCheckpoint,
  updateRecoveryTask,
} from '@/modules/lost-found/service';

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (taskId) {
      const task = await getRecoveryTask(session.user, taskId);
      if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      return NextResponse.json(task);
    }

    const tasks = await getAllRecoveryTasks(session.user);
    return NextResponse.json(tasks);
  } catch (error) {
    if (error instanceof LostFoundServiceError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session?.user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json();

  try {
    if (body.type === 'checkpoint') {
      const result = await updateCheckpoint(session.user, body);
      return NextResponse.json(result);
    }

    if (body.taskId) {
      const result = await updateRecoveryTask(session.user, body.taskId, body);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    if (error instanceof LostFoundServiceError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
