/**
 * Coalesce rapid progress ticks so UI updates at most every `minIntervalMs`.
 * Emits 0 immediately on creation; always emits 100 on complete.
 */
export function createMinIntervalProgress(
  onProgress: (percent: number) => void,
  minIntervalMs = 200
): {
  report: (percent: number) => void;
  complete: () => void;
  dispose: () => void;
} {
  let latest = 0;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let disposed = false;

  const flush = () => {
    if (disposed) return;
    onProgress(latest);
  };

  onProgress(0);

  intervalId = setInterval(flush, minIntervalMs);

  return {
    report(percent: number) {
      if (disposed) return;
      latest = Math.min(100, Math.max(0, percent));
    },
    complete() {
      if (disposed) return;
      latest = 100;
      flush();
      disposed = true;
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
}
