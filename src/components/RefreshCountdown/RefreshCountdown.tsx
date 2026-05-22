import React, { useEffect, useState } from 'react';
import './RefreshCountdown.css';

interface RefreshCountdownProps {
  nextRefreshAt: number;
}

export function RefreshCountdown({ nextRefreshAt }: RefreshCountdownProps): React.ReactElement {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil((nextRefreshAt - Date.now()) / 1000))
  );

  useEffect(() => {
    setSecondsLeft(Math.max(0, Math.ceil((nextRefreshAt - Date.now()) / 1000)));
    const interval = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.ceil((nextRefreshAt - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [nextRefreshAt]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="refresh-countdown">
      Refresh in <span className="refresh-countdown-timer">{display}</span>
    </div>
  );
}
