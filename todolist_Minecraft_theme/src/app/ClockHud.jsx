'use client';

import { useState, useEffect } from 'react';
import './ClockHud.css';

// Loads frame_000.png through frame_063.png in exact numerical order
const clockFrames = Array.from(
  { length: 64 },
  (_, i) => `/Clock_Frame/frame_${String(i).padStart(3, '0')}.png`
);

export default function ClockHud({ remainingCount }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return null;

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