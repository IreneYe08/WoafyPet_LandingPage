import { useState, useEffect } from 'react';

export function MiniCountdown() {
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
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap">
      <div className="text-xs font-semibold text-white bg-red-600 px-2 py-0.5 rounded shadow-sm">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
}