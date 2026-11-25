import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Redis } from '@upstash/redis';

export const dynamic = 'force-dynamic';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

// Each browser gets its own task list via a cookie
async function getUser() {
  const jar = await cookies();
  let uid = jar.get('mc_uid')?.value;
  let isNew = false;
  if (!uid) {
    uid = crypto.randomUUID();
    isNew = true;
  }
  return { uid, isNew };
}

function reply(data, status, { uid, isNew }) {
  const res = NextResponse.json(data, { status });
  if (isNew) {
    res.cookies.set('mc_uid', uid, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

async function readTasks(uid) {
  try {
    return (await redis.get(`tasks:${uid}`)) || [];
  } catch {
    return [];
  }
}

async function writeTasks(uid, tasks) {
  await redis.set(`tasks:${uid}`, tasks);
}

// GET /api/tasks
export async function GET() {
  const user = await getUser();
  const tasks = await readTasks(user.uid);
  return reply(tasks, 200, user);
}

// POST /api/tasks
export async function POST(request) {
  const user = await getUser();
  try {
    const { text, dueDate = '', dueTime = '' } = await request.json();

    if (!text || !text.trim()) {
      return reply({ error: 'Task text is required' }, 400, user);
    }

    const tasks = await readTasks(user.uid);
    const newTask = {
      id: Date.now(),
      text: text.trim(),
      dueDate,
      dueTime,
      completed: false,
      notified: false,
    };

    tasks.push(newTask);
    await writeTasks(user.uid, tasks);
    return reply(newTask, 201, user);
  } catch (err) {
    console.error(err);
    return reply({ error: 'Failed to add task' }, 500, user);
  }
}

// PATCH /api/tasks
export async function PATCH(request) {
  const user = await getUser();
  try {
    const { id, completed, notified } = await request.json();

    const tasks = await readTasks(user.uid);
    const i = tasks.findIndex((t) => String(t.id) === String(id));
    if (i === -1) return reply({ error: 'Task not found' }, 404, user);

    const current = tasks[i];
    tasks[i] = {
      ...current,
      completed: typeof completed === 'boolean' ? completed : current.completed,
      notified: typeof notified === 'boolean' ? notified : current.notified,
    };

    await writeTasks(user.uid, tasks);
    return reply(tasks[i], 200, user);
  } catch (err) {
    console.error(err);
    return reply({ error: 'Failed to update task' }, 500, user);
  }
}

// DELETE /api/tasks
export async function DELETE(request) {
  const user = await getUser();
  try {
    const queryId = new URL(request.url).searchParams.get('id');

    let body = {};
    try {
      body = await request.json();
    } catch {}

    let tasks = await readTasks(user.uid);

    if (body.clearCompleted) {
      tasks = tasks.filter((t) => !t.completed);
      await writeTasks(user.uid, tasks);
      return reply({ message: 'Completed tasks cleared', tasks }, 200, user);
    }

    const targetId = queryId || body.id;
    if (!targetId) return reply({ error: 'Task ID is required' }, 400, user);

    const before = tasks.length;
    tasks = tasks.filter((t) => String(t.id) !== String(targetId));
    if (tasks.length === before) {
      return reply({ error: 'Task not found' }, 404, user);
    }

    await writeTasks(user.uid, tasks);
    return reply({ message: 'Task deleted' }, 200, user);
  } catch (err) {
    console.error(err);
    return reply({ error: 'Failed to delete task' }, 500, user);
  }
}