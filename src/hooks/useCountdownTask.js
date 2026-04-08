import { useCallback, useEffect, useRef, useState } from 'react';

export function useCountdownTask({ duration, onComplete }) {
  const [countdown, setCountdown] = useState(0);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const start = useCallback(() => {
    if (completed || countdown > 0) {
      return;
    }

    setCountdown(duration);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setCompleted(true);
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [completed, countdown, duration]);

  return {
    countdown,
    completed,
    start,
  };
}
