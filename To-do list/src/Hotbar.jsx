import './Hotbar.css';
import bookIcon from './assets/Book_and_Quill_JE2_BE2.png';
import clockIcon from './assets/Clock_JE3_BE3.gif';
import calendarIcon from './assets/Calendar.png';
import barrierIcon from './assets/Barrier__item__JE2_BE2.png';

export default function Hotbar({
  isBookOpen,
  onToggleBook,
  showClock,
  onToggleClock,
  remainingCount,
  completedCount,
  totalCount,
  onClearCompleted,
  isCalendarOpen,
  onToggleCalendar,
}) {
  const xpPercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="mc-bottom-hud">
      <div className="mc-xp-container">
        <span className="mc-xp-level">{completedCount}</span>
        <div className="mc-xp-bar">
          <div className="mc-xp-fill" style={{ width: `${xpPercent}%` }} />
        </div>
      </div>

      <div className="mc-hotbar">
        {/* Slot 1: Toggle Book & Quill */}
        <button
          className={`hotbar-slot ${isBookOpen ? 'selected' : ''}`}
          onClick={onToggleBook}
          aria-label="Toggle Book and Quill"
        >
          <span className="mc-tooltip">
            {isBookOpen ? 'Hide Book' : 'Open Book'}
          </span>
          <img
            src={bookIcon}
            alt="Book and Quill"
            className="hotbar-sprite"
          />
          {remainingCount > 0 && (
            <span className="hotbar-count">{remainingCount}</span>
          )}
        </button>

        {/* Slot 2: Toggle Clock HUD */}
        <button
          className={`hotbar-slot ${showClock ? 'selected' : ''}`}
          onClick={onToggleClock}
          aria-label="Toggle Clock"
        >
          <span className="mc-tooltip">
            {showClock ? 'Hide Clock' : 'Show Clock'}
          </span>
          <img
            src={clockIcon}
            alt="Clock"
            className="hotbar-sprite"
          />
        </button>

        {/* Slot 3: Toggle Calendar Window */}
        <button
          className={`hotbar-slot ${isCalendarOpen ? 'selected' : ''}`}
          onClick={onToggleCalendar}
          aria-label="Toggle Calendar"
        >
          <span className="mc-tooltip">
            {isCalendarOpen ? 'Hide Calendar' : 'Open Calendar'}
          </span>
          <img
            src={calendarIcon}
            alt="Calendar"
            className="hotbar-sprite"
            style={{ width: '100px', height: '70px', objectFit: 'contain' }}
          />
        </button>

        {/* Slots 4-8: Empty Hotbar Slots */}
        {[4, 5, 6, 7, 8].map((slot) => (
          <div key={slot} className="hotbar-slot empty" />
        ))}
        {/*This is still under construction type shit, so I will add more features to the hotbar later.*/}

        {/* Slot 9: Clear Completed Tasks */}
        <button
          className="hotbar-slot"
          onClick={onClearCompleted}
          aria-label="Clear Completed Tasks"
        >
          <span className="mc-tooltip">Clear Completed ({completedCount})</span>
          <img
            src={barrierIcon}
            alt="Clear Completed"
            className="hotbar-sprite"
          />
        </button>
      </div>
    </div>
  );
}