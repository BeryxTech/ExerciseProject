import './Hotbar.css';

function PixelClockSprite() {
  return (
    <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className="hotbar-sprite">
      <rect x="5" y="2" width="6" height="12" fill="#f2c94c" />
      <rect x="3" y="4" width="10" height="8" fill="#f2c94c" />
      <rect x="2" y="5" width="12" height="6" fill="#d4a017" />
      <rect x="5" y="4" width="6" height="8" fill="#2c3e75" />
      <rect x="4" y="5" width="8" height="6" fill="#5da9e9" />
      <rect x="7" y="5" width="2" height="4" fill="#ffffff" />
      <rect x="7" y="7" width="4" height="2" fill="#ffdf38" />
    </svg>
  );
}

function PixelBroomSprite() {
  return (
    <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className="hotbar-sprite">
      <rect x="11" y="2" width="2" height="2" fill="#8b5a2b" />
      <rect x="9" y="4" width="2" height="2" fill="#8b5a2b" />
      <rect x="7" y="6" width="2" height="2" fill="#a06934" />
      <rect x="5" y="8" width="4" height="2" fill="#d4a017" />
      <rect x="3" y="10" width="6" height="3" fill="#e8c547" />
      <rect x="2" y="12" width="5" height="2" fill="#c9a227" />
    </svg>
  );
}

export default function Hotbar({
  isBookOpen,
  onToggleBook,
  showClock,
  onToggleClock,
  remainingCount,
  completedCount,
  totalCount,
  onClearCompleted,
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
            src="https://minecraft.wiki/images/Book_and_Quill_JE2_BE2.png"
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
          <PixelClockSprite />
        </button>

        {/* Slot 3: Clear Completed Tasks */}
        <button
          className="hotbar-slot"
          onClick={onClearCompleted}
          aria-label="Clear Completed Tasks"
        >
          <span className="mc-tooltip">Clear Completed ({completedCount})</span>
          <PixelBroomSprite />
        </button>

        {/* Slots 4-9: Empty Hotbar Slots */}
        {[4, 5, 6, 7, 8, 9].map((slot) => (
          <div key={slot} className="hotbar-slot empty" />
        ))}
      </div>
    </div>
  );
}