'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  startTime?: Date;
  isRunning?: boolean;
  className?: string;
}

export default function Timer({ 
  startTime = new Date(), 
  isRunning = true,
  className = '' 
}: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const diff = Math.floor((now - start) / 1000);
      setElapsed(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isRunning]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {isRunning && (
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </div>
      )}
      <div className="font-mono text-3xl font-bold tracking-tight">
        {formatTime(elapsed)}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {isRunning ? 'Session in progress' : 'Session paused'}
      </div>
    </div>
  );
}
