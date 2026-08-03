import { useEffect, useState } from 'react';

/** Coarse elapsed timer for staged long-running UI (e.g. brainstorm ~30–60s). */
export function useElapsedMsWhile(active: boolean, tickMs = 500): number {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!active) {
      setElapsedMs(0);
      return;
    }

    const startedAt = Date.now();
    setElapsedMs(0);
    const id = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, tickMs);

    return () => window.clearInterval(id);
  }, [active, tickMs]);

  return elapsedMs;
}
