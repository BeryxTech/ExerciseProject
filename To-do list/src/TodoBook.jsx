import { useState } from 'react';
import './TodoBook.css';

const TASKS_PER_PAGE = 6;

export default function TodoBook({ tasks, onAddTask, onToggleTask, onDeleteTask }) {
  const [inputValue, setInputValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'done'

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'done') return task.completed;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / TASKS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const start = (safeCurrentPage - 1) * TASKS_PER_PAGE;
  const visibleTasks = filteredTasks.slice(start, start + TASKS_PER_PAGE);

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;

    const taskText = inputValue.trim();
    if (taskText === '') return;

    onAddTask(taskText);
    setInputValue('');
    setFilter('all');
    setCurrentPage(Math.max(1, Math.ceil((tasks.length + 1) / TASKS_PER_PAGE)));
  };

  const changeFilter = (nextFilter) => {
    setFilter(nextFilter);
    setCurrentPage(1);
  };

  return (
    <div className="book-stage">
      <div className="box">
        <div className="book-filters">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => changeFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => changeFilter('active')}
          >
            Todo
          </button>
          <button
            className={`filter-tab ${filter === 'done' ? 'active' : ''}`}
            onClick={() => changeFilter('done')}
          >
            Done
          </button>
        </div>

        <div className="page-nr">
          Page {safeCurrentPage} of {totalPages}
        </div>

        <h1>To-Do List Today</h1>
        <input
          type="text"
          placeholder="Add a new task..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <ul>
          {visibleTasks.map((task) => (
            <li key={task.id} className={task.completed ? 'completed' : ''}>
              <span className="task-text" onClick={() => onToggleTask(task.id)}>
                {task.text}
                {task.dueDate && task.dueDate < new Date().toLocaleDateString('en-CA') && !task.completed && (
                  <small style={{ color: '#a82828', marginLeft: '6px' }}>
                    ({task.dueDate.slice(5)})
                  </small>
                )}
              </span>

              <div className="task-right">
                {task.dueTime && (
                  <span className="task-time">[{task.dueTime}]</span>
                )}
                <button
                  className="delete-btn"
                  aria-label="Delete task"
                  onClick={() => onDeleteTask(task.id)}
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button
          className="page-btn prev"
          aria-label="Previous page"
          disabled={safeCurrentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        />
        <button
          className="page-btn next"
          aria-label="Next page"
          disabled={safeCurrentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>
    </div>
  );
}