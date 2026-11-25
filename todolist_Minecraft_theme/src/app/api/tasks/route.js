import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Points to mc-todo-nextjs/tasks.json
const DATA_FILE = path.join(process.cwd(), 'tasks.json');

// Helper: Read tasks from disk (returns [] if the file doesn't exist yet)
async function readTasks() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Helper: Save tasks array back to disk
async function writeTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}

// GET /api/tasks - Fetch all tasks
export async function GET() {
  const tasks = await readTasks();
  return NextResponse.json(tasks, { status: 200 });
}

// POST /api/tasks - Create a new task
export async function POST(request) {
  try {
    const body = await request.json();
    const { text, dueDate = '', dueTime = '' } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Task text is required' },
        { status: 400 }
      );
    }

    const tasks = await readTasks();
    const newTask = {
      id: Date.now(),
      text: text.trim(),
      dueDate,
      dueTime,
      completed: false,
      notified: false,
    };

    tasks.push(newTask);
    await writeTasks(tasks);
    return NextResponse.json(newTask, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// PATCH /api/tasks - Toggle completed or update notified flag
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, completed, notified } = body;

    const tasks = await readTasks();
    const taskIndex = tasks.findIndex((t) => String(t.id) === String(id));
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const current = tasks[taskIndex];
    tasks[taskIndex] = {
      ...current,
      completed: typeof completed === 'boolean' ? completed : current.completed,
      notified: typeof notified === 'boolean' ? notified : current.notified,
    };

    await writeTasks(tasks);
    return NextResponse.json(tasks[taskIndex], { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 400 }
    );
  }
}

// DELETE /api/tasks - Delete one task or clear completed
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id');

    let body = {};
    try {
      body = await request.json();
    } catch {
      // Allows query-param-only DELETE requests
    }

    let tasks = await readTasks();

    if (body.clearCompleted) {
      tasks = tasks.filter((t) => !t.completed);
      await writeTasks(tasks);
      return NextResponse.json(
        { message: 'Completed tasks cleared', tasks },
        { status: 200 }
      );
    }

    const targetId = queryId || body.id;
    if (!targetId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const initialLength = tasks.length;
    tasks = tasks.filter((t) => String(t.id) !== String(targetId));

    if (tasks.length === initialLength) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await writeTasks(tasks);
    return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}