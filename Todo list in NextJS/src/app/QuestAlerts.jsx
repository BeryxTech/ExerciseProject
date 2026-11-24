'use client';

import { useEffect, useRef, useCallback } from 'react';

function isTaskDueOrOverdue(task, now) {
  if (task.completed || task.notified || !task.dueDate) return false;

  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(now.getDate()).padStart(2, '0')}`;

  if (task.dueDate < todayKey) return true;
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

export default function QuestAlerts({ alertsEnabled, onSyncTasks, onFocusBook }) {
  const notifiedIdsRef = useRef(new Set());

  const showQuestNotification = useCallback(
    (task) => {
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
        onFocusBook();
        notif.close();
      };
    },
    [onFocusBook]
  );

  useEffect(() => {
    const checkDueTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        if (!res.ok) return;
        const latestTasks = await res.json();
        onSyncTasks(latestTasks);

        // Skip firing popups while muted from the Hotbar
        if (!alertsEnabled) return;

        const now = new Date();
        for (const task of latestTasks) {
          if (
            !notifiedIdsRef.current.has(task.id) &&
            isTaskDueOrOverdue(task, now)
          ) {
            notifiedIdsRef.current.add(task.id);
            showQuestNotification(task);

            await fetch('/api/tasks', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: task.id, notified: true }),
            });
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    checkDueTasks();
    const intervalId = setInterval(checkDueTasks, 10000);

    return () => clearInterval(intervalId);
  }, [alertsEnabled, onSyncTasks, showQuestNotification]);

  return null;
}