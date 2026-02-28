import { useState, useEffect } from 'react';

interface PersistentCountdownProps {
  onExpire: () => void;
}

export function PersistentCountdown({ onExpire }: PersistentCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const startTimeStr = localStorage.getItem('offerStartTime');
      if (!startTimeStr) return 0;

      const startTime = parseInt(startTimeStr);
      const now = Date.now();
      const elapsed = now - startTime;
      const totalDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
      const remaining = Math.max(0, totalDuration - elapsed);

      return Math.floor(remaining / 1000); // Convert to seconds
    };

    // Initialize time left
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="inline-block">
      <div className="text-2xl font-bold text-red-600">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
}