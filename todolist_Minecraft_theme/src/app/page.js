'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import FireflyCursor from './fireflycursor';
import ClockHud from './ClockHud';
import TodoBook from './TodoBook';
import Hotbar from './Hotbar';
import CalendarWindow from './CalendarWindow';
import QuestAlerts from './QuestAlerts';
import {
  playClick,
  playBell,
  playXpOrb,
  playLevelUp,
  setFireflyAmbience,
} from './sounds';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isSubmittingRef = useRef(false);

  const [isBookOpen, setIsBookOpen] = useState(true);
  const [showClock, setShowClock] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [notifPermission, setNotifPermission] = useState('default');
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  useEffect(() => {
      setFireflyAmbience(true);

      if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotifPermission(Notification.permission);
        if (Notification.permission === 'granted') {
          setAlertsEnabled(true);
        }
      }

      return () => {
        setFireflyAmbience(false);
      };
    }, []);

  const handleToggleAlerts = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      playClick();
      alert('This browser does not support desktop notifications.');
      return;
    }

    if (Notification.permission === 'granted') {
      setNotifPermission('granted');
      setAlertsEnabled((prev) => {
        const next = !prev;
        if (next) {
          playBell();
        } else {
          playClick();
        }
        return next;
      });
      return;
    }

    playClick();
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);

    if (permission === 'granted') {
      setAlertsEnabled(true);
      playBell();
      new Notification('Quest Alerts Enabled!', {
        body: 'You will receive Windows reminders when quests reach their deadline.',
        tag: 'mc-todo-welcome',
        icon: '/Clock_Frame/frame_000.png',
      });
    }
  };

  const handleSyncTasks = useCallback((latestTasks) => {
    setTasks((prev) => [
      ...latestTasks,
      ...prev.filter((t) => String(t.id).startsWith('temp-')),
    ]);
    setIsLoading(false);
  }, []);

  const handleFocusBook = useCallback(() => {
    setIsBookOpen(true);
    setIsCalendarOpen(false);
  }, []);

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(now.getDate()).padStart(2, '0')}`;

  const todaysTasks = tasks.filter(
    (t) =>
      !t.dueDate ||
      t.dueDate === todayKey ||
      (t.dueDate < todayKey && !t.completed)
  );

  const completedCount = tasks.filter((t) => t.completed).length;
  const remainingTodayCount = todaysTasks.filter((t) => !t.completed).length;

  const addTask = async (text, dueDate = todayKey, dueTime = '') => {
    const tempId = `temp-${Date.now()}`;
    setTasks((prev) => [
      ...prev,
      { id: tempId, text, dueDate, dueTime, completed: false, notified: false },
    ]);
    playClick();

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, dueDate, dueTime }),
      });
      if (!res.ok) throw new Error('Failed to add task');
      const created = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
    } catch (err) {
      console.error(err);
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
    }
  };

  const toggleTask = async (id) => {
    const target = tasks.find((t) => t.id === id);
    if (!target || String(id).startsWith('temp-')) return;
    const nextCompleted = !target.completed;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t))
    );

    if (nextCompleted) {
      (completedCount + 1) % 5 === 0 ? playLevelUp() : playXpOrb();
    } else {
      playClick();
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: nextCompleted }),
      });
      if (!res.ok) throw new Error('Failed to update task');
    } catch (err) {
      console.error(err);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !nextCompleted } : t))
      );
    }
  };

  const deleteTask = async (id) => {
    if (String(id).startsWith('temp-')) return;
    const snapshot = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    playClick();

    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
    } catch (err) {
      console.error(err);
      setTasks(snapshot);
    }
  };

  const clearCompleted = async () => {
    const snapshot = tasks;
    setTasks((prev) => prev.filter((t) => !t.completed));
    playClick();

    try {
      const res = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearCompleted: true }),
      });
      if (!res.ok) throw new Error('Failed to clear completed tasks');
    } catch (err) {
      console.error(err);
      setTasks(snapshot);
    }
  };
  return (
    <>
      <FireflyCursor />

      <QuestAlerts
        alertsEnabled={alertsEnabled}
        onSyncTasks={handleSyncTasks}
        onFocusBook={handleFocusBook}
      />

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
        onClose={() => {
          playClick();
          setIsCalendarOpen(false);
        }}
        tasks={tasks}
        onAddTask={addTask}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
      />

      <Hotbar
        isBookOpen={isBookOpen}
        onToggleBook={() => {
          playClick();
          setIsBookOpen((prev) => !prev);
          setIsCalendarOpen(false);
        }}
        showClock={showClock}
        onToggleClock={() => {
          playClick();
          setShowClock((prev) => !prev);
        }}
        isCalendarOpen={isCalendarOpen}
        onToggleCalendar={() => {
          playClick();
          setIsCalendarOpen((prev) => !prev);
          setIsBookOpen(false);
        }}
        remainingCount={remainingTodayCount}
        completedCount={completedCount}
        totalCount={tasks.length}
        onClearCompleted={clearCompleted}
        alertsEnabled={alertsEnabled}
        notifPermission={notifPermission}
        onToggleAlerts={handleToggleAlerts}
      />
    </>
  );
}