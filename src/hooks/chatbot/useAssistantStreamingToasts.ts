import { useEffect, useRef } from 'react';
import type { WsRunErrorPayload } from '@/types/chatbot';

type ShowToast = (options: {
  type: 'error';
  title: string;
  message: string;
}) => string;

export function useAssistantStreamingToasts(
  showToast: ShowToast,
  dismissToast: (id: string) => void,
  streamingError: WsRunErrorPayload | null,
  isAwaitingRunStart: boolean,
  isStreaming: boolean
) {
  const assistantErrorToastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!streamingError) {
      return;
    }
    const toastId = showToast({
      type: 'error',
      title: 'Assistant error',
      message: streamingError.message,
    });
    assistantErrorToastIdRef.current = toastId;
  }, [showToast, streamingError]);

  useEffect(() => {
    if (!(isAwaitingRunStart || isStreaming)) {
      return;
    }
    if (!assistantErrorToastIdRef.current) {
      return;
    }
    dismissToast(assistantErrorToastIdRef.current);
    assistantErrorToastIdRef.current = null;
  }, [dismissToast, isAwaitingRunStart, isStreaming]);
}
