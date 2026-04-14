import { useCallback, useEffect, useRef, useState } from 'react';

// 倒计时任务 Hook：负责计时、完成状态与清理
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

  // 启动倒计时（防止重复启动）
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
