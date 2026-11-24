import { NextResponse } from 'next/server';

// In-memory task storage (Section 5)
let tasks = [];

// GET /api/tasks - Fetch all tasks
export async function GET() {
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

    const newTask = {
      id: Date.now(),
      text: text.trim(),
      dueDate,
      dueTime,
      completed: false,
      notified: false, // Ready for Section 8 polling reminders
    };

    tasks.push(newTask);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
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

    return NextResponse.json(tasks[taskIndex], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 400 }
    );
  }
}

// DELETE /api/tasks - Delete one task (?id=123 or JSON body) or clear completed
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id');

    let body = {};
    try {
      body = await request.json();
    } catch {
      // Allows DELETE requests with only query params (e.g. from Postman)
    }

    if (body.clearCompleted) {
      tasks = tasks.filter((t) => !t.completed);
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

    return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}