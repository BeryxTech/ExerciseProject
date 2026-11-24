'use client';

import { useState } from 'react';
import './CalendarWindow.css';

function toDateKey(year, monthIndex, day) {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export default function CalendarWindow({
  isOpen,
  onClose,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) {
  const now = new Date();
  const todayKey = toDateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const [viewDate, setViewDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [taskInput, setTaskInput] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');

  if (!isOpen) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const selectedDayTasks = tasks.filter((t) => t.dueDate === selectedDate);

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    const formattedTime = hour ? `${hour}:${minute} ${period}` : '';
    onAddTask(taskInput.trim(), selectedDate, formattedTime);
    setTaskInput('');
    setHour('');
    setMinute('00');
  };

  return (
    <div className="mc-calendar-overlay">
      <div className="mc-calendar-window">
        {/* Top Inventory Title Bar */}
        <div className="mc-calendar-header">
          <span className="mc-calendar-title">Quest Calendar</span>
          <button
            type="button"
            className="mc-btn mc-calendar-close"
            onClick={onClose}
            aria-label="Close Calendar"
          >
            X
          </button>
        </div>

        <div className="mc-calendar-body">
          {/* Left Panel: Monthly Inventory Grid */}
          <div className="mc-calendar-grid-section">
            <div className="mc-month-nav">
              <button
                type="button"
                className="mc-btn mc-nav-btn"
                onClick={handlePrevMonth}
                aria-label="Previous Month"
              >
                &lt;
              </button>
              <span className="mc-month-label">{monthLabel}</span>
              <button
                type="button"
                className="mc-btn mc-nav-btn"
                onClick={handleNextMonth}
                aria-label="Next Month"
              >
                &gt;
              </button>
            </div>

            <div className="mc-weekdays">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <div key={d} className="mc-weekday">
                  {d}
                </div>
              ))}
            </div>

            <div className="mc-days-grid">
              {calendarCells.map((day, idx) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="mc-slot-cell empty"
                    />
                  );
                }

                const cellKey = toDateKey(year, month, day);
                const dayTasks = tasks.filter((t) => t.dueDate === cellKey);
                const pendingCount = dayTasks.filter((t) => !t.completed).length;
                const isToday = cellKey === todayKey;
                const isSelected = cellKey === selectedDate;

                return (
                  <button
                    type="button"
                    key={cellKey}
                    className={`mc-slot-cell ${isSelected ? 'selected' : ''} ${
                      isToday ? 'today' : ''
                    }`}
                    onClick={() => setSelectedDate(cellKey)}
                  >
                    <span className="mc-day-num">{day}</span>
                    {pendingCount > 0 && (
                      <span className="mc-stack-count">{pendingCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Anvil-Style Deadline Creator & Quest List */}
          <div className="mc-calendar-agenda">
            <div className="mc-agenda-header">
              <span>Due:</span>
              <span className="mc-agenda-date">
                {selectedDate === todayKey ? 'Today' : selectedDate}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mc-agenda-form">
              <div className="mc-form-row">
                <input
                  type="text"
                  className="mc-anvil-input"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="Write quest..."
                />
                <button type="submit" className="mc-btn mc-add-btn">
                  +
                </button>
              </div>

              <div className="mc-time-row">
                <span className="mc-time-label">Hour:</span>
                <select
                  className="mc-anvil-select"
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
                  className="mc-anvil-select"
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
                  className="mc-anvil-select"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  disabled={!hour}
                  aria-label="AM or PM"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </form>

            <div className="mc-agenda-box">
              {selectedDayTasks.length === 0 ? (
                <div className="mc-agenda-empty">No quests scheduled.</div>
              ) : (
                <ul className="mc-agenda-list">
                  {selectedDayTasks.map((task) => (
                    <li
                      key={task.id}
                      className={`mc-agenda-item ${task.completed ? 'done' : ''}`}
                    >
                      <button
                        type="button"
                        className="mc-quest-toggle"
                        onClick={() => onToggleTask(task.id)}
                      >
                        <span className="mc-checkbox">
                          {task.completed ? '✔' : ''}
                        </span>
                        <span className="mc-quest-text">{task.text}</span>
                      </button>
                      {task.dueTime && (
                        <span className="mc-quest-time">[{task.dueTime}]</span>
                      )}
                      <button
                        type="button"
                        className="mc-agenda-del"
                        onClick={() => onDeleteTask(task.id)}
                        aria-label="Delete quest"
                      >
                        x
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}