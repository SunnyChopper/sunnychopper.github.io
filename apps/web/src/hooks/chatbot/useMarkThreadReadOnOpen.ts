import { useEffect, useRef } from 'react';
import { nextMarkedThreadReadId } from '@/hooks/chatbot/mark-thread-read-guard';

/**
 * Marks an assistant thread read once when opened.
 * Guards against unstable mutation-object deps re-firing mark-read on every render.
 */
export function useMarkThreadReadOnOpen(
  threadId: string | undefined,
  markThreadRead: (threadId: string) => void,
): void {
  const lastMarkedThreadIdRef = useRef<string | null>(null);

  useEffect(() => {
    const nextMarkedId = nextMarkedThreadReadId(threadId, lastMarkedThreadIdRef.current);
    lastMarkedThreadIdRef.current = nextMarkedId;
    if (!threadId || nextMarkedId !== threadId) {
      return;
    }
    markThreadRead(threadId);
  }, [markThreadRead, threadId]);
}
