import { useState, useEffect } from 'react';
import './ClockHud.css';

function PixelDayNightIcon({ isNight }) {
  return isNight ? (
    <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className="clock-icon">
      <rect x="6" y="2" width="5" height="2" fill="#e8eefc" />
      <rect x="4" y="4" width="4" height="2" fill="#e8eefc" />
      <rect x="3" y="6" width="4" height="4" fill="#cfd9f2" />
      <rect x="4" y="10" width="4" height="2" fill="#e8eefc" />
      <rect x="6" y="12" width="5" height="2" fill="#e8eefc" />
      <rect x="12" y="3" width="1" height="1" fill="#fff8a6" />
      <rect x="13" y="7" width="1" height="1" fill="#fff8a6" />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className="clock-icon">
      <rect x="5" y="5" width="6" height="6" fill="#ffdf38" />
      <rect x="6" y="6" width="4" height="4" fill="#fff48f" />
      <rect x="7" y="2" width="2" height="2" fill="#ffdf38" />
      <rect x="7" y="12" width="2" height="2" fill="#ffdf38" />
      <rect x="2" y="7" width="2" height="2" fill="#ffdf38" />
      <rect x="12" y="7" width="2" height="2" fill="#ffdf38" />
    </svg>
  );
}

export default function ClockHud({ remainingCount }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const isNight = hour >= 18 || hour < 6;
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
      <PixelDayNightIcon isNight={isNight} />
      <div className="clock-details">
        <span className="clock-time">{formattedTime}</span>
        <span className="clock-date">
          {formattedDate} • {remainingCount} left
        </span>
      </div>
    </div>
  );
}