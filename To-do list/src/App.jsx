import { useState, useEffect } from 'react';
import './App.css';
import bgVideo from './assets/minecraft-fireflies-forest-moewalls-com.mp4';
import FireflyCursor from './fireflycursor';
import ClockHud from './ClockHud';
import TodoBook from './TodoBook';
import Hotbar from './Hotbar';
import CalendarWindow from './CalendarWindow';

const STORAGE_KEY = 'mc_todo_tasks_v1';

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isBookOpen, setIsBookOpen] = useState(true);
  const [showClock, setShowClock] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('Failed to save tasks:', err);
    }
  }, [tasks]);

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

  // Defaults to today when added from the Book; uses selectedDate when added from CalendarWindow
  const addTask = (text, dueDate = todayKey, dueTime = '') => {
    const newTask = {
      id: Date.now(),
      text,
      dueDate,
      dueTime,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((task) => !task.completed));
  };

  return (
    <>
      <FireflyCursor />

      <video autoPlay muted loop playsInline id="bg-video">
        <source src={bgVideo} type="video/mp4" />
      </video>

      {showClock && <ClockHud remainingCount={remainingTodayCount} />}

      {isBookOpen && (
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
      />
    </>
  );
}