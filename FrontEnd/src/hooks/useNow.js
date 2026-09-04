import { useEffect, useState } from 'react';

export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!intervalMs) return undefined;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function useToday() {
  const now = useNow(60_000);
  const today = new Date(now).toISOString().slice(0, 10);
  const yesterday = new Date(now - 86400000).toISOString().slice(0, 10);
  return { now, today, yesterday };
}

export function useDayIndex() {
  const [dayIndex] = useState(() => Math.floor(Date.now() / 86400000));
  return dayIndex;
}
