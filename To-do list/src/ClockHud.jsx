import { useState, useEffect } from 'react';
import './ClockHud.css';

// Loads frame_000.png through frame_063.png in exact numerical order
const frameModules = import.meta.glob('./assets/Clock_Frame/*.png', {
  eager: true,
});
const clockFrames = Object.keys(frameModules)
  .sort()
  .map((path) => frameModules[path].default);

export default function ClockHud({ remainingCount }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Map 24-hour IRL time to extracted frames (frame_000 = 12:00 PM Noon)
  const secondsSinceMidnight =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const secondsSinceNoon = (secondsSinceMidnight - 43200 + 86400) % 86400;
  const frameIndex = Math.floor(
    (secondsSinceNoon / 86400) * clockFrames.length
  );

  const formattedTime = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const formattedDate = now.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="mc-clock-hud">
      <img
        src={clockFrames[frameIndex]}
        alt="Minecraft Clock"
        className="clock-icon"
      />
      <div className="clock-details">
        <span className="clock-time">{formattedTime}</span>
        <span className="clock-date">
          {formattedDate} • {remainingCount} left
        </span>
      </div>
    </div>
  );
}