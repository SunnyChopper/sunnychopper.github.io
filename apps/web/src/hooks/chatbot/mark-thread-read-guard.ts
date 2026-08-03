/**
 * Guards auto mark-read so each server thread is scheduled at most once per visit.
 */
export function shouldScheduleMarkThreadRead(
  threadId: string | undefined,
  markedThreadId: string | null
): threadId is string {
  return Boolean(threadId) && threadId !== markedThreadId;
}

export function nextMarkedThreadReadId(
  threadId: string | undefined,
  markedThreadId: string | null
): string | null {
  if (!threadId) {
    return null;
  }
  if (!shouldScheduleMarkThreadRead(threadId, markedThreadId)) {
    return markedThreadId;
  }
  return threadId;
}
