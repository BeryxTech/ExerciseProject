'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import FireflyCursor from './fireflycursor';
import ClockHud from './ClockHud';
import TodoBook from './TodoBook';
import Hotbar from './Hotbar';
import CalendarWindow from './CalendarWindow';

function isTaskDueOrOverdue(task, now) {
  if (task.completed || task.notified || !task.dueDate) return false;

  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(now.getDate()).padStart(2, '0')}`;

  // Section 8.4: Overdue task from a previous day
  if (task.dueDate < todayKey) return true;

  // Future date or untimed task due today
  if (task.dueDate > todayKey || !task.dueTime) return false;

  const match = task.dueTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return false;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const [year, month, day] = task.dueDate.split('-').map(Number);
  const deadline = new Date(year, month - 1, day, hours, minutes, 0);

  return now >= deadline;
}

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isSubmittingRef = useRef(false);
  const notifiedIdsRef = useRef(new Set());

  const [isBookOpen, setIsBookOpen] = useState(true);
  const [showClock, setShowClock] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [notifPermission, setNotifPermission] = useState('default');

  // Sync initial Notification permission on client mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // Section 7.2: Request Windows/Browser notification permission
  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotifPermission(permission);

    if (permission === 'granted') {
      new Notification('Quest Alerts Enabled!', {
        body: 'You will receive Windows reminders when quests reach their deadline.',
        tag: 'mc-todo-welcome',
        icon: '/Clock_Frame/frame_000.png',
      });
    }
  };

  // Section 7.3 - 7.5: Show Windows Notification & handle click
  const showQuestNotification = useCallback((task) => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      Notification.permission !== 'granted'
    ) {
      return;
    }

    const notif = new Notification(`Quest Due: ${task.text}`, {
      body: task.dueTime
        ? `Scheduled for ${task.dueDate} at ${task.dueTime}`
        : `Overdue quest from ${task.dueDate}`,
      tag: `quest-${task.id}`,
      requireInteraction: true,
      icon: '/Clock_Frame/frame_000.png',
    });

    notif.onclick = () => {
      window.focus();
      setIsBookOpen(true);
      setIsCalendarOpen(false);
      notif.close();
    };
  }, []);

  // Section 8.1 - 8.5: Poll API for due/overdue tasks & mark notified
  useEffect(() => {
    const checkDueTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        if (!res.ok) return;
        const latestTasks = await res.json();
        setTasks(latestTasks);

        const now = new Date();
        for (const task of latestTasks) {
          if (
            !notifiedIdsRef.current.has(task.id) &&
            isTaskDueOrOverdue(task, now)
          ) {
            notifiedIdsRef.current.add(task.id);
            showQuestNotification(task);

            // Section 8.3: Mark notified: true in backend to prevent duplicates
            await fetch('/api/tasks', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: task.id, notified: true }),
            });
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Run immediately on page load (handles Section 8.4 overdue tasks)
    checkDueTasks();

    // Poll every 10 seconds
    const intervalId = setInterval(checkDueTasks, 10000);

    // Section 8.5: Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [showQuestNotification]);

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(now.getDate()).padStart(2, '0')}`;

  // Book & Quill only shows tasks due today (plus any unfinished overdue tasks)
  const todaysTasks = tasks.filter(
    (t) =>
      !t.dueDate ||
      t.dueDate === todayKey ||
      (t.dueDate < todayKey && !t.completed)
  );

  const completedCount = tasks.filter((t) => t.completed).length;
  const remainingTodayCount = todaysTasks.filter((t) => !t.completed).length;

  // POST new task to API + prevent double submit
  const addTask = async (text, dueDate = todayKey, dueTime = '') => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, dueDate, dueTime }),
      });
      if (!res.ok) throw new Error('Failed to add task');
      const createdTask = await res.json();
      setTasks((prev) => [...prev, createdTask]);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // PATCH task completion status
  const toggleTask = async (id) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: !target.completed }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      const updatedTask = await res.json();
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // DELETE single task
  const deleteTask = async (id) => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // DELETE all completed tasks (Slot 9 Barrier button)
  const clearCompleted = async () => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearCompleted: true }),
      });
      if (!res.ok) throw new Error('Failed to clear completed tasks');
      setTasks((prev) => prev.filter((task) => !task.completed));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <>
      <FireflyCursor />

      <video autoPlay muted loop playsInline id="bg-video">
        <source src="/minecraft-fireflies-forest-moewalls-com.mp4" type="video/mp4" />
      </video>

      {showClock && <ClockHud remainingCount={remainingTodayCount} />}

      {!isLoading && isBookOpen && (
        <TodoBook
          tasks={todaysTasks}
          onAddTask={addTask}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
        />
      )}

      <CalendarWindow
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        tasks={tasks}
        onAddTask={addTask}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
      />

      <Hotbar
        isBookOpen={isBookOpen}
        onToggleBook={() => {
          setIsBookOpen((prev) => !prev);
          setIsCalendarOpen(false);
        }}
        showClock={showClock}
        onToggleClock={() => setShowClock((prev) => !prev)}
        isCalendarOpen={isCalendarOpen}
        onToggleCalendar={() => {
          setIsCalendarOpen((prev) => !prev);
          setIsBookOpen(false);
        }}
        remainingCount={remainingTodayCount}
        completedCount={completedCount}
        totalCount={tasks.length}
        onClearCompleted={clearCompleted}
        notifPermission={notifPermission}
        onRequestNotifPermission={requestNotificationPermission}
      />
    </>
  );
}