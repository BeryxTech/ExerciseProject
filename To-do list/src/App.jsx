import { useState } from 'react';
import './App.css';
import bgVideo from './assets/minecraft-fireflies-forest-moewalls-com.mp4';
import FireflyCursor from './fireflycursor';
import ClockHud from './ClockHud';
import TodoBook from './TodoBook';
import Hotbar from './Hotbar';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isBookOpen, setIsBookOpen] = useState(true);
  const [showClock, setShowClock] = useState(true);

  const completedCount = tasks.filter((t) => t.completed).length;
  const remainingCount = tasks.length - completedCount;

  const addTask = (text) => {
    const newTask = {
      id: Date.now(),
      text,
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

      {showClock && <ClockHud remainingCount={remainingCount} />}

      {isBookOpen && (
        <TodoBook
          tasks={tasks}
          onAddTask={addTask}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
        />
      )}

      <Hotbar
        isBookOpen={isBookOpen}
        onToggleBook={() => setIsBookOpen((prev) => !prev)}
        showClock={showClock}
        onToggleClock={() => setShowClock((prev) => !prev)}
        remainingCount={remainingCount}
        completedCount={completedCount}
        totalCount={tasks.length}
        onClearCompleted={clearCompleted}
      />
    </>
  );
}