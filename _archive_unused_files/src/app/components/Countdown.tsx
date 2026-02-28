import { useState, useEffect } from 'react';

interface CountdownProps {
  initialMinutes: number;
  onExpire?: () => void;
}

export function Countdown({ initialMinutes, onExpire }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60); // Convert to seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) {
        onExpire();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onExpire) {
            onExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

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
