import { useState, useEffect } from 'react';
import './TodoBook.css';
import clockIcon from './assets/Clock_Frame/frame_000.png';

const TASKS_PER_PAGE = 6;

function getUrgencyClass(task, now) {
  if (task.completed || !task.dueDate) return 'normal';

  const todayKey = now.toLocaleDateString('en-CA');
  if (task.dueDate < todayKey) return 'overdue';

  if (!task.dueTime) return 'normal';

  const match = task.dueTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 'normal';

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const [year, month, day] = task.dueDate.split('-').map(Number);
  const deadline = new Date(year, month - 1, day, hours, minutes, 0);
  const diffHours = (deadline - now) / (1000 * 60 * 60);

  if (diffHours < 0) return 'overdue';
  if (diffHours <= 2) return 'urgent-2h';
  if (diffHours <= 6) return 'urgent-6h';
  return 'normal';
}

export default function TodoBook({ tasks, onAddTask, onToggleTask, onDeleteTask }) {
  const [inputValue, setInputValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all'); // 'all' | 'done'
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'done') return task.completed;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / TASKS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const start = (safeCurrentPage - 1) * TASKS_PER_PAGE;
  const visibleTasks = filteredTasks.slice(start, start + TASKS_PER_PAGE);

  const submitTask = () => {
    const taskText = inputValue.trim();
    if (taskText === '') return;

    const formattedTime = hour ? `${hour}:${minute} ${period}` : '';
    onAddTask(taskText, undefined, formattedTime);

    setInputValue('');
    setHour('');
    setMinute('00');
    setShowTimePicker(false);
    setFilter('all');
    setCurrentPage(Math.max(1, Math.ceil((tasks.length + 1) / TASKS_PER_PAGE)));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      submitTask();
    }
  };

  const changeFilter = (nextFilter) => {
    setFilter(nextFilter);
    setCurrentPage(1);
  };

  const todayKey = now.toLocaleDateString('en-CA');

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
            className={`filter-tab ${filter === 'done' ? 'active' : ''}`}
            onClick={() => changeFilter('done')}
          >
            Done
          </button>
        </div>

        <div className="page-nr">
          Page {safeCurrentPage} of {totalPages}
        </div>

        <h1>{filter === 'done' ? 'Finished Task' : 'To-Do List Today'}</h1>

        {filter !== 'done' && (
          <div className="book-add-section">
            <div className="book-input-row">
              <input
                type="text"
                placeholder="Add a new task..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className={`clock-toggle-btn ${showTimePicker || hour ? 'active' : ''}`}
                onClick={() => setShowTimePicker((prev) => !prev)}
                title="Set due time"
                aria-label="Set due time"
              >
                {/* Swap src below with your own clock sprite path */}
                <img
                  src={clockIcon}
                  alt="Clock"
                  className="book-clock-sprite"
                />
              </button>
            </div>

            {showTimePicker && (
              <div className="book-time-row">
                <span>Time:</span>
                <select
                  className="book-select"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  aria-label="Hour"
                >
                  <option value="">--</option>
                  {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
                    <option key={h} value={String(h)}>
                      {h}
                    </option>
                  ))}
                </select>
                <span>:</span>
                <select
                  className="book-select"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  disabled={!hour}
                  aria-label="Minute"
                >
                  {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(
                    (m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    )
                  )}
                </select>
                <select
                  className="book-select"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  disabled={!hour}
                  aria-label="AM or PM"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            )}
          </div>
        )}

        <ul>
          {visibleTasks.map((task) => {
            const urgency = getUrgencyClass(task, now);
            return (
              <li
                key={task.id}
                className={`${task.completed ? 'completed' : ''} urgency-${urgency}`}
              >
                <span className="task-text" onClick={() => onToggleTask(task.id)}>
                  {task.text}
                  {task.dueDate && task.dueDate < todayKey && !task.completed && (
                    <small style={{ marginLeft: '5px' }}>
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
            );
          })}
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